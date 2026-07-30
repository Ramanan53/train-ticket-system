import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { generateToken } from "../utils/jwt.js";
import { RegisterInput, LoginInput } from "../schemas/auth.schema.js";

export const registerUser = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const err = new Error("User with this email already exists.");
    (err as any).status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      // role is intentionally omitted — always defaults to CUSTOMER
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return user;
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    const err = new Error("Invalid email or password.");
    (err as any).status = 400;
    throw err;
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid email or password.");
    (err as any).status = 400;
    throw err;
  }

  const token = generateToken(user.id, user.role);

  return {
    token,
    role: user.role,   // top-level for easy client access
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
