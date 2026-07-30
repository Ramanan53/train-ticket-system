import prisma from "../config/prisma.js";
import { CreateBookingInput } from "../schemas/booking.schema.js";

export const createBooking = async (userId: string, data: CreateBookingInput) => {
  // Atomic transaction: check seats + create booking + decrement seats
  return await prisma.$transaction(async (tx) => {
    const schedule = await tx.schedule.findUnique({ where: { id: data.scheduleId } });

    if (!schedule) {
      const err = new Error("Schedule not found.");
      (err as any).status = 404;
      throw err;
    }

    if (schedule.availableSeats < data.seatCount) {
      const err = new Error("Not enough seats available.");
      (err as any).status = 400;
      throw err;
    }

    const booking = await tx.booking.create({
      data: { userId, scheduleId: data.scheduleId, seatCount: data.seatCount },
    });

    await tx.schedule.update({
      where: { id: data.scheduleId },
      data: { availableSeats: schedule.availableSeats - data.seatCount },
    });

    return booking;
  });
};

export const getMyBookings = async (userId: string) => {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      schedule: { include: { train: true } },
    },
    orderBy: { bookedAt: "desc" },
  });
};

export const cancelBooking = async (bookingId: string, userId: string, isAdmin: boolean) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    const err = new Error("Booking not found.");
    (err as any).status = 404;
    throw err;
  }

  // Only the owner OR an admin can cancel
  if (!isAdmin && booking.userId !== userId) {
    const err = new Error("You are not authorized to cancel this booking.");
    (err as any).status = 403;
    throw err;
  }

  if (booking.status === "CANCELLED") {
    const err = new Error("Booking is already cancelled.");
    (err as any).status = 400;
    throw err;
  }

  // Atomic: update booking status + restore seats
  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    await tx.schedule.update({
      where: { id: booking.scheduleId },
      data: { availableSeats: { increment: booking.seatCount } },
    });
  });

  return { message: "Booking cancelled successfully." };
};
