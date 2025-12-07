export function buildQuery(params: Record<string, any>) {
  const pairs: string[] = [];
  for (const key in params) {
    const val = params[key];
    if (val === undefined || val === null || val === "") continue;
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
  }
  return pairs.length ? `?${pairs.join("&")}` : "";
}
