import jwt from "jsonwebtoken";
import { User } from "./models.js";
import { AppError, asyncHandler, STATUS, MESSAGES } from "./utils.js";

// ======================= AUTH MIDDLEWARE =======================
export const verifyToken = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_MISSING);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_INVALID);
  }

  const user = await User.findById(payload.id);
  if (!user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_INVALID);

  const blocked = user.loginBlockReason();
  if (blocked) throw new AppError(STATUS.FORBIDDEN, MESSAGES.AUTH.BLOCKED[blocked]);

  req.user = user;
  next();
});

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError(STATUS.FORBIDDEN, MESSAGES.AUTH.FORBIDDEN));
    next();
  };

// ======================= ERROR MIDDLEWARE =======================
export function notFound(req, res, next) {
  next(new AppError(STATUS.NOT_FOUND, MESSAGES.COMMON.ROUTE_NOT_FOUND));
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode;
  let message = err.message;

  if (err.type === "entity.parse.failed") {
    statusCode = STATUS.BAD_REQUEST;
    message = MESSAGES.COMMON.BAD_JSON;
  } else if (err.code === 11000) {
    statusCode = STATUS.CONFLICT;
    message = MESSAGES.COMMON.DUPLICATE;
  } else if (err.name === "CastError") {
    statusCode = STATUS.BAD_REQUEST;
    message = MESSAGES.COMMON.INVALID_ID;
  } else if (err.name === "ValidationError") {
    statusCode = STATUS.BAD_REQUEST;
  } else if (!(err instanceof AppError)) {
    console.error(err);
    statusCode = STATUS.SERVER_ERROR;
    message = MESSAGES.SERVER.ERROR;
  }

  res.status(statusCode).json({ success: false, message });
}