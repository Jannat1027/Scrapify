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

export const getPriceRates = asyncHandler(async (req, res) => {
  const rates = await service.listPriceRates();
  sendSuccess(res, STATUS.OK, MESSAGES.RATE.LISTED, rates);
});

export const updatePriceRate = asyncHandler(async (req, res) => {
  const rate = await service.updatePriceRate(req.params.category, req.body);
  sendSuccess(res, STATUS.OK, MESSAGES.RATE.UPDATED(rate.name), rate);
});

export const createCategory = asyncHandler(async (req, res) => {
  const rate = await service.createCategory(req.body);
  sendSuccess(res, STATUS.CREATED, MESSAGES.CATEGORY.ADDED(rate.name), rate);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const rate = await service.deleteCategory(req.params.category);
  sendSuccess(res, STATUS.OK, MESSAGES.CATEGORY.DELETED(rate.name), rate);
});

export const getLocations = asyncHandler(async (req, res) => {
  const locations = await service.listLocations();
  sendSuccess(res, STATUS.OK, MESSAGES.LOCATION.LISTED, locations);
});

export const createLocation = asyncHandler(async (req, res) => {
  const location = await service.addLocation(req.body);
  sendSuccess(res, STATUS.CREATED, MESSAGES.LOCATION.ADDED(location.name), location);
});

export const deleteLocation = asyncHandler(async (req, res) => {
  const location = await service.removeLocation(req.params.id);
  sendSuccess(res, STATUS.OK, MESSAGES.LOCATION.REMOVED(location.name), location);
});

export const getReports = asyncHandler(async (req, res) => {
  const reports = await service.listReports(req.query);
  sendSuccess(res, STATUS.OK, MESSAGES.REPORT.LISTED, reports);
});

export const resolveReport = asyncHandler(async (req, res) => {
  const report = await service.resolveReport(req.params.id, req.body, req.user);
  sendSuccess(res, STATUS.OK, MESSAGES.REPORT.RESOLVED, report);
});

export const getOverview = asyncHandler(async (req, res) => {
  const overview = await service.buildOverview();
  sendSuccess(res, STATUS.OK, MESSAGES.OVERVIEW.LOADED, overview);
});

// ======================= OPERATOR (Jbh) =======================



// ======================= RECYCLER (Nou) =======================