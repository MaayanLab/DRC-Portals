import React from 'react'
import KGNode from '@/public/img/icons/KGNode.png'
import KGEdge from '@/public/img/icons/KGEdge.png'
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import { ReadonlyURLSearchParams } from 'next/navigation'

type WithPrefix<Prefix extends string, T> = {
  [K in keyof T as `${Prefix}${string & K}`]: T[K];
};

export type EntityType = {
  id: string,
  type: string,
  slug: string,
  pagerank: string,
  a_label: string,
  a_description: string,
} & WithPrefix<'a_', Record<string, string>>

export type EntityExpandedType = {
  id: string,
  type: string,
  slug: string,
  pagerank: string,
  a_label: string,
  a_description: string,
} & WithPrefix<'a_', Record<string, string>> & WithPrefix<'m2o_', Record<string, EntityType>> & WithPrefix<'m2m_', Record<string, string>>

export type TermAggType<K extends string> = Record<K, {
  buckets: { key: string, doc_count: number }[]
}>

export type FilterAggType<K extends string> = Record<K, {
  doc_count: number
}>

const entity_type_map: Record<string, string> = {
  'CLINGEN ALLELE REGISTRY': 'ClinGen Allele',
  'Congenital Abnormality': 'Congenital Abnormality',
  'ENCODE CCRE': 'Candidate Cis-Regulatory Element',
  'ENSEMBL': 'Transcript',
  'gene': 'Gene',
  'GLYCAN MOTIF': 'Glycan Motif',
  'GLYCAN': 'Glycan',
  'GLYCOSYLTRANSFERASE REACTION': 'Glycosyl Transferace Reaction',
  'GLYGEN GLYCOSEQUENCE': 'Glycosequence',
  'GLYGEN GLYCOSYLATION': 'Glycosylation',
  'GLYGEN RESIDUE': 'Residue',
  'GLYTOUCAN': 'Glytoucan',
  'GTEXEQTL': 'eQTL',
  'ptm': 'Post Translational Modification',
  'ncbi_taxonomy': 'Taxonomy',
}

export function capitalize(s: string) {
  if (s.length === 0) return ''
  return `${s[0].toUpperCase()}${s.slice(1)}`
}

export function titleCapitalize(s: string) {
  return s.split(' ').map(word => capitalize(word)).join(' ')
}

export function pluralize(s: string) {
  if (s.toLowerCase() === 'processed') return s
  if (s.toLowerCase() === 'c2m2') return s
  if (s.endsWith('y') && s.toLowerCase() != 'assay') return `${s.slice(0, -1)}ies`
  if (s.endsWith('x')) return `${s}es`
  return `${s}s`
}

export function human_readable(s: string) {
  return capitalize(s.replaceAll('_', ' '))
}

/*
  8-bit hash of a javascript string
  https://en.wikipedia.org/wiki/Pearson_hashing
*/
const pearson_hash_T = [218, 132, 183, 219, 84, 220, 54, 99, 129, 157, 107, 184, 127, 249, 160, 60, 12, 159, 212, 222, 46, 247, 120, 124, 114, 238, 43, 72, 119, 206, 34, 192, 175, 37, 233, 92, 147, 193, 64, 73, 237, 150, 189, 18, 48, 171, 93, 4, 216, 134, 234, 166, 15, 230, 202, 213, 253, 29, 229, 140, 27, 69, 75, 88, 1, 163, 74, 142, 214, 203, 137, 17, 148, 221, 53, 242, 97, 226, 199, 8, 30, 121, 47, 26, 50, 3, 170, 112, 11, 45, 244, 16, 164, 23, 180, 32, 19, 251, 6, 135, 71, 108, 0, 167, 186, 223, 5, 24, 209, 61, 101, 224, 245, 118, 115, 130, 205, 181, 82, 131, 14, 70, 105, 56, 33, 172, 81, 154, 241, 106, 22, 109, 31, 87, 145, 100, 138, 9, 191, 195, 77, 174, 254, 111, 38, 185, 153, 103, 96, 196, 85, 168, 173, 211, 25, 55, 90, 177, 2, 146, 49, 62, 44, 194, 20, 228, 86, 36, 156, 236, 169, 13, 68, 95, 128, 52, 58, 155, 7, 235, 110, 91, 102, 35, 143, 255, 51, 190, 231, 113, 178, 79, 248, 133, 123, 21, 42, 144, 239, 188, 63, 80, 151, 187, 139, 89, 122, 40, 125, 243, 161, 250, 41, 116, 198, 39, 59, 28, 232, 57, 227, 240, 215, 152, 225, 98, 67, 149, 252, 179, 200, 94, 197, 246, 158, 104, 117, 76, 208, 141, 201, 204, 210, 217, 78, 66, 182, 10, 136, 65, 165, 126, 207, 162, 176, 83]
function pearson_hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    const dword = s.charCodeAt(i)
    const hword = (dword >> 8) & 0xff
    const lword = dword & 0xff
    h = pearson_hash_T[h^hword]
    h = pearson_hash_T[h^lword]
  }
  return h
}

