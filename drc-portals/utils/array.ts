export function ensure_array<T>(L: T | T[] | undefined): T[] {
  if (L === undefined) return []
  return Array.isArray(L) ? L : [L]
}

export function unique(L: string[]): string[] {
  const S = new Set()
  const U: string[] = []
  for (const el of L) {
    if (S.has(el)) continue
    S.add(el)
    U.push(el)
  }
  return U
}

export function groupby<T>(L: T[], keyfun: (el: T) => string): Record<string, T[]> {
  const buckets: Record<string, T[]> = {}
  for (const el of L) {
    const key = keyfun(el)
    if (!(key in buckets)) buckets[key] = []
    buckets[key].push(el)
  }
  return buckets
}
