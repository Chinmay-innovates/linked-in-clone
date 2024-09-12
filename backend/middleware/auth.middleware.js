import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectedRoute = async (req, res, next) => {
	try {
		const token = req.cookies["jwt-linkedin"];
		if (!token)
			return res
				.status(401)
				.json({ message: "Unauthorized - No Token provided" });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded)
			return res
				.status(401)
				.json({ message: "Unauthorized - Invalid provided" });

		const user = await User.findById(decoded.userId).select("-password");
		if (!user) return res.status(401).json({ message: "User not found" });

		req.user = user;
		next();
	} catch (error) {
		console.error("Error in protectedRoute middleware:", error.message);
		return res.status(500).json({ message: "Internal server error" });
	}
};
