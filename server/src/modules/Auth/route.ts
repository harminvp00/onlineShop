
import { Router } from "express";
import {
  createUser,
  loginUser,
  googleAuthRedirect,
  googleCallback,
  logoutUser,
  getCurrentUser,
  updateProfile,
} from "./controller.js";
import { requireAuth } from "../../lib/middleware.js";

const router = Router();

router.post("/create", createUser);
router.post("/login", loginUser);
router.get("/google", googleAuthRedirect);
router.get("/google/login", googleCallback);
router.post("/logout", logoutUser);
router.get("/me", requireAuth as any, getCurrentUser);
router.put("/update", requireAuth as any, updateProfile);

export default router;
