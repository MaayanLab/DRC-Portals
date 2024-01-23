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

export function type_to_string(type: NodeType | string, entity_type: string | null) {
  if (type === 'entity') return entity_type ? capitalize(entity_type) : 'Entity'
  else if (type === 'c2m2_file') return 'File'
  else if (type === 'kg_relation') return 'Knowledge Graph Relation'
  else if (type === 'gene_set_library') return 'Gene Set Library'
  else if (type === 'gene_set') return 'Gene Set'
  else if (type === 'dcc_asset') return 'Processed File'
  else return capitalize(type)
}

/*
  8-bit hash of a javascript string
  https://en.wikipedia.org/wiki/Pearson_hashing
*/
const pearson_hash_T = [40, 93, 49, 71, 153, 106, 56, 48, 124, 203, 254, 230, 100, 246, 45, 55, 97, 146, 185, 74, 107, 196, 63, 69, 241, 46, 240, 101, 43, 110, 139, 95, 225, 117, 82, 32, 192, 201, 216, 141, 42, 38, 29, 34, 36, 128, 118, 208, 242, 77, 25, 85, 219, 35, 44, 142, 239, 105, 10, 248, 18, 202, 224, 186, 173, 147, 135, 165, 233, 57, 161, 188, 113, 222, 179, 209, 108, 212, 114, 195, 88, 184, 14, 137, 167, 5, 144, 140, 66, 162, 152, 112, 169, 149, 178, 159, 30, 217, 96, 23, 122, 120, 111, 227, 134, 50, 143, 116, 191, 84, 37, 187, 102, 166, 157, 12, 15, 60, 228, 13, 255, 199, 78, 236, 211, 232, 7, 41, 250, 109, 86, 0, 52, 226, 125, 221, 39, 148, 61, 154, 218, 115, 81, 24, 79, 223, 1, 168, 19, 193, 136, 121, 94, 174, 237, 177, 249, 127, 180, 17, 59, 170, 8, 91, 145, 70, 205, 175, 234, 172, 189, 72, 73, 235, 213, 238, 204, 90, 87, 31, 54, 171, 67, 198, 21, 75, 158, 119, 6, 58, 183, 164, 80, 103, 68, 210, 251, 182, 123, 16, 190, 126, 243, 197, 99, 62, 247, 53, 33, 131, 3, 206, 194, 104, 11, 65, 231, 20, 89, 244, 76, 132, 64, 181, 47, 133, 151, 160, 130, 22, 51, 214, 150, 9, 207, 28, 229, 215, 245, 163, 138, 129, 176, 200, 26, 98, 220, 27, 92, 155, 2, 253, 252, 156, 4, 83]
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
export function type_to_color(type: NodeType | string, entity_type: string | null) {
  return palette[pearson_hash(type_to_string(type, entity_type))]
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
      z.string().transform(ts => ts ? ts.split('|') : undefined),
      z.undefined(),
    ]).transform(ts => ts ? ts.map(t => {
      const [type, entity_type] = t.split(':')
      return { type, entity_type: entity_type ? entity_type : null }
    }) : undefined),
  }).parse(props.searchParams)
}
