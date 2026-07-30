import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodIssue } from "zod";

/**
 * Middleware factory that validates req.body against a Zod schema.
 * Returns 400 with structured field errors on failure.
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((e: ZodIssue) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return res.status(400).json({
        message: errors[0]?.message ?? "Validation failed",
        errors,
      });
    }

    req.body = result.data;
    next();
  };
