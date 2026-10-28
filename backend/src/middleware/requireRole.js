
import { HttpError } from "../utils/httpError.js";

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) throw new HttpError(403, "Your account type can't do this.");
    next();
  };
}
