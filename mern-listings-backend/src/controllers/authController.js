
import bcrypt from "bcryptjs";
import { signToken } from "../middleware/auth.js";
import Location from "../models/Location.js";
import User, { CAN_LOG_IN } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";

const SALT_ROUNDS = 10;

const LOGIN_BLOCKED = {
  pending: "Your account is waiting for an admin to approve it. You can log in as soon as it's approved.",
  suspended: "This account is suspended. Contact Scrapify support if you think this is a mistake.",
};


export async function register(req, res) {
  const { password, ...details } = req.body;

  if (!(await Location.exists({ name: details.location }))) {
    throw new HttpError(400, "Choose one of the listed areas.");
  }
  if (await User.exists({ email: details.email })) {
    throw new HttpError(409, "This email already has an account. Log in instead, or use a different email.");
  }

  const user = await User.create({
    ...details,
    id: makeId("u"),
    passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    status: "pending",
  });
  res.status(201).json({ user });
}


export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });


  const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));
  if (!passwordOk) throw new HttpError(401, "That email and password don't match.");

  if (!CAN_LOG_IN.includes(user.status)) throw new HttpError(403, LOGIN_BLOCKED[user.status]);

  res.json({ token: signToken(user), user });
}

export function me(req, res) {
  res.json({ user: req.user });
}
