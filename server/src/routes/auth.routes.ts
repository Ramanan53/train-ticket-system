import { Router } from "express";
import { register, login } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login",    authLimiter, validate(loginSchema),    login);

export default router;