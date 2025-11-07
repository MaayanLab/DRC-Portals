import { procedure, router } from '@/lib/trpc'
import elasticsearch from "@/lib/elasticsearch"
import { EntityType, TermAggType } from '@/app/data/processed/utils'
import { estypes } from '@elastic/elasticsearch'
import { z } from 'zod'
import { groupby } from '@/utils/array'

export default router({
  facet: procedure.input(z.object({
    source_id: z.string().optional(),
    search: z.string().optional(),
    facet: z.string().array().optional(),
  })).query(async (props) => {
    const filter: estypes.QueryDslQueryContainer[] = []
    if (props.input.source_id) filter.push({ query_string: { query: `+source_id:"${props.input.source_id}"` } })
    if (props.input.search) filter.push({ simple_query_string: { query: props.input.search, default_operator: 'AND' } })
    if (props.input.facet?.length) filter.push({
      query_string: {
        query: Object.entries(groupby(
          props.input.facet.filter(f => !!f), f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
    let facets: string[] = []
    if (props.input.source_id) {
      facets.push(
        'target_type', 'target_predicate',
        'target_r_dcc', 'target_r_project',
        'target_r_source', 'target_r_relation', 'target_r_target',
        'target_r_disease', 'target_r_species', 'target_r_anatomy', 'target_r_gene', 'target_r_protein', 'target_r_compound', 'target_r_data_type', 'target_r_assay_type',
        'target_r_file_format', 'target_r_ptm_type', 'target_r_ptm_subtype', 'target_r_ptm_site_type',
      )
    } else {
      facets.push(
        'r_dcc',
        'r_source', 'r_relation', 'r_target',
        'r_disease', 'r_species', 'r_anatomy', 'r_gene', 'r_protein', 'r_compound', 'r_data_type', 'r_assay_type',
        'r_file_format', 'r_ptm_type', 'r_ptm_subtype', 'r_ptm_site_type',
      )
    }
    const searchRes = await elasticsearch.search<unknown, TermAggType<typeof facets[0]>>({
      index: props.input.source_id ? 'm2m_target_expanded' : 'entity',
      query: {
        bool: {
          filter,
        },
      },
      aggs: Object.fromEntries(facets.map(facet => [facet, { terms: { field: facet as string, size: 5 } }])),
      size: 0,
      rest_total_hits_as_int: true,
    })
    const entityLookupRes = await elasticsearch.search<EntityType>({
      index: 'entity',
      query: {
        ids: {
          values: Array.from(new Set([
            ...facets.flatMap(facet => {
              if (facet === 'r_dcc') return []
              const agg = searchRes.aggregations
              if (!agg) return []
              return agg[facet].buckets.map(filter => filter.key)
            }),
          ]))
        }
      },
      size: 100,
    })
    const entityLookup: Record<string, EntityType> = Object.fromEntries([
      ...entityLookupRes.hits.hits.filter((hit): hit is typeof hit & {_source: EntityType} => !!hit._source).map((hit) => [hit._id, hit._source]),
    ])
    return {
      total: searchRes.hits.total,
      aggregations: searchRes.aggregations,
      entityLookup,
    }
  }),
})
