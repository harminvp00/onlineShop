import { Request, Response } from "express";
import * as services from "./service.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    const products = await services.getProducts({
      search: typeof search === "string" ? search : undefined,
      category: typeof category === "string" ? category : undefined,
    });
    return res.status(200).json({ success: true, products });
  } catch (error: any) {
    console.error("Get products error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { productName, productDescription, originalPrice, sellingPrice, imageUrl, stock, categoryName } = req.body;

    if (!productName || !productDescription || originalPrice === undefined || !imageUrl || stock === undefined || !categoryName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const product = await services.createProduct({
      productName,
      productDescription,
      originalPrice: parseFloat(originalPrice),
      sellingPrice: sellingPrice !== undefined && sellingPrice !== null ? parseFloat(sellingPrice) : null,
      imageUrl,
      stock: parseInt(stock),
      categoryName,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const { productName, productDescription, originalPrice, sellingPrice, imageUrl, stock, categoryName } = req.body;

    const product = await services.updateProduct(id, {
      productName,
      productDescription,
      originalPrice: originalPrice !== undefined ? parseFloat(originalPrice) : undefined,
      sellingPrice: sellingPrice !== undefined ? (sellingPrice !== null ? parseFloat(sellingPrice) : null) : undefined,
      imageUrl,
      stock: stock !== undefined ? parseInt(stock) : undefined,
      categoryName,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    console.error("Update product error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    await services.deleteProduct(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const syncProducts = async (req: Request, res: Response) => {
  try {
    const synced = await services.syncDummyProducts();
    return res.status(200).json({
      success: true,
      message: `Successfully synced ${synced.length} products from DummyJSON`,
      count: synced.length,
    });
  } catch (error: any) {
    console.error("Sync products error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};
