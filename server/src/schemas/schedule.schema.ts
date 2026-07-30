import { z } from "zod";

export const createScheduleSchema = z.object({
  trainId: z.string().uuid("Invalid train ID"),
  journeyDate: z.string().min(1, "Journey date is required"),
  availableSeats: z.number().int().min(0, "Available seats cannot be negative"),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