/*
  get one of 256 colors from an 8-bit hash
  gives us (mostly) unique but consistent colors for unique strings
*/
const palette = ["#b24d49", "#0086b2", "#315d04", "#5d2882", "#967108", "#693500", "#a655a2", "#004586", "#148a6d", "#711c41", "#7165be", "#5d8639", "#655500", "#9a5114", "#823179", "#862d24", "#3965aa", "#a2416d", "#4d459a", "#7d49a2", "#006d41", "#006986", "#00868e", "#717100", "#005120", "#148a49", "#86394d", "#5d79b2", "#8e65aa", "#516d24", "#794d08", "#692459", "#ae596d", "#863d14", "#65559a", "#aa5d3d", "#245986", "#6d3d7d", "#495100", "#964939", "#924982", "#a66510", "#6d2810", "#24752d", "#ae558a", "#49357d", "#822d5d", "#71242d", "#0071a6", "#35519a", "#826110", "#9e3d49", "#613d96", "#353d82", "#692071", "#555dae", "#8e519a", "#284d08", "#206128", "#5d6100", "#1c7d55", "#1c7992", "#397dba", "#7d59b2", "#925900", "#457d41", "#8a3d3d", "#5d6dbe", "#004d75", "#827924", "#823d92", "#862839", "#5d7918", "#ae5d20", "#4d5592", "#a24d28", "#923971", "#008a82", "#716510", "#864500", "#9a495d", "#4571a2", "#92355d", "#7d69ae", "#085910", "#ae4959", "#b24d75", "#496500", "#7171b2", "#457924", "#923924", "#3d6524", "#9a59b2", "#69498e", "#2d497d", "#6d3992", "#418a3d", "#793100", "#6d3169", "#793520", "#966920", "#826d00", "#5d2d6d", "#2d6596", "#717d24", "#824582", "#86284d", "#007941", "#6561a6", "#318a5d", "#711851", "#414986", "#59498e", "#145192", "#714da6", "#82599e", "#9e5179", "#7d3969", "#5169a2", "#35799e", "#75241c", "#9e6128", "#b6553d", "#005d7d", "#755500", "#5951a6", "#2d869e", "#754108", "#59397d", "#495d14", "#9e558e", "#752d4d", "#a24582", "#9a4996", "#792469", "#24691c", "#964514", "#a25149", "#752d7d", "#5d6d00", "#7d4d8e", "#4971b6", "#8a5118", "#552d8a", "#3d5d92", "#ae5959", "#924569", "#692d82", "#45398e", "#79312d", "#6d59b2", "#792d41", "#205d9e", "#417131", "#086d31", "#395510", "#a2413d", "#286d92", "#8a65be", "#006135", "#9a5da2", "#9a3955", "#8a4920", "#657120", "#751c35", "#863d2d", "#314592", "#3d6d18", "#8e3135", "#597931", "#8e397d", "#418a51", "#8e4192", "#553d96", "#9a494d", "#a64935", "#7d2d10", "#9a552d", "#715da2", "#aa4565", "#616daa", "#4559a2", "#20551c", "#8a6d1c", "#2d8239", "#923545", "#8e51aa", "#517dae", "#6149a2", "#9e6900", "#6d310c", "#454d9e", "#3d82ae", "#08658e", "#494182", "#7d2428", "#752d5d", "#2d6daa", "#555908", "#7d7904", "#aa597d", "#823555", "#8e5db6", "#755196", "#9e5908", "#4d65b2", "#6d1c65", "#75418e", "#317d49", "#863d65", "#b2592d", "#825500", "#315d1c", "#82353d", "#8e6500", "#7d3982", "#92414d", "#924528", "#a24d6d", "#793d14", "#245500", "#00759a", "#696908", "#2479ae", "#244182", "#55619e", "#7d65be", "#518228", "#518645", "#aa5949", "#316d35", "#556518", "#7d3d75", "#8261aa", "#713975", "#6d2439", "#595596", "#008261", "#653d82", "#75358a", "#9e5139", "#963d35", "#4d7114", "#755d00", "#612865", "#a65159", "#6d71c2", "#3d518a", "#8e7500", "#a65524", "#5579c2", "#008e65", "#b65159", "#925592", "#394d00", "#00754d"]
export function categoryColor(type: string) {
  return palette[pearson_hash(type)]
}

