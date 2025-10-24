export function ensure_array<T>(L: T | T[] | undefined): T[] {
  if (L === undefined) return []
  return Array.isArray(L) ? L : [L]
}