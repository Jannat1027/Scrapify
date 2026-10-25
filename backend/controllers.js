import { asyncHandler, sendSuccess, STATUS, MESSAGES } from "./utils.js";
import * as service from "./services.js";

// ======================= AUTH (Nou) =======================
export const register = asyncHandler(async (req, res) => {
  const user = await service.registerUser(req.body);
  sendSuccess(res, STATUS.CREATED, MESSAGES.AUTH.REGISTERED, user);
});

export const login = asyncHandler(async (req, res) => {
  const result = await service.loginUser(req.body);
  sendSuccess(res, STATUS.OK, MESSAGES.AUTH.LOGIN_OK, result);
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, STATUS.OK, MESSAGES.AUTH.ME, req.user);
});

// ======================= ADMIN (Umama) =======================
export const getUsers = asyncHandler(async (req, res) => {
  const users = await service.listUsers(req.query);
  sendSuccess(res, STATUS.OK, MESSAGES.USER.LISTED, users);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await service.changeUserStatus(req.params.id, req.body);
  sendSuccess(res, STATUS.OK, MESSAGES.USER.statusChanged(user.name, user.status), user);
});

// ======================= OPERATOR (Jbh) =======================



// ======================= RECYCLER (Nou) =======================