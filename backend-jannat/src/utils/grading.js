import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

// Initialize the Google Gen AI client with the key from backend/.env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The 5 official categories tracked across Scrapify's DB, UI, and price tables
export const ALLOWED_CATEGORIES = ["pet", "hdpe", "film", "pp", "mixed"];

// Zod schema enforcing data types expected by scanController.js and the frontend
const AIResponseSchema = z.object({
  isPlastic: z.boolean(),
  rejectReason: z.string().optional().default("No recyclable plastic scrap detected."),
  composition: z.record(z.string(), z.number()),
  condition: z.enum(["clean", "light", "heavy"]).default("clean"),
  quality: z.enum(["good", "blurry", "dark"]).default("good"),
  confidence: z.number().min(0).max(1).default(0.9),
});

/**
 * Normalizes raw composition percentages across all 5 categories.
 * Guarantees the integer percentages sum to exactly 100.
 */
function normalizeComposition(rawComposition) {
  const sanitized = {};
  let total = 0;

  for (const key of ALLOWED_CATEGORIES) {
    const val = Math.max(0, Number(rawComposition?.[key]) || 0);
    sanitized[key] = val;
    total += val;
  }

  // Reject invalid responses rather than guessing PET
  if (total <= 0) {
    const error = new Error(
      "Unable to identify plastic resin composition. Please upload a clearer photo."
    );
    error.statusCode = 400;
    throw error;
  }

  const normalized = {};
  let runningSum = 0;

  for (const key of ALLOWED_CATEGORIES) {
    const rounded = Math.round((sanitized[key] / total) * 100);
    normalized[key] = rounded;
    runningSum += rounded;
  }

  // Compensate for rounding drift (e.g. 99% or 101%) on the largest category
  const diff = 100 - runningSum;

  if (diff !== 0) {
    const highestKey = ALLOWED_CATEGORIES.reduce((a, b) =>
      normalized[a] > normalized[b] ? a : b
    );

    normalized[highestKey] += diff;
  }

  // Leave out 0% types so the app shows only the plastics actually in the photo, as before.
  return Object.fromEntries(Object.entries(normalized).filter(([, pct]) => pct > 0));
}

/**
 * Primary grading function invoked by backend/src/controllers/scanController.js
 * @param {Buffer} imageBuffer - Raw image buffer from Multer (req.file.buffer)
 * @param {string} mimeType - Image MIME type (e.g. "image/jpeg", "image/png")
 */
export async function gradePhoto(imageBuffer, mimeType = "image/jpeg") {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error("GEMINI_API_KEY is missing in backend/.env");
    err.statusCode = 500;
    throw err;
  }

  try {
    const prompt = `
      You are an expert industrial plastic recycling grader for scrap collection centers in Bangladesh.
      Inspect this scrap plastic image and return ONLY a valid JSON object matching this schema:
      {
        "isPlastic": boolean,
        "rejectReason": "string (empty if plastic)",
        "composition": {
          "pet": integer percentage,
          "hdpe": integer percentage,
          "film": integer percentage,
          "pp": integer percentage,
          "mixed": integer percentage
        },
        "condition": "clean" | "light" | "heavy",
        "quality": "good" | "blurry" | "dark",
        "confidence": number between 0.50 and 0.98
      }

      Grading Rules:
      1. Non-Plastic Rejection: If the image shows items that are NOT plastic scrap (e.g. human face, shoes, paper, cardboard, metal, food, clothing), set "isPlastic": false and explain why in rejectReason.
      2. Categories:
         - "pet": clear/blue-tinted water and soda beverage bottles.
         - "hdpe": opaque milk jugs, shampoo bottles, detergent cans, engine oil containers.
         - "film": LDPE polythene shopping bags, packaging wrap, plastic sheets.
         - "pp": bottle caps, rigid food containers, plastic tubs, buckets.
         - "mixed": crushed or unsorted composite plastics that cannot be cleanly separated.
      3. Condition:
         - "clean": dry and largely free of dirt or chemicals.
         - "light": slight dust, paper labels still attached.
         - "heavy": soiled with mud, grease, chemical residue, or beverage dregs.
      4. Quality:
         - "good", "blurry", or "dark".
      5. Output ONLY raw JSON. Do not include markdown codeblocks, backticks, or preamble text.
    `;

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: mimeType || "image/jpeg",
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = AIResponseSchema.parse(JSON.parse(response.text));

    if (!parsed.isPlastic) {
      const err = new Error(
        parsed.rejectReason ||
          "No plastic detected in this photo. Please upload a clear photo of plastic scrap."
      );
      err.statusCode = 400;
      throw err;
    }

    return {
      composition: normalizeComposition(parsed.composition),
      condition: parsed.condition,
      quality: parsed.quality,
      confidence: parsed.confidence,
    };
  } catch (error) {
    if (error.statusCode === 400) throw error;

    console.error("Gemini Vision Error:", error);

    const err = new Error(
      "AI grading service failed to process the image. Please retry."
    );
    err.statusCode = 503;
    throw err;
  }
}

/**
 * Kept so backend/src/server.js does not crash when invoking warmUpGrader()
 * on startup.
 */
export async function warmUpGrader() {
  console.log("AI grading service ready (Google Gemini Vision configured).");
  return true;
}
