
import multer from "multer";
import { ZodError } from "zod";
import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` });
}


export function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const field = issue.path.join(".");
    return res.status(400).json({ message: field ? `${field}: ${issue.message}` : issue.message, issues: error.issues });
  }
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE" ? "The photo is too large (5 MB at most)." : error.message;
    return res.status(400).json({ message });
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "value";
    return res.status(409).json({ message: `That ${field} is already taken.` });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(error.errors)[0].message });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "The request is too large." });
  }

  const status = error.status || error.statusCode || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    message: status >= 500 && env.isProduction ? "Something went wrong on the server." : error.message,
  });
}
