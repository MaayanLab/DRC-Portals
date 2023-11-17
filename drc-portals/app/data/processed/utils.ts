export function capitalize(s: string) {
  if (s.length === 0) return ''
  return `${s[0].toUpperCase()}${s.slice(1)}`
}

export function pluralize(s: string) {
  return `${s}s`
}
