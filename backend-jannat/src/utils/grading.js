export function gradePhoto(photoBuffer) {

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
