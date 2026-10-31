const FAKE_THINKING_TIME_MS = 1600;

export function gradePhoto(photoBlob) {
  const seed = photoBlob.size % 100;

  const pet = 40 + (seed % 40);
  const hdpe = Math.min(100 - pet, 15 + (seed % 20));
  const film = 100 - pet - hdpe;

  const composition = { pet, hdpe };
  if (film > 0) composition.film = film;

  const isBlurry = seed < 15;
  const result = {
    composition,
    condition: seed > 60 ? "light" : "clean",
    quality: isBlurry ? "blurry" : "good",
    confidence: isBlurry ? 0.55 : 0.78 + (seed % 20) / 100,
  };

  return new Promise((resolve) => {
    setTimeout(() => resolve(result), FAKE_THINKING_TIME_MS);
  });
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
