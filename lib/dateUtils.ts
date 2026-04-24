// parse "YYYY-MM-DD" as local date (avoids day-off bug in negative UTC offsets)
export function parseIsoLocal(iso: string): Date {
  const parts = String(iso ?? "").slice(0, 10).split("-");
  if (parts.length < 3) return new Date(NaN);
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return new Date(NaN);
  }
  return new Date(y, m - 1, d);
}
