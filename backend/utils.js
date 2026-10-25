// ======================= SHARED UTILS =======================
export const ROLES = { OPERATOR: "operator", RECYCLER: "recycler", ADMIN: "admin" };
export const REGISTERABLE_ROLES = [ROLES.OPERATOR, ROLES.RECYCLER];

export const USER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  FLAGGED: "flagged",
  SUSPENDED: "suspended",
};
export const NOTE_REQUIRED_FOR = [USER_STATUS.FLAGGED, USER_STATUS.SUSPENDED];

export const MIN_PASSWORD_LENGTH = 6;
export const MIN_NOTE_LENGTH = 5;

export const STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

export const MESSAGES = {
  // ===== AUTH (Nou) =====
  AUTH: {
    REGISTERED: "Account created. You can log in after an admin approves it.",
    LOGIN_OK: "Logged in",
    ME: "Current user",
    ROLE_INVALID: "Role must be operator or recycler",
    PASSWORD_SHORT: "Password must be at least 6 characters",
    EMAIL_TAKEN: "An account with this email already exists",
    INVALID_CREDENTIALS: "Wrong email or password",
    TOKEN_MISSING: "Please log in first",
    TOKEN_INVALID: "Your session is not valid. Please log in again",
    FORBIDDEN: "You are not allowed to do this",
    BLOCKED: {
      pending: "Your account is waiting for admin approval",
      suspended: "Your account is suspended",
    },
  },
  // ===== ADMIN (Umama) =====
  USER: {
    LISTED: "Users loaded",
    INVALID_ID: "Invalid user id",
    NOT_FOUND: "User not found",
    FILTER_INVALID: "Invalid role or status filter",
    STATUS_INVALID: "Status must be approved, flagged or suspended",
    NOTE_REQUIRED: "Please write a reason (at least 5 characters)",
    ADMIN_PROTECTED: "Admin accounts can't be changed here",
    alreadyHasStatus: (status) => `This user is already ${status}`,
    statusChanged: (name, status) => `${name} is now ${status}`,
  },
  // ===== OPERATOR (Jbh) =====
  // ===== RECYCLER (Nou) =====
  COMMON: {
    MISSING_FIELDS: (fields) => `Please fill in: ${fields.join(", ")}`,
    ROUTE_NOT_FOUND: "Route not found",
    BAD_JSON: "The request body is not valid JSON",
    DUPLICATE: "This value already exists",
    INVALID_ID: "Invalid id",
  },
  SERVER: { ERROR: "Something went wrong on the server" },
};

export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function sendSuccess(res, statusCode, message, data = null) {
  res.status(statusCode).json({ success: true, message, data });
}

export function requireFields(body, fields) {
  const data = body ?? {};
  const missing = fields.filter((f) => typeof data[f] !== "string" || data[f].trim() === "");
  if (missing.length > 0) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.COMMON.MISSING_FIELDS(missing));
}