import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import {
	createPost,
	getFeedPosts,
	deletePost,
	getPostById,
	createComment,
	likePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", protectedRoute, getFeedPosts);
router.get("/:id", protectedRoute, getPostById);

router.post("/create", protectedRoute, createPost);
router.post("/:id/comment", protectedRoute, createComment);
router.post("/:id/like", protectedRoute, likePost);

router.delete("/delete/:id", protectedRoute, deletePost);

export default router;
