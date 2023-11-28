export function capitalize(s: string) {
  if (s.length === 0) return ''
  return `${s[0].toUpperCase()}${s.slice(1)}`
}

export function pluralize(s: string) {
  if (s.endsWith('y')) return `${s.slice(0, -1)}ies`
  return `${s}s`
}

export function type_to_string(type: string) {
  if (type === 'c2m2file') return 'File'
  const type_split = type.split('/')
  let name = type
  if (type_split.length === 1) {
    name = capitalize(type)
  } else if (type_split.length === 3) {
    if (type_split[2] === 'unstructured') {
      name = capitalize(`${type_split[0]} ${type_split[1]}`)
    } else {
      name = capitalize(`${type_split[2]} ${type_split[0]} ${type_split[1]}`)
    }
  }
  return name
}

export function format_description(description: string) {
  if (description === 'TODO') return null
  else return description
}