import { signToken } from "../middleware/auth.js";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

const LOGIN_BLOCKED = {
  pending: "Your account is waiting for an admin to approve it. You can log in as soon as it's approved.",
  suspended: "This account is suspended. Contact Scrapify support if you think this is a mistake.",
};

export async function login(email, password) {
  const user = await User.findOne({ email });

  const passwordOk = user && (await user.checkPassword(password));
  if (!passwordOk) throw new HttpError(401, "That email and password don't match.");

  if (!user.canLogIn()) throw new HttpError(403, LOGIN_BLOCKED[user.status]);
  if (user.role !== "operator") throw new HttpError(403, "This app is for operator accounts. Log in with an operator email.");

  return { token: signToken(user), user };
}
