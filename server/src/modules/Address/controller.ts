import { Response } from "express";
import { AuthenticatedRequest } from "../../lib/middleware.js";
import * as services from "./service.js";

export const getAddresses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const addresses = await services.getAddressesByCustomer(customerId);
    return res.status(200).json({ success: true, addresses });
  } catch (error: any) {
    console.error("Get addresses error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const createAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { addressLine, city, state, country, addressType, postalCode } = req.body;

    if (!addressLine || !city || !state || !addressType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (addressLine, city, state, addressType)",
      });
    }

    const address = await services.createAddress(customerId, {
      addressLine,
      city,
      state,
      country,
      addressType,
      postalCode,
    });

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      address,
    });
  } catch (error: any) {
    console.error("Create address error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid address ID" });
    }

    const { addressLine, city, state, country, addressType, postalCode } = req.body;

    const address = await services.updateAddress(id, customerId, {
      addressLine,
      city,
      state,
      country,
      addressType,
      postalCode,
    });

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error: any) {
    console.error("Update address error:", error);
    const status = error.message.includes("unauthorized") || error.message.includes("not found") ? 404 : 500;
    return res.status(status).json({ success: false, message: error.message || "Server error" });
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid address ID" });
    }

    await services.deleteAddress(id, customerId);

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete address error:", error);
    const status = error.message.includes("unauthorized") || error.message.includes("not found") ? 404 : 500;
    return res.status(status).json({ success: false, message: error.message || "Server error" });
  }
};
