import { Router } from "express";

import { getAllBookings }
from "../controllers/admin.controllers.js";

import { authenticate }
from "../middlewares/auth.middlewares.js";

import { authorize }
from "../middlewares/role.middlewares.js";

const router = Router();

router.get(
  "/bookings",
  authenticate,
  authorize("ADMIN"),
  getAllBookings
);

export default router;