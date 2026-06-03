import elasticsearch from '@/lib/elasticsearch'
import prisma from '@/lib/prisma'
import singleton from '@/lib/singleton'
import { EntityType } from '@/app/data/processed/utils'

export const prismaDCCs = singleton('prismaDCCs', async () => {
  const dccs = await prisma.dCC.findMany({
    select: {
      short_label: true,
      label: true,
      icon: true,
    }
  })
  return Object.fromEntries(dccs.map(dcc => [dcc.short_label, dcc] as [string, typeof dcc]))
})

export async function getPrismaDCC(short_label?: string) {
  const dccsResolved = await prismaDCCs
  return short_label ? dccsResolved[short_label] : undefined
}

export const esDCCs = singleton('esDCCs', async () => {
  const dccs = await elasticsearch.search<EntityType>({
    index: 'entity_expanded',
    query: {
      bool: {
        filter: {
          query_string: {
            query: 'type:dcc OR (type:project AND _exists_:a_dcc_abbreviation)',
          }
        }
      },
    },
    size: 200,
    track_total_hits: false,
  })
  const dcc_lookup: Record<string, EntityType> = {}
  await Promise.allSettled(
    dccs.hits.hits.map(async (dcc) => {
      const esDCC = dcc._source as EntityType
      if (esDCC.type === 'dcc') {
        if (!(esDCC.slug in dcc_lookup)) dcc_lookup[esDCC.slug] = dcc_lookup[esDCC.id] = esDCC
        else dcc_lookup[esDCC.id] = dcc_lookup[esDCC.slug]
        Object.assign(dcc_lookup[esDCC.id], esDCC)
        const prismaDCC = await getPrismaDCC(esDCC.slug)
        if (prismaDCC?.icon) esDCC.a_icon = prismaDCC.icon
        dcc_lookup[esDCC.id].a_info_url = `${process.env.PUBLIC_URL ?? ''}/info/dcc/${esDCC.slug}`
      } else if (esDCC.type === 'project' && esDCC.a_abbreviation === esDCC.a_dcc_abbreviation) {
        if (!(esDCC.a_dcc_abbreviation in dcc_lookup)) dcc_lookup[esDCC.a_dcc_abbreviation] = Object.fromEntries(Object.entries(esDCC).filter(([k,v]) => k.startsWith('a_'))) as EntityType
        else Object.assign(dcc_lookup[esDCC.a_dcc_abbreviation], Object.fromEntries(Object.entries(esDCC).filter(([k,v]) => k.startsWith('a_'))))
      }
    })
  )
  return dcc_lookup
})

export async function getEsDCC(id?: string) {
  const dccsResolved = await esDCCs
  return id ? dccsResolved[id] : undefined
}
