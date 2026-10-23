import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) throw new HttpError(401, "Please log in first.");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new HttpError(401, "Your session has expired. Please log in again.");
  }

  const user = await User.findOne({ id: payload.sub });
  if (!user) throw new HttpError(401, "This account no longer exists.");
  if (!user.canLogIn()) throw new HttpError(401, "This account can't be used right now.");

  req.user = user;
  next();
}
