import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
    emailAddress: string;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "onlinestoresecret";
    const decoded = jwt.verify(token, jwtSecret) as { userId: number };

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        emailAddress: true,
        phoneNumber: true,
        avatarUrl: true,
      },
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
