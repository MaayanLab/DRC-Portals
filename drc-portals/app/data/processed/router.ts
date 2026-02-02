import { procedure, router } from '@/lib/trpc'
import elasticsearch from "@/lib/elasticsearch"
import { EntityExpandedType, M2MExpandedTargetType, TermAggType } from '@/app/data/processed/utils'
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
    const must: estypes.QueryDslQueryContainer[] = []
    const filter: estypes.QueryDslQueryContainer[] = []
    if (props.input.source_id) filter.push({ query_string: { query: `+source_id:"${props.input.source_id}"` } })
    if (props.input.search) {
      if (props.input.source_id) must.push({ simple_query_string: { query: props.input.search, fields: ['target.a_label^10', 'target.a_*^5', 'target.r_*.a_*'], default_operator: 'AND' } })
      else must.push({ simple_query_string: { query: props.input.search, fields: ['a_label^10', 'a_*^5', 'r_*.a_*'], default_operator: 'AND' } })
    }
    if (props.input.facet?.length) filter.push({
      query_string: {
        query: Object.entries(groupby(
          props.input.facet, f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
    const searchRes = await elasticsearch.search<M2MExpandedTargetType | EntityExpandedType>({
      index: props.input.source_id ? 'm2m_expanded_target_expanded' : 'entity_expanded',
      query: {
        function_score: {
          query: {
            bool: {
              must,
              filter,
            },
          },
          functions: [
            {
              field_value_factor: {
                field: props.input.source_id ? 'target.pagerank' : 'pagerank',
                missing: 1,
              }
            }
          ],
          boost_mode: "sum"
        },
      },
      sort: props.input.source_id ? [
        {'_score': {'order': 'desc'}},
        {'target_id': {'order': 'asc'} },
      ] : [
        {'_score': {'order': 'desc'}},
        {'id': {'order': 'asc'} },
      ],
      size: limit,
      search_after: props.input.cursor ? JSON.parse(props.input.cursor) : undefined,
      rest_total_hits_as_int: true,
    })
    const next = searchRes.hits.hits.length === limit ? JSON.stringify(searchRes.hits.hits[searchRes.hits.hits.length-1].sort) : undefined
    const items = props.input.source_id ?
      searchRes.hits.hits.map(hit => Object.fromEntries(Object.entries(hit._source as M2MExpandedTargetType).flatMap(([k,v]) => k.startsWith('target_') ? [[k.substring('target_'.length), v]] : [])))
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
    if (props.input.search) {
      if (props.input.source_id) filter.push({ simple_query_string: { query: props.input.search, fields: ['target.a_label^10', 'target.a_*^5', 'target.r_*.a_*'], default_operator: 'AND' } })
      else filter.push({ simple_query_string: { query: props.input.search, fields: ['a_label^10', 'a_*^5', 'r_*.a_*'], default_operator: 'AND' } })
    }
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
        'target.type',
        'target.r_disease.id', 'target.r_species.id', 'target.r_anatomy.id', 'target.r_gene.id', 'target.r_protein.id', 'target.r_compound.id', 'target.r_data_type.id', 'target.r_assay_type.id',
        'target.r_file_format.id', 'target.r_ptm_type.id', 'target.r_ptm_subtype.id', 'target.r_ptm_site_type.id',
        'target.r_project.id', 'target.r_dcc.id',
        'target.r_source.id', 'target.r_relation.id', 'target.r_target.id',
      )
    } else {
      facets.push(
        'type',
        'r_disease.id', 'r_species.id', 'r_anatomy.id', 'r_gene.id', 'r_protein.id', 'r_compound.id', 'r_data_type.id', 'r_assay_type.id',
        'r_file_format.id', 'r_ptm_type.id', 'r_ptm_subtype.id', 'r_ptm_site_type.id',
        'r_project.id', 'r_dcc.id',
        'r_source.id', 'r_relation.id', 'r_target.id',
      )
    }
    const searchRes = await elasticsearch.search<M2MExpandedTargetType | EntityExpandedType, TermAggType<typeof facets[0]>>({
      index: props.input.source_id ? 'm2m_expanded_target_expanded' : 'entity_expanded',
      query: {
        bool: {
          filter,
        },
      },
      aggs: Object.fromEntries(facets.map(facet => [facet, { terms: { field: facet as string, size: 20 } }])),
      size: 0,
      rest_total_hits_as_int: true,
    })
    const entityLookupRes = await elasticsearch.search<EntityExpandedType>({
      index: 'entity_expanded',
      query: {
        ids: {
          values: Array.from(new Set([
            ...facets.flatMap(facet => {
              if (facet === 'r_dcc.id') return []
              const agg = searchRes.aggregations
              if (!agg) return []
              return agg[facet].buckets.map(filter => filter.key)
            }),
          ]))
        }
      },
      size: 200,
    })
    const entityLookup: Record<string, EntityExpandedType> = Object.fromEntries([
      ...entityLookupRes.hits.hits.filter((hit): hit is typeof hit & {_source: EntityExpandedType} => !!hit._source).map((hit) => [hit._id, hit._source]),
    ])
    return {
      total: searchRes.hits.total,
      aggregations: searchRes.aggregations,
      entityLookup,
    }
  }),
  autocomplete: procedure.input(z.object({
    search: z.string(),
    source_id: z.string().optional(),
    facet: z.string().array().optional(),
  })).query(async (props) => {
    if (props.input.search.length < 3) return []
    const filter: estypes.QueryDslQueryContainer[] = []
    if (props.input.source_id) filter.push({ query_string: { query: `+source_id:"${props.input.source_id}"` } })
    if (props.input.facet?.length) filter.push({
      query_string: {
        query: Object.entries(groupby(
          props.input.facet, f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
    const searchRes = await elasticsearch.search<M2MExpandedTargetType | EntityExpandedType>({
      index: props.input.source_id ? 'm2m_expanded_target_expanded' : 'entity_expanded',
      query: {
        function_score: {
          query: {
            bool: {
              must: {
                match_phrase_prefix: props.input.source_id ? {
                  target_a_label: props.input.search,
                } : {
                  a_label: props.input.search,
                },
              },
              filter,
            }
          },
          functions: [
            {
              field_value_factor: {
                field: props.input.source_id ? 'target.pagerank' : 'pagerank',
                missing: 1,
              }
            }
          ],
          boost_mode: "sum"
        },
      },
      sort: props.input.source_id ? [
        {'_score': {'order': 'desc'}},
        {'target_id': {'order': 'asc'} },
      ] : [
        {'_score': {'order': 'desc'}},
        {'id': {'order': 'asc'} },
      ],
      size: 10,
      track_total_hits: false,
    })
    const items = props.input.source_id ?
      searchRes.hits.hits.map(hit => ({ type: (hit._source as M2MExpandedTargetType)?.target.type, a_label: (hit._source as M2MExpandedTargetType)?.target.a_label }))
      : searchRes.hits.hits.map(hit => ({ type: (hit._source as EntityExpandedType)?.type, a_label: (hit._source as EntityExpandedType)?.a_label }))
    return items.filter((hit): hit is { type: string, a_label: string } => !!hit.type && !!hit.a_label)
  })
})