export function predicateLabel(type: string) {
  if (type === 'inv_gene_set') type = 'has gene'
  else if (type === 'gene_set') type = 'in gene set'
  else if (type === 'relation') type = 'assertion'
  else if (type === 'target') type = 'target node'
  else if (type === 'source') type = 'source node'
  else if (type.startsWith('inv_')) type = `${type.substring(4)} of`
  return titleCapitalize(type.replaceAll('_',' '))
}

export function facetLabel(facet: string) {
  if (facet.startsWith('target.')) facet = facet.substring('target.'.length)
  if (facet.startsWith('m2o_')) facet = facet.substring('m2o_'.length)
  if (facet.endsWith('.id')) facet = facet.substring(0, facet.length-'.id'.length)
  return predicateLabel(facet.replaceAll('_',' '))
}

export function categoryLabel(type: string) {
  if (type === 'dcc') return 'DCC'
  else if (type === 'id_namespace') return 'Identifier Namespace'
  else if (type === 'c2m2_file') return 'File'
  else if (type === 'kg_assertion') return 'Knowledge Graph Assertion'
  else if (type === 'kg_relation') return 'Knowledge Graph Relation'
  else if (type === 'gene_set_library') return 'Gene Set Library'
  else if (type === 'gene_set') return 'Gene Set'
  else if (type === 'dcc_asset') return 'Processed File'
  else if (type === 'processed') return 'Processed Data'
  else if (type === 'c2m2') return 'Cross-Cut Metadata'
  else return entity_type_map[type] ?? titleCapitalize(type.replaceAll('_',' '))
}

export function itemIcon(item: EntityExpandedType, lookup?: Record<string, EntityType>) {
  if (lookup && item.m2o_dcc && item.m2o_dcc.id in lookup) {
    const dcc = lookup[item.m2o_dcc.id]
    return dcc.a_icon
  } else if (lookup && item.type === 'dcc' && item.id in lookup) {
    const dcc = lookup[item.id]
    return dcc.a_icon
  } else if (item.type === 'gene') {
    return GeneIcon
  } else if (item.type === 'drug') {
    return DrugIcon
  } else if (item.type == 'kg_relation') {
    return KGEdge
  } else {
    return KGNode
  }
}
export function itemLabel(item: EntityExpandedType) {
  return item.a_label?.replaceAll('_', ' ')
}

export function humanBytesSize(size: number) {
  if (size < 1e3) return `${(size).toPrecision(3)} B`
  if (size < 1e6) return `${(size/1e3).toPrecision(3)} KB`
  if (size < 1e9) return `${(size/1e6).toPrecision(3)} MB`
  if (size < 1e12) return `${(size/1e9).toPrecision(3)} GB`
  return `${(size/1e12).toPrecision(3)} TB`
}

export function itemDescription(item: EntityExpandedType, lookup?: Record<string, EntityType>) {
  if (item['type'] === 'file') return `A${item.a_size_in_bytes ? ` ${humanBytesSize(Number(item.a_size_in_bytes))}` : ''} file${lookup && item.m2o_dcc && item.m2o_dcc.id in lookup ? ` from ${lookup[item.m2o_dcc.id].a_label}` : ''}${item.a_assay_type ? ` produced from ${item.a_assay_type}` : ''} as part of the ${item.a_project_local_id.replaceAll('_', ' ').replaceAll('-',' ')} project`
  if (item['type'] === 'biosample') return `A biosample${lookup && item.m2o_dcc && item.m2o_dcc.id in lookup ? ` from ${lookup[item.m2o_dcc.id].a_label}` : ''} produced as part of the ${item.a_project_local_id.replaceAll('_', ' ').replaceAll('-',' ')} project`
  if (item['type'] === 'subject') return `A subject${lookup && item.m2o_dcc && item.m2o_dcc.id in lookup ? ` from ${lookup[item.m2o_dcc.id].a_label}` : ''} produced as part of the ${item.a_project_local_id.replaceAll('_', ' ').replaceAll('-',' ')} project`
  if (item['type'] === 'dcc_asset') return `A contributed ${item.a_filetype}${lookup && item.m2o_dcc && item.m2o_dcc.id in lookup ? ` from ${lookup[item.m2o_dcc.id].a_label}` : ''}`
  if (item['type'] === 'dcc') return `The ${item.a_label} data coordinating center`
  if (item.a_description) {
    if (item.a_description.length > 100) return `${item.a_description.slice(0, 100)}...`
    return `${item.a_description}`
  } else {
    return `A ${categoryLabel(item.type)}${lookup && item.m2o_dcc && item.m2o_dcc.id in lookup ? ` from ${lookup[item.m2o_dcc.id].a_label}` : ''}`
  }
}

