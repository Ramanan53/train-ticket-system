import { Request, Response, NextFunction } from "express";
import { getAllBookings as svcGetAll } from "../services/admin.service.js";

export const getAllBookings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await svcGetAll();
    return res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};