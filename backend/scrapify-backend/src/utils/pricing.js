export const LOW_CONFIDENCE = 0.7;

export function mainCategoryOf(composition) {
  const sortedByShare = Object.entries(composition).sort((a, b) => b[1] - a[1]);
  return sortedByShare[0][0];
}

export function calculatePrice({ composition, condition, weight, confidence = 1 }, rates) {
  const lines = Object.entries(composition).map(([categoryId, percent]) => {
    const rateRow = rates.find((rate) => rate.id === categoryId);
    const ratePerKg = rateRow ? rateRow[condition] : 0;
    const kg = (weight * percent) / 100;
    return { categoryId, percent, kg, rate: ratePerKg, amount: kg * ratePerKg };
  });

  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  const spread = 0.05 + (1 - confidence) * 0.25;

  return { lines, total, low: total * (1 - spread), high: total * (1 + spread) };
}
