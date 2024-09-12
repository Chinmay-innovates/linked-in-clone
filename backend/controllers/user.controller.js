import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";

/**
 * Retrieves a list of suggested user suggestions based on the current user's connections.
 *
 * @param {Object} req - The incoming HTTP request.
 * @param {Object} res - The outgoing HTTP response.
 * @return {JSON} A JSON response containing an array of suggested user objects.
 */
export const getSuggestedSuggestions = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id).select("connections");

		// find users that are already connected,and remove self from suggestions
		const suggestedUsers = await User.find({
			_id: {
				$nin: currentUser.connections,
				$ne: req.user._id,
			},
		})
			.select("name username headline profilePicture")
			.limit(4);

		res.json(suggestedUsers);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

/**
 * Retrieves the public profile of a user based on their username.
 *
 * @param {Object} req - The incoming HTTP request.
 * @param {Object} res - The outgoing HTTP response.
 * @return {Promise<void>} A JSON response containing the user's public profile.
 *                          If the user is not found, a 404 status code is returned.
 *                          If an error occurs, a 500 status code is returned with an error message.
 */
export const getPublicProfile = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username }).select(
			"-password"
		);
		if (!user) return res.status(404).json({ message: "User not found" });

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

/**
 * Updates the user's profile.
 *
 * @param {Object} req - The incoming HTTP request.
 * @param {Object} res - The outgoing HTTP response.
 * @return {Promise<void>} A JSON response containing a success message.
 *                          If an error occurs, a 500 status code is returned with an error message.
 */
export const updateProfile = async (req, res) => {
	try {
		const allowedFields = [
			"name",
			"username",
			"headline",
			"about",
			"location",
			"profilePicture",
			"bannerImg",
			"skills",
			"experience",
			"education",
		];
		const updatedData = {};

		//  Updates the specified field in the updatedData object if the corresponding field exists in the request body.
		for (const feild of allowedFields) {
			if (req.body[feild]) updatedData[feild] = req.body[feild];
		}

		if (req.body.profilePicture) {
			const result = await cloudinary.uploader.upload(req.body.profilePicture);
			updatedData.profilePicture = result.secure_url;
		}

		if (req.body.bannerImg) {
			const result = await cloudinary.uploader.upload(req.body.bannerImg);
			updatedData.bannerImg = result.secure_url;
		}
		//  Updates the user's profile with the updatedData object.
		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ $set: updatedData },
			{
				new: true,
			}
		).select("-password");

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};
