import express from "express";
import { requireAuth } from "../../lib/middleware.js";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "./controller.js";

const router = express.Router();

// All address routes require authentication
router.use(requireAuth as any);

router.get("/", getAddresses);
router.post("/", createAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
