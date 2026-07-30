import { Router } from "express";
import { createTrain, getTrains, deleteTrain, searchTrains } from "../controllers/train.controllers.js";
import { authenticate } from "../middlewares/auth.middlewares.js";
import { authorize } from "../middlewares/role.middlewares.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTrainSchema } from "../schemas/train.schema.js";

const router = Router();

router.post(   "/",        authenticate, authorize("ADMIN"), validate(createTrainSchema), createTrain);
router.get(    "/",        authenticate, getTrains);
router.get(    "/search",  authenticate, searchTrains);
router.delete( "/:id",     authenticate, authorize("ADMIN"), deleteTrain);

export default router;