// ---------------------------------------------------------------------------
// SIMULATED AI GRADING
// There is no real AI model in this demo. gradePhoto() waits 1.6 seconds and
// then makes up a believable result from the photo's file size, so the same
// photo always gets the same result. A real version would upload the photo to
// a backend that runs an image model and returns the same shape of data.
// ---------------------------------------------------------------------------

const FAKE_THINKING_TIME_MS = 1600;

export function gradePhoto(photoBlob) {
  // A number from 0 to 99 taken from the file size. It decides every "AI" value below.
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

// Shrinks a photo to at most 1280px on its longest side and re-saves it as JPEG,
// so the image stays small enough to keep in localStorage.
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
// `variant` changes the picture (and so the file size), which gives a different simulated AI result.
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
