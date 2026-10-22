// Photo upload with multer. The photo is kept in memory (req.file.buffer) only
// long enough to grade it; the frontend saves a compressed copy with the scan.
import multer from "multer";
import { HttpError } from "../utils/httpError.js";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

export const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_BYTES },
  fileFilter(req, file, callback) {
    if (file.mimetype.startsWith("image/")) callback(null, true);
    else callback(new HttpError(400, "Only image files can be graded."));
  },
}).single("photo");
