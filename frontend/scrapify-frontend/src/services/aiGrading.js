import api from "./api.js";

export async function gradePhoto(photoBlob) {
  const form = new FormData();
  form.append("photo", photoBlob, "batch.jpg");
  const response = await api.post("/scans/grade", form);
  return response.data.grading;
}

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

export function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
