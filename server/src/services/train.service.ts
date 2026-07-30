import prisma from "../config/prisma.js";
import { CreateTrainInput } from "../schemas/train.schema.js";

export const createTrain = async (data: CreateTrainInput) => {
  if (data.fromId === data.toId) {
    const err = new Error("From and To stations cannot be the same.");
    (err as any).status = 400;
    throw err;
  }

  return await prisma.train.create({
    data,
    include: { from: true, to: true },
  });
};

export const getTrains = async () => {
  return await prisma.train.findMany({
    include: { from: true, to: true },
    orderBy: { trainNumber: "asc" },
  });
};

export const deleteTrain = async (id: string) => {
  const train = await prisma.train.findUnique({ where: { id } });
  if (!train) {
    const err = new Error("Train not found.");
    (err as any).status = 404;
    throw err;
  }
  await prisma.train.delete({ where: { id } });
  return { message: "Train deleted successfully." };
};

export const searchTrains = async (from: string, to: string, date: string) => {
  const schedules = await prisma.schedule.findMany({
    where: {
      journeyDate: new Date(date),
      train: {
        from: { code: from },
        to:   { code: to   },
      },
    },
    include: {
      train: {
        include: { from: true, to: true },
      },
    },
  });

  return schedules.map((s) => ({
    scheduleId:     s.id,
    trainNumber:    s.train.trainNumber,
    trainName:      s.train.trainName,
    availableSeats: s.availableSeats,
  }));
};
