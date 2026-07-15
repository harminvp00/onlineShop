import { Request, Response } from "express";
import * as services from "./service.js";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await services.getCategories();
    return res.status(200).json({ success: true, categories });
  } catch (error: any) {
    console.error("Get categories error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};
