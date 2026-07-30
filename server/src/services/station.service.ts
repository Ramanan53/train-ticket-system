import prisma from "../config/prisma.js";
import { CreateStationInput } from "../schemas/station.schema.js";

export const createStation = async (data: CreateStationInput) => {
  return await prisma.station.create({ data });
};

export const getStations = async () => {
  return await prisma.station.findMany({ orderBy: { name: "asc" } });
};

export const deleteStation = async (id: string) => {
  const station = await prisma.station.findUnique({ where: { id } });
  if (!station) {
    const err = new Error("Station not found.");
    (err as any).status = 404;
    throw err;
  }
  await prisma.station.delete({ where: { id } });
  return { message: "Station deleted successfully." };
};
