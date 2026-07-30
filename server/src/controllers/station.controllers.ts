import { Request, Response, NextFunction } from "express";
import {
  createStation as svcCreate,
  getStations as svcGetAll,
  deleteStation as svcDelete,
} from "../services/station.service.js";
import { CreateStationInput } from "../schemas/station.schema.js";

export const createStations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const station = await svcCreate(req.body as CreateStationInput);
    return res.status(201).json(station);
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

export const getStations = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stations = await svcGetAll();
    return res.status(200).json(stations);
  } catch (err) {
    next(err);
  }
};

export const deleteStation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svcDelete(req.params.id as string);
    return res.status(200).json(result);
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};
