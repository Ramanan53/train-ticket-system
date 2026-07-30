import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@gmail.com",
    },
    update: {
      password,        // ← always reset password on re-seed
      role: Role.ADMIN,
    },
    create: {
      name: "Admin",
      email: "admin@gmail.com",
      password,
      role: Role.ADMIN,
    },
  });

  console.log("Admin Created");
}

main();