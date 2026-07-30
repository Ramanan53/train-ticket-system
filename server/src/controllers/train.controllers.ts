import { Request, Response, NextFunction } from "express";
import {
  createTrain as svcCreate,
  getTrains as svcGetAll,
  deleteTrain as svcDelete,
  searchTrains as svcSearch,
} from "../services/train.service.js";
import { CreateTrainInput } from "../schemas/train.schema.js";

export const createTrain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const train = await svcCreate(req.body as CreateTrainInput);
    return res.status(201).json(train);
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

export const getTrains = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const trains = await svcGetAll();
    return res.status(200).json(trains);
  } catch (err) {
    next(err);
  }
};

export const deleteTrain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svcDelete(req.params.id as string);
    return res.status(200).json(result);
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

export const searchTrains = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to, date } = req.query;
    if (!from || !to || !date) {
      return res.status(400).json({ message: "from, to and date are required." });
    }
    const results = await svcSearch(from as string, to as string, date as string);
    return res.status(200).json(results);
  } catch (err) {
    next(err);
  }
};