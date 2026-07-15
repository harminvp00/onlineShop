import express from "express";
import { 
    createUser,
    loginUser,
    googleAuthRedirect,
    googleCallback,
    logoutUser,
    getCurrentUser
} from "./controller.js";
import { requireAuth } from "../../lib/middleware.js";

const router = express.Router();

router.post("/create", createUser);
router.post("/login", loginUser);
router.get("/google", googleAuthRedirect);
router.get("/google/login", googleCallback);
router.post("/logout", logoutUser);
router.get("/me", requireAuth as any, getCurrentUser);

export default router;