export function capitalize(s: string) {
  if (s.length === 0) return ''
  return `${s[0].toUpperCase()}${s.slice(1)}`
}

export function pluralize(s: string) {
  if (s.endsWith('y')) return `${s.slice(0, -1)}ies`
  return `${s}s`
}
