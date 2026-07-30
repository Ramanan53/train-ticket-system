import { z } from "zod";

export const createBookingSchema = z.object({
  scheduleId: z.string().uuid("Invalid schedule ID"),
  seatCount: z.number().int().min(1, "Seat count must be at least 1").max(10, "Cannot book more than 10 seats at once"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
