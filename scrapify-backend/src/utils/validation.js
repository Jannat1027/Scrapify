// ---------------------------------------------------------------------------
// Input rules for every request body, written with zod.
// The messages match the frontend's form messages where there is one, so a
// request that skips the form still gets the same explanation.
// ---------------------------------------------------------------------------
import { z } from "zod";
import { CONDITION_IDS } from "../models/Category.js";

const text = (min, message) => z.string().trim().min(min, message);
const rate = z.coerce.number().min(0, "Rates must be zero or more.");

// ---------- Auth ----------

export const registerSchema = z.object({
  role: z.enum(["operator", "recycler"], { message: "Choose operator or recycler." }),
  name: text(2, "Add your full name so buyers know who they're dealing with."),
  org: text(2, "Add your shop or organisation name. It appears on every listing."),
  location: text(1, "Choose the area where you collect or buy plastic."),
  email: z.string().trim().toLowerCase().pipe(z.email("That doesn't look like an email yet. It should look like name@shop.com.")),
  password: z
    .string()
    .min(6, "Use at least 6 characters.")
    .regex(/\d/, "Add at least one number, for example greenbin24."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter the email you signed up with.")),
  password: z.string().min(1, "Enter your password."),
});

// ---------- Scans ----------

// Percent of each plastic type, e.g. { pet: 60, hdpe: 40 }. The shares must add up to 100.
const composition = z
  .record(z.string(), z.number().min(0).max(100))
  .refine((shares) => Object.keys(shares).length > 0, "Add at least one plastic type.")
  .refine((shares) => Math.round(Object.values(shares).reduce((sum, share) => sum + share, 0)) === 100, "The shares must add up to 100%.");

const condition = z.enum(CONDITION_IDS);

export const createScanSchema = z.object({
  gradingId: text(1, "Analyse a photo first."),
  weight: z.coerce.number().positive("Enter the weight in kg."),
  // Only sent when the operator corrected the AI's answer.
  composition: composition.optional(),
  condition: condition.optional(),
});

// ---------- Listings ----------

export const createListingSchema = z.object({
  scanId: text(1, "Choose the scan to list."),
  price: z.coerce.number().positive("Enter a price above zero."),
});

export const cancelSchema = z.object({
  reason: text(1, "Say why it is being cancelled."),
});

export const rateSchema = z.object({
  rating: z.coerce.number().int().min(1, "Give 1 to 5 stars.").max(5, "Give 1 to 5 stars."),
});

// ---------- Reports ----------

export const createReportSchema = z.object({
  listingId: text(1, "Which listing is this about?"),
  reason: text(1, "Say what went wrong."),
});

export const resolveReportSchema = z.object({
  resolution: z.string().trim().default(""),
});

// ---------- Payments ----------

export const createPaymentSchema = z.object({
  listingId: text(1, "Choose a listing."),
  method: z.enum(["bkash", "nagad"]),
  phoneNumber: z.string().trim().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladesh mobile number."),
});

export const verifyPaymentSchema = z.object({
  transactionId: z.string().trim().min(3, "Enter the transaction ID.").max(64, "Transaction ID is too long."),
});

// ---------- Admin ----------

export const userStatusSchema = z.object({
  status: z.enum(["approved", "flagged", "suspended"], { message: "Status must be approved, flagged or suspended." }),
  note: z.string().trim().optional(),
});

export const createCategorySchema = z.object({
  name: text(2, "Give the category a name."),
  note: z.string().trim().default(""),
  icon: z.string().trim().default("recycle"),
  clean: rate,
  light: rate,
  heavy: rate,
  source: z.string().trim().default("Admin estimate"),
});

// Every field is optional when editing; only the ones sent are changed.
export const updateCategorySchema = createCategorySchema.partial();

export const locationSchema = z.object({
  name: text(2, "Enter the area, e.g. Mirpur, Dhaka."),
});
