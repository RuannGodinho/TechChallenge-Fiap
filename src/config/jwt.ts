import { SignOptions } from "jsonwebtoken";

export const jwtConfig = {
  secret: process.env.JWT_SECRET || "dev-secret",
  expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"]
};