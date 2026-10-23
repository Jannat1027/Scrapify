import bcrypt from "bcryptjs";
import { signToken } from "../middleware/auth.js";
import User, { CAN_LOG_IN } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

const LOGIN_BLOCKED = {
  pending: "Your account is waiting for an admin to approve it. You can log in as soon as it's approved.",
  suspended: "This account is suspended. Contact Scrapify support if you think this is a mistake.",
};

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));
  if (!passwordOk) throw new HttpError(401, "That email and password don't match.");

  if (!CAN_LOG_IN.includes(user.status)) throw new HttpError(403, LOGIN_BLOCKED[user.status]);
  if (user.role !== "operator") throw new HttpError(403, "This app is for operator accounts. Log in with an operator email.");

  res.json({ token: signToken(user), user });
}

export function me(req, res) {
  res.json({ user: req.user });
}
