import { z } from "zod";

export const createTrainSchema = z.object({
  trainNumber: z.string().min(1, "Train number is required"),
  trainName: z.string().min(2, "Train name must be at least 2 characters"),
  fromId: z.string().uuid("Invalid from-station ID"),
  toId: z.string().uuid("Invalid to-station ID"),
  totalSeats: z.number().int().min(1, "Total seats must be at least 1").max(1000),
});

export type CreateTrainInput = z.infer<typeof createTrainSchema>;
