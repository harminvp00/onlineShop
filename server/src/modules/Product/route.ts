import express from "express";
import { requireAuth } from "../../lib/middleware.js";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  syncProducts,
} from "./controller.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", requireAuth as any, createProduct);
router.put("/:id", requireAuth as any, updateProduct);
router.delete("/:id", requireAuth as any, deleteProduct);
router.post("/sync", requireAuth as any, syncProducts);

export default router;
