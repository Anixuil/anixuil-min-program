export function normalizeRates(a: number, b: number) {
  const sum = a + b;
  if (sum <= 0) return { a: 0.5, b: 0.5 };
  return { a: a / sum, b: b / sum };
}

export function fairMultipliers(a: number, b: number) {
  const n = normalizeRates(a, b);
  const ma = n.a > 0 ? 1 / n.a : 0;
  const mb = n.b > 0 ? 1 / n.b : 0;
  return { a: ma, b: mb };
}
