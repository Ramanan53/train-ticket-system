import { z } from "zod";

export const createStationSchema = z.object({
  code: z.string().min(2, "Station code must be at least 2 characters").max(10).toUpperCase(),
  name: z.string().min(2, "Station name must be at least 2 characters"),
});

export type CreateStationInput = z.infer<typeof createStationSchema>;
