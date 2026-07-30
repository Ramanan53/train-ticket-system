import { Request, Response, NextFunction } from "express";

/**
 * Centralized error-handling middleware.
 * Must be registered LAST in index.ts (after all routes).
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Prisma unique constraint violation
  if ((err as any).code === "P2002") {
    return res.status(409).json({ message: "A record with that value already exists." });
  }

  // Prisma record not found
  if ((err as any).code === "P2025") {
    return res.status(404).json({ message: "Record not found." });
  }

  return res.status(500).json({ message: "Internal server error." });
};
