import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares.js";
import {
  createBooking as svcCreate,
  getMyBookings as svcGetMine,
  cancelBooking as svcCancel,
} from "../services/booking.service.js";
import { CreateBookingInput } from "../schemas/booking.schema.js";

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const booking = await svcCreate(req.user!.id, req.body as CreateBookingInput);
    return res.status(201).json({ message: "Ticket booked successfully.", booking });
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookings = await svcGetMine(req.user!.id);
    return res.status(200).json(bookings);
  } catch (err: any) {
    next(err);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.role === "ADMIN";
    const result = await svcCancel(req.params.bookingId as string, req.user!.id, isAdmin);
    return res.status(200).json(result);
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};