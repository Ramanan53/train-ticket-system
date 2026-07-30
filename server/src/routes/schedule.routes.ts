import { Router } from "express";
import { createSchedule, getSchedules, deleteSchedule } from "../controllers/schedule.controller.js";
import { authenticate } from "../middlewares/auth.middlewares.js";
import { authorize } from "../middlewares/role.middlewares.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createScheduleSchema } from "../schemas/schedule.schema.js";

const router = Router();

router.post(   "/",    authenticate, authorize("ADMIN"), validate(createScheduleSchema), createSchedule);
router.get(    "/",    authenticate, getSchedules);
router.delete( "/:id", authenticate, authorize("ADMIN"), deleteSchedule);

export default router;