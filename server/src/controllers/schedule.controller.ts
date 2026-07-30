import { Request, Response, NextFunction } from "express";
import {
  createSchedule as svcCreate,
  getSchedules as svcGetAll,
  deleteSchedule as svcDelete,
} from "../services/schedule.service.js";
import { CreateScheduleInput } from "../schemas/schedule.schema.js";

export const createSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schedule = await svcCreate(req.body as CreateScheduleInput);
    return res.status(201).json({ message: "Schedule created successfully.", schedule });
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

export const getSchedules = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const schedules = await svcGetAll();
    return res.status(200).json(schedules);
  } catch (err) {
    next(err);
  }
};

export const deleteSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svcDelete(req.params.id as string);
    return res.status(200).json(result);
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};