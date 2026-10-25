import mongoose from "mongoose";
import { User } from "./models.js";
import {
  AppError, STATUS, MESSAGES, requireFields,
  ROLES, USER_STATUS, REGISTERABLE_ROLES, NOTE_REQUIRED_FOR,
  MIN_PASSWORD_LENGTH, MIN_NOTE_LENGTH,
} from "./utils.js";

// ======================= AUTH (Nou) =======================
export async function registerUser(body) {
  requireFields(body, ["name", "org", "location", "email", "password", "role"]);
  const { name, org, location, email, password, role } = body;

  if (!REGISTERABLE_ROLES.includes(role)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AUTH.ROLE_INVALID);
  if (password.length < MIN_PASSWORD_LENGTH) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AUTH.PASSWORD_SHORT);
  if (await User.emailExists(email)) throw new AppError(STATUS.CONFLICT, MESSAGES.AUTH.EMAIL_TAKEN);

  return User.create({ name, org, location, email, password, role });
}

export async function loginUser(body) {
  requireFields(body, ["email", "password"]);

  const user = await User.findByEmailWithPassword(body.email);
  if (!user || !(await user.comparePassword(body.password))) {
    throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.AUTH.INVALID_CREDENTIALS);
  }

  const blocked = user.loginBlockReason();
  if (blocked) throw new AppError(STATUS.FORBIDDEN, MESSAGES.AUTH.BLOCKED[blocked]);

  return { token: user.generateToken(), user };
}

// ======================= ADMIN (Umama) =======================
export async function listUsers(query) {
  const { role, status } = query;
  if (role && !Object.values(ROLES).includes(role)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.FILTER_INVALID);
  if (status && !Object.values(USER_STATUS).includes(status)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.FILTER_INVALID);

  return User.listManaged({ role, status });
}

const CHANGEABLE_TO = [USER_STATUS.APPROVED, USER_STATUS.FLAGGED, USER_STATUS.SUSPENDED];

export async function changeUserStatus(id, body) {
  if (!mongoose.isObjectIdOrHexString(id)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.INVALID_ID);

  const { status } = body ?? {};
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!CHANGEABLE_TO.includes(status)) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.STATUS_INVALID);
  if (NOTE_REQUIRED_FOR.includes(status) && note.length < MIN_NOTE_LENGTH) {
    throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.NOTE_REQUIRED);
  }

  const user = await User.findById(id);
  if (!user) throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.NOT_FOUND);
  if (user.role === ROLES.ADMIN) throw new AppError(STATUS.FORBIDDEN, MESSAGES.USER.ADMIN_PROTECTED);
  if (user.status === status) throw new AppError(STATUS.CONFLICT, MESSAGES.USER.alreadyHasStatus(status));

  return user.changeStatus(status, note);
}

// ======================= OPERATOR (Jbh) =======================




// ======================= RECYCLER (Nou) =======================