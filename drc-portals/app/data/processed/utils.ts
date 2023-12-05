import { z } from 'zod';
import { NodeType } from "@prisma/client"

export function capitalize(s: string) {
  if (s.length === 0) return ''
  return `${s[0].toUpperCase()}${s.slice(1)}`
}

export function pluralize(s: string) {
  if (s.endsWith('y')) return `${s.slice(0, -1)}ies`
  return `${s}s`
}

export function type_to_string(type: NodeType, entity_type: string | null) {
  if (type === 'entity') return entity_type ? capitalize(entity_type) : 'Entity'
  else if (type === 'c2m2_file') return 'File'
  else if (type === 'kg_relation') return 'Knowledge Graph Relation'
  else if (type === 'gene_set_library') return 'Gene Set Library'
  else if (type === 'gene_set') return 'Gene Set'
  else if (type === 'dcc_asset') return 'Processed File'
  throw new Error(`Unhandled type ${type} ${entity_type}`)
}

export function format_description(description: string) {
  if (description === 'TODO') return null
  else return description
}

export function useSanitizedSearchParams(props: { searchParams: Record<string, string | string[] | undefined> }) {
  return z.object({
    q: z.union([
      z.array(z.string()).transform(qs => qs.join(' ')),
      z.string(),
      z.undefined(),
    ]),
    p: z.union([
      z.array(z.string()).transform(ps => +ps[ps.length-1]),
      z.string().transform(p => +p),
      z.undefined().transform(_ => 1),
    ]),
    r: z.union([
      z.array(z.string()).transform(ps => +ps[ps.length-1]),
      z.string().transform(p => +p),
      z.undefined().transform(_ => 1),
    ]).transform(r => ({10: 10, 20: 20, 50: 50}[r] ?? 10)),
    t: z.union([
      z.array(z.string()),
      z.string().transform(ts => ts ? ts.split(',') : undefined),
      z.undefined(),
    ]).transform(ts => ts ? ts.map(t => {
      const [type, entity_type] = t.split(':')
      return { type, entity_type: entity_type ? entity_type : null }
    }) : undefined),
  }).parse(props.searchParams)
}
