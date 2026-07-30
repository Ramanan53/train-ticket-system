import prisma from "../config/prisma.js";
import { CreateScheduleInput } from "../schemas/schedule.schema.js";

export const createSchedule = async (data: CreateScheduleInput) => {
  const train = await prisma.train.findUnique({ where: { id: data.trainId } });
  if (!train) {
    const err = new Error("Train not found.");
    (err as any).status = 404;
    throw err;
  }

  return await prisma.schedule.create({
    data: {
      trainId:        data.trainId,
      journeyDate:    new Date(data.journeyDate),
      availableSeats: data.availableSeats,
    },
    include: { train: { include: { from: true, to: true } } },
  });
};

export const getSchedules = async () => {
  return await prisma.schedule.findMany({
    include: { train: { include: { from: true, to: true } } },
    orderBy: { journeyDate: "asc" },
  });
};

export const deleteSchedule = async (id: string) => {
  const schedule = await prisma.schedule.findUnique({ where: { id } });
  if (!schedule) {
    const err = new Error("Schedule not found.");
    (err as any).status = 404;
    throw err;
  }
  await prisma.schedule.delete({ where: { id } });
  return { message: "Schedule deleted successfully." };
};
