// ---------------------------------------------------------------------------
// AI GRADING
// gradePhoto() uploads the photo to the backend (POST /api/scans/grade) and
// returns its grading: { gradingId, composition, condition, quality, confidence }.
// The server keeps the grading (and the photo), and the scan is later saved from its gradingId.
// The other helpers below prepare photos in the browser before upload.
// ---------------------------------------------------------------------------
import api from "./api.js";

// Sends the photo as multipart form data in the "photo" field.
// Throws the Axios error if the upload fails (use apiErrorMessage() to show it).
export async function gradePhoto(photoBlob) {
  const form = new FormData();
  form.append("photo", photoBlob, "batch.jpg");
  const response = await api.post("/scans/grade", form);
  return response.data.grading;
}

// Shrinks a photo to at most 1280px on its longest side and re-saves it as JPEG,
// so uploads and the copy saved with the scan stay small.
export function compressImage(file, maxSide = 1280, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(image.src);
      canvas.toBlob(resolve, "image/jpeg", quality);
    };
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
}

// Draws a simple picture of plastic bottles, jugs and bags, for demos without a real photo at hand.
// `variant` changes the picture. The AI may reject these drawings, since they only look a little like plastic.
export function createSamplePhoto(variant = 0) {
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 640;
  const context = canvas.getContext("2d");

  context.fillStyle = "#e7ece6";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const colors = ["#38bdf8", "#0ea5e9", "#7dd3fc", "#a78bfa", "#84cc16", "#fbbf24"];
  const pieceCount = 26 + (variant % 7) * 3;
  for (let index = 0; index < pieceCount; index += 1) {
    // Positions come from simple arithmetic, so each variant always draws the same picture.
    const x = (index * 137 + variant * 53) % 900;
    const y = (index * 89 + variant * 31) % 580;
    context.save();
    context.translate(x + 30, y + 30);
    context.rotate(((index * 47 + variant * 11) % 360) * (Math.PI / 180));
    context.fillStyle = colors[(index + variant) % colors.length];
    context.globalAlpha = 0.8;
    context.beginPath();
    context.roundRect(-18, -45, 36, 90, 12);
    context.fill();
    context.restore();
  }

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

// Turns an image Blob into a "data:image/jpeg;base64,..." string that can be saved as text.
export function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
