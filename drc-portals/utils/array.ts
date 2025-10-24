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
