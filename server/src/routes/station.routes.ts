import { Router } from "express";
import { createStations, getStations, deleteStation } from "../controllers/station.controllers.js";
import { authenticate } from "../middlewares/auth.middlewares.js";
import { authorize } from "../middlewares/role.middlewares.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createStationSchema } from "../schemas/station.schema.js";

const router = Router();

router.post(   "/",    authenticate, authorize("ADMIN"), validate(createStationSchema), createStations);
router.get(    "/",    getStations);
router.delete( "/:id", authenticate, authorize("ADMIN"), deleteStation);

export default router;