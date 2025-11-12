import { procedure, router } from '@/lib/trpc'
import elasticsearch from "@/lib/elasticsearch"
import { EntityType, M2MTargetType, TermAggType } from '@/app/data/processed/utils'
import { estypes } from '@elastic/elasticsearch'
import { z } from 'zod'
import { groupby } from '@/utils/array'

const limit = 100

export default router({
  search: procedure.input(z.object({
    source_id: z.string().optional(),
    search: z.string().optional(),
    facet: z.string().array().optional(),
    cursor: z.string().optional(),
  })).mutation(async (props) => {
    const filter: estypes.QueryDslQueryContainer[] = []
    if (props.input.source_id) filter.push({ query_string: { query: `+source_id:"${props.input.source_id}"` } })
    if (props.input.search) filter.push({ simple_query_string: { query: props.input.search, default_operator: 'AND' } })
    if (props.input.facet?.length) filter.push({
      query_string: {
        query: Object.entries(groupby(
          props.input.facet, f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
    const searchRes = await elasticsearch.search<M2MTargetType | EntityType>({
      index: props.input.source_id ? 'm2m_target_expanded' : 'entity',
      query: {
        bool: {
          filter,
        },
      },
      sort: props.input.source_id ? [
        {'target_pagerank': {'order': 'desc'}},
        {'target_id': {'order': 'asc'} },
      ] : [
        {'pagerank': {'order': 'desc'}},
        {'id': {'order': 'asc'} },
      ],
      size: limit,
      search_after: props.input.cursor ? JSON.parse(props.input.cursor) : undefined,
      rest_total_hits_as_int: true,
    })
    const next = searchRes.hits.hits.length === limit ? JSON.stringify(searchRes.hits.hits[searchRes.hits.hits.length-1].sort) : undefined
    const items = props.input.source_id ?
      searchRes.hits.hits.map(hit => Object.fromEntries(Object.entries(hit._source as M2MTargetType).flatMap(([k,v]) => k.startsWith('target_') ? [[k.substring('target_'.length), v]] : [])))
      : searchRes.hits.hits.map(hit => hit._source)
    return {
      items,
      total: searchRes.hits.total,
      next,
    }
  }),
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
          props.input.facet, f => f.substring(0, f.indexOf(':'))
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
      aggs: Object.fromEntries(facets.map(facet => [facet, { terms: { field: facet as string, size: 20 } }])),
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
      size: 200,
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
