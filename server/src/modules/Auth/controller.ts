import { Request, Response } from "express";
import { registerValidation } from "./validations.js";
import * as services from "./service.js";

export const createUser = async (req: Request, res: Response) => {
  const validation = registerValidation.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: validation.error.issues[0].message,
    });
  }

  const response = await services.createUser(validation.data);



  return res.status(201).json({
    success: true,
    response,
  });
};