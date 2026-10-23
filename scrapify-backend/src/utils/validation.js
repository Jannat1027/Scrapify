import { z } from "zod";
import { CONDITION_IDS } from "../models/Category.js";

const text = (min, message) => z.string().trim().min(min, message);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter the email you signed up with.")),
  password: z.string().min(1, "Enter your password."),
});

const composition = z
  .record(z.string(), z.number().min(0).max(100))
  .refine((shares) => Object.keys(shares).length > 0, "Add at least one plastic type.")
  .refine((shares) => Math.round(Object.values(shares).reduce((sum, share) => sum + share, 0)) === 100, "The shares must add up to 100%.");

const condition = z.enum(CONDITION_IDS);

export const createScanSchema = z.object({
  gradingId: text(1, "Analyse a photo first."),
  weight: z.coerce.number().positive("Enter the weight in kg."),
  composition: composition.optional(),
  condition: condition.optional(),
});

export const createListingSchema = z.object({
  scanId: text(1, "Choose the scan to list."),
  price: z.coerce.number().positive("Enter a price above zero."),
});

export const cancelSchema = z.object({
  reason: text(1, "Say why it is being cancelled."),
});

export const createReportSchema = z.object({
  listingId: text(1, "Which listing is this about?"),
  reason: text(1, "Say what went wrong."),
});
