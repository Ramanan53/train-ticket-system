import prisma from "../config/prisma.js";

export const getAllBookings = async () => {
  return await prisma.booking.findMany({
    include: {
      user:     { select: { id: true, name: true, email: true } },
      schedule: { include: { train: { include: { from: true, to: true } } } },
    },
    orderBy: { bookedAt: "desc" },
  });
};
