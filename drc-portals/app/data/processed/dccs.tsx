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
            query: '+type:dcc',
          }
        }
      },
    },
    size: 100,
    track_total_hits: false,
  })
  return Object.fromEntries(await Promise.all(
    dccs.hits.hits.map(async (dcc) => {
      const esDCC = dcc._source as EntityType
      const prismaDCC = await getPrismaDCC(esDCC.slug)
      if (prismaDCC?.icon) esDCC.a_icon = prismaDCC.icon
      return [dcc._id, esDCC] as [string, EntityType]
    })
  ))
})

export async function getEsDCC(id?: string) {
  const dccsResolved = await esDCCs
  return id ? dccsResolved[id] : undefined
}
