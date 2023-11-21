export function capitalize(s: string) {
  if (s.length === 0) return ''
  return `${s[0].toUpperCase()}${s.slice(1)}`
}

export function pluralize(s: string) {
  if (s.endsWith('y')) return `${s.slice(0, -1)}ies`
  return `${s}s`
}

export function type_to_string(type: string) {
  const type_split = type.split('/')
  let name = type
  if (type_split.length === 1) {
    name = pluralize(capitalize(type))
  } else if (type_split.length === 3) {
    name = pluralize(capitalize(`${type_split[2]} ${type_split[0]} ${type_split[1]}`))
  }
  return name
}
