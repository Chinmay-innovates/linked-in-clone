import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/email-handlers.js";

export const signup = async (req, res) => {
	try {
		const { name, email, username, password } = req.body;
		if (!name || !email || !username || !password)
			return res.status(400).json({ message: "All fields are required" });

		const existingEmail = await User.findOne({ email });
		if (existingEmail)
			return res.status(400).json({ message: "Email already exists" });

		const existingUsername = await User.findOne({ username });
		if (existingUsername)
			return res.status(400).json({ message: "Username already exists" });

		if (password.length < 6)
			return res
				.status(400)
				.json({ message: "Password must be at least 6 characters" });

		const salt = await bcrypt.genSalt(12);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = new User({ name, email, username, password: hashedPassword });
		await user.save();

		// generate token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: "3d",
		});

		res.cookie("jwt-linkedin", token, {
			httpOnly: true, //prevent XSS attacks
			maxAge: 3 * 24 * 60 * 60 * 100, //expiration time
			sameSite: "none", // prevent CSRF attacks
			secure: process.env.NODE_ENV === "production", //prevents man-in-the-middle attacks
		});

		res.status(201).json({ message: "User registered successfully" });

		//Send verification email
		const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;
		try {
			await sendWelcomeEmail(user.email, user.name, profileUrl);
		} catch (emailError) {
			console.error("Error sending welcome Email", emailError);
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		// Check if user exists
		const user = await User.findOne({ username });
		if (!user) return res.status(400).json({ message: "Invalid credentials" });

		// Check password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid credentials" });

		// Create and send token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: "3d",
		});
		await res.cookie("jwt-linkedin", token, {
			httpOnly: true,
			maxAge: 3 * 24 * 60 * 60 * 1000,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		});

		res.json({ message: "Logged in successfully" });
	} catch (error) {
		console.error("Error in login controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
export const logout = (req, res) => {
	res.cookie("jwt-linkedin");
	res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		console.error("Error in getCurrentUser controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
