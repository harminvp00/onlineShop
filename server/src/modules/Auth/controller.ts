

import { Request, Response } from "express";
import { registerValidation, loginValidation } from "./validations.js";
import * as services from "./service.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { AuthenticatedRequest } from "../../lib/middleware.js";

const getOAuth2Client = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:5000/accounts/google/login"
  );
};

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const createUser = async (req: Request, res: Response) => {
  const validation = registerValidation.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: validation.error.issues[0].message,
    });
  }

  try {
    const customer = await services.createUser(validation.data);

    const jwtSecret = process.env.JWT_SECRET || "onlinestoresecret";
    const token = jwt.sign({ userId: customer.id }, jwtSecret, { expiresIn: "7d" });

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Registered and logged in successfully",
      user: {
        id: customer.id,
        name: customer.name,
        emailAddress: customer.emailAddress,
        phoneNumber: customer.phoneNumber,
        avatarUrl: customer.avatarUrl,
      },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const validation = loginValidation.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: validation.error.issues[0].message,
    });
  }

  try {
    const customer = await services.verifyUser(validation.data.email, validation.data.password);

    const jwtSecret = process.env.JWT_SECRET || "onlinestoresecret";
    const token = jwt.sign({ userId: customer.id }, jwtSecret, { expiresIn: "7d" });

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: customer,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

export const googleAuthRedirect = (req: Request, res: Response) => {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });

  return res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=no_code`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const idToken = tokens.id_token;
    if (!idToken) {
      throw new Error("No ID Token returned from Google");
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email || !payload.name) {
      throw new Error("Invalid payload from Google token");
    }

    const customer = await services.findOrCreateGoogleUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatarUrl: payload.picture || "",
    });

    const jwtSecret = process.env.JWT_SECRET || "onlinestoresecret";
    const token = jwt.sign({ userId: customer.id }, jwtSecret, { expiresIn: "7d" });

    setAuthCookie(res, token);

    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/auth-success`);
  } catch (error: any) {
    console.error("Google OAuth Callback Error:", error);
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth_failed`
    );
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
  return res.status(200).json({
    success: true,
    user: authReq.user,
  });
};

export const updateProfile = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const customerId = authReq.user?.id;

  if (!customerId) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  try {
    const { name, phoneNumber } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const updatedUser = await services.updateProfile(customerId, {
      name,
      phoneNumber: phoneNumber || null,
    });

    authReq.user = updatedUser as any;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};