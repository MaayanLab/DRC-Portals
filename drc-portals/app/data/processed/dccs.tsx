import elasticsearch from '@/lib/elasticsearch'
import prisma from '@/lib/prisma'
import singleton from '@/lib/singleton'
import { EntityExpandedType, EntityType } from '@/app/data/processed/utils'

export const prismaDCCs = singleton('prismaDCCs', async () => {
  const dccs = await prisma.dCC.findMany({
    select: {
      short_label: true,
      label: true,
      icon: true,
      description: true,
      homepage: true,
    }
  })
  return Object.fromEntries(dccs.map(dcc => [dcc.short_label, dcc] as [string, typeof dcc]))
})

export async function getPrismaDCC(short_label?: string) {
  const dccsResolved = await prismaDCCs
  return short_label ? dccsResolved[short_label] : undefined
}

export const esDCCs = singleton('esDCCs', async () => {
  const dccs = await elasticsearch.search<EntityExpandedType>({
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
  const dcc_lookup: Record<string, EntityExpandedType & {l_primary_project?: EntityType[]}> = {}
  await Promise.allSettled(
    dccs.hits.hits.map(async (dcc) => {
      const esDCC = dcc._source as EntityExpandedType
      if (esDCC.type === 'dcc') {
        if (!(esDCC.slug in dcc_lookup)) dcc_lookup[esDCC.slug] = dcc_lookup[esDCC.id] = esDCC
        else dcc_lookup[esDCC.id] = dcc_lookup[esDCC.slug]
        Object.assign(dcc_lookup[esDCC.id], esDCC)
        const prismaDCC = await getPrismaDCC(esDCC.slug)
        if (prismaDCC?.icon) esDCC.a_icon = prismaDCC.icon
        if (prismaDCC?.description && !esDCC.a_description) esDCC.a_description = prismaDCC?.description
        if (prismaDCC?.homepage && !esDCC.a_homepage) esDCC.a_homepage = prismaDCC?.homepage
        esDCC.a_info_url = `${process.env.PUBLIC_URL ?? ''}/info/dcc/${esDCC.slug}`
      } else if (esDCC.type === 'project') {
        if (!(esDCC.m2o_dcc.slug in dcc_lookup)) dcc_lookup[esDCC.m2o_dcc.slug] = { l_primary_project: [] } as unknown as EntityExpandedType & {l_primary_project?: EntityType[]}
        if (!dcc_lookup[esDCC.m2o_dcc.slug].l_primary_project) dcc_lookup[esDCC.m2o_dcc.slug].l_primary_project = []
        dcc_lookup[esDCC.m2o_dcc.slug].l_primary_project?.push(esDCC)
      }
    })
  )
  for (const short_label in dcc_lookup) {
    if (dcc_lookup[short_label].slug !== short_label) continue
    if (dcc_lookup[short_label].l_primary_project) {
      for (const primary_project of dcc_lookup[short_label].l_primary_project) {
        if (primary_project.a_dcc_abreviation === short_label) {
          for (const k in primary_project) {
            if (k.startsWith('a_dcc_')) {
              Object.assign(dcc_lookup[short_label], { [`a_${k.slice('a_dcc_'.length)}`]: primary_project[k as keyof EntityType] })
            }
          }
        }
      }
    }
  }
  return dcc_lookup
})

export async function getEsDCC(id?: string) {
  const dccsResolved = await esDCCs
  return id ? dccsResolved[id] : undefined
}
