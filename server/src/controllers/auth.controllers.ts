import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service.js";
import { RegisterInput, LoginInput } from "../schemas/auth.schema.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await registerUser(req.body as RegisterInput);
    return res.status(201).json({ message: "User registered successfully.", user });
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body as LoginInput);
    return res.status(200).json(result);
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};