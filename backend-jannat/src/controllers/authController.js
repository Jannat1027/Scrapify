import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { signToken } from "../middleware/auth.js";
import Location from "../models/Location.js";
import User, { CAN_LOG_IN } from "../models/User.js";
import { appAddress } from "../utils/appAddress.js";
import { HttpError } from "../utils/httpError.js";
import { makeId } from "../utils/ids.js";
import { sendVerificationEmail } from "../utils/mailer.js";

const SALT_ROUNDS = 10;
const VERIFY_LINK_HOURS = 24;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// Stores a fresh one-time token on the user and emails the link. Only the token's hash is kept.
async function sendVerification(user, origin) {
  const token = crypto.randomBytes(32).toString("hex");
  user.verifyTokenHash = hashToken(token);
  user.verifyTokenExpires = new Date(Date.now() + VERIFY_LINK_HOURS * 60 * 60 * 1000);
  await user.save();

  const query = new URLSearchParams({ token, app: appAddress(origin) });
  await sendVerificationEmail(user, `${env.serverUrl}/api/auth/verify-email?${query}`);
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const LOGIN_BLOCKED = {
  pending: "Your account is waiting for an admin to approve it. You can log in as soon as it's approved.",
  suspended: "This account is suspended. Contact Scrapify support if you think this is a mistake.",
};


export async function register(req, res) {
  const { password, ...details } = req.body;

  if (await User.exists({ email: details.email })) {
    throw new HttpError(409, "This email already has an account. Log in instead, or use a different email.");
  }

  // Any area is allowed. A known one keeps its spelling; a new one is added to the list.
  const existing = await Location.findOne({ name: new RegExp(`^${escapeRegExp(details.location)}$`, "i") });
  if (existing) details.location = existing.name;
  else await Location.create({ name: details.location });

  const user = await User.create({
    ...details,
    id: makeId("u"),
    passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    // Recyclers pay money on the marketplace, so an admin checks each one first. Operators can start right away.
    status: details.role === "recycler" ? "pending" : "approved",
    emailVerified: false,
  });
  // Nobody can log in until the email link is clicked.
  await sendVerification(user, req.get("origin"));
  res.status(201).json({ user });
}


export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });


  const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));
  if (!passwordOk) throw new HttpError(401, "That email and password don't match.");

  if (!user.emailVerified) {
    throw new HttpError(403, "Confirm your email first. Open the link we sent to your inbox.", "EMAIL_NOT_VERIFIED");
  }
  if (!CAN_LOG_IN.includes(user.status)) throw new HttpError(403, LOGIN_BLOCKED[user.status]);

  res.json({ token: signToken(user), user });
}

// Opened from the email link, so it answers with a redirect back to the app's login page.
export async function verifyEmail(req, res) {
  const token = String(req.query.token || "");
  const user = token && (await User.findOne({ verifyTokenHash: hashToken(token) }));

  let outcome = "invalid";
  if (user && user.verifyTokenExpires > new Date()) {
    user.emailVerified = true;
    user.verifyTokenHash = "";
    user.verifyTokenExpires = undefined;
    await user.save();
    outcome = "ok";
  } else if (user) {
    outcome = "expired";
  }
  res.redirect(303, `${appAddress(String(req.query.app || ""))}/login?verified=${outcome}`);
}

// Same answer whether or not the email exists, so it can't be used to discover accounts.
export async function resendVerification(req, res) {
  const user = await User.findOne({ email: req.body.email });
  if (user && !user.emailVerified) await sendVerification(user, req.get("origin"));
  res.json({ message: "If that account still needs confirming, a new link is on its way." });
}

export function me(req, res) {
  res.json({ user: req.user });
}

export async function updateWallets(req, res) {
  for (const field of ["bkashNumber", "nagadNumber"]) {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  }
  await req.user.save();
  res.json({ user: req.user });
}
