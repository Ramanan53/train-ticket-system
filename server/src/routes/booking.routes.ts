import { Router } from "express";
import { createBooking, getMyBookings, cancelBooking } from "../controllers/booking.controllers.js";
import { authenticate } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createBookingSchema } from "../schemas/booking.schema.js";

const router = Router();

router.post(  "/",                  authenticate, validate(createBookingSchema), createBooking);
router.get(   "/my",                authenticate, getMyBookings);
router.patch( "/:bookingId/cancel", authenticate, cancelBooking);

export default router;