export function linkify(value: string) {
  const uriMatch = /^(https?|drs):\/\/(.+)/.exec(value)
  if (uriMatch === null) {
    const nsPfMatch = /^(OBI|UBERON|data|format):(\w+)$/.exec(value)
    if (nsPfMatch !== null && nsPfMatch[1] === 'OBI') {
      return <a className="text-blue-600 cursor:pointer underline" href={`http://purl.obolibrary.org/obo/OBI_${nsPfMatch[2]}`} target="_blank">{value}</a>
    } else if (nsPfMatch !== null && nsPfMatch[1] === 'UBERON') {
      return <a className="text-blue-600 cursor:pointer underline" href={`http://purl.obolibrary.org/obo/UBERON_${nsPfMatch[2]}`} target="_blank">{value}</a>
    } else if (nsPfMatch !== null && nsPfMatch[1] === 'data') {
      return <a className="text-blue-600 cursor:pointer underline" href={`http://edamontology.org/data_${nsPfMatch[2]}`} target="_blank">{value}</a>
    } else if (nsPfMatch !== null && nsPfMatch[1] === 'format') {
      return <a className="text-blue-600 cursor:pointer underline" href={`http://edamontology.org/format_${nsPfMatch[2]}`} target="_blank">{value}</a>
    } else {
      const emailMatch = /^[^ @]+@[^ @]+$/.exec(value)
      if (emailMatch !== null) {
        return <a className="text-blue-600 cursor:pointer underline" href={`mailto:${value}`} target="_blank">{value}</a>
      } else {
        return <>{value}</>
      }
    }
  }
  if (uriMatch[1] === 'drs') return <a className="text-blue-600 cursor:pointer underline" href={`/data/drs?q=${encodeURIComponent(value)}`} target="_blank">{value}</a>
  else return <a className="text-blue-600 cursor:pointer underline" href={value} target="_blank">{value}</a>
}

export function parse_url(location: { pathname?: string, search?: ReadonlyURLSearchParams | URLSearchParams | string } = typeof window === 'undefined' ? {} : window.location): Record<string, string | null> {
  const m = /^(\/data)?\/processed(\/search\/(?<search>[^\/]+?)(\/(?<search_type>[^\/]+?))?|\/entity\/(?<type>[^\/]+?)(\/search\/(?<type_search>[^\/]+?)|\/(?<slug>[^\/]+?)(\/search\/(?<entity_search>[^\/]+?))?)?)$/.exec(location.pathname ?? '')
  return Object.fromEntries([
    ...(new URLSearchParams(location.search)).entries(),
    ...Object.entries(m?.groups ?? {}).map(([k,v]) => [k, typeof v === 'string' ? decodeURIComponent(v) : v]),
  ])
}
export function create_url({ error, search, search_type, type, type_search, slug, entity_search, ...searchParams }: {
  type?: string, slug?: string,
  search?: string, filter?: string,
  error?: string,
} & Record<string, string | null>) {
  let path = typeof window !== 'undefined' && window.location.origin === 'data.cfde.cloud' ? '' : '/data'
  const urlSearchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : undefined)
  if (!error) {
    path += `/processed`
    if (type_search) {
      search = type_search
      if (!search_type) search_type = type ?? null
    }
    if (search) {
      path += `/search/${encodeURIComponent(search)}`
      if (search_type) path += `/${encodeURIComponent(search_type)}`
    }
    else if (type) {
      path += `/entity/${encodeURIComponent(type)}`
      if (slug) {
        path += `/${encodeURIComponent(slug)}`
        if (entity_search) path += `/search/${encodeURIComponent(entity_search)}`
      } else {
        path += `/search`
      }
    }
    urlSearchParams.delete('search')
    urlSearchParams.delete('error')
  } else {
    if (search) searchParams['search'] = search
    searchParams['error'] = error
  }
  Object.entries(searchParams)
    .forEach(([k, v]) => { if (v === null) { urlSearchParams.delete(k) } else { urlSearchParams.set(k, v) } })
  if (urlSearchParams.size > 0) path += `?${urlSearchParams.toString()}`
  return path
}
