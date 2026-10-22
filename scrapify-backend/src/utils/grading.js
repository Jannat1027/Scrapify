// ---------------------------------------------------------------------------
// SIMULATED AI GRADING
// There is no real image model yet. gradePhoto() makes up a believable
// result from the photo's file size, so the same photo always gets the same
// result. This is the logic that used to run in the browser (aiGrading.js).
// A real model can replace this function later and return the same shape:
//   { composition, condition, quality, confidence }
// ---------------------------------------------------------------------------

export function gradePhoto(photoBuffer) {
  // A number from 0 to 99 taken from the file size. It decides every "AI" value below.
  const seed = photoBuffer.length % 100;

  const pet = 40 + (seed % 40);
  const hdpe = Math.min(100 - pet, 15 + (seed % 20));
  const film = 100 - pet - hdpe;

  const composition = { pet, hdpe };
  if (film > 0) composition.film = film;

  const isBlurry = seed < 15;
  return {
    composition,
    condition: seed > 60 ? "light" : "clean",
    quality: isBlurry ? "blurry" : "good",
    confidence: isBlurry ? 0.55 : 0.78 + (seed % 20) / 100,
  };
}
