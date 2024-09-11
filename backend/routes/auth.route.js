import express from "express";
import {
	login,
	logout,
	signup,
	getCurrentUser,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", protectedRoute, getCurrentUser);
export default router;
