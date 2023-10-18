import jwt from "jsonwebtoken";
import "dotenv/config";

export function jwtGenerator(userId: string, role: string, mail: string) {
  const payload = {
    userId,
    role,
    mail,
  };
  return jwt.sign(payload, process.env.jwtSecret!, { expiresIn: "12hr" });
}
