import { procedure, router } from '@/lib/trpc'
import elasticsearch from "@/lib/elasticsearch"
import { EntityType, M2MTargetType, targetEntityFromM2M, TermAggType } from '@/app/data/processed/utils'
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
    if (props.input.source_id) filter.push({ query_string: { query: `source_id:"${props.input.source_id}"` } })
    if (props.input.search) must.push({ simple_query_string: { query: props.input.search, default_operator: 'AND' } })
    if (props.input.facet?.length) filter.push({
      query_string: {
        query: Object.entries(groupby(
          props.input.facet, f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
    const searchRes = await elasticsearch.search<M2MTargetType | EntityType>({
      index: props.input.source_id ? 'm2m_target_expanded' : 'entity_expanded',
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
                field: props.input.source_id ? 'target_pagerank' : 'pagerank',
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
      searchRes.hits.hits.map(hit => targetEntityFromM2M(hit._source as M2MTargetType))
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
    if (props.input.source_id) filter.push({ query_string: { query: `source_id:"${props.input.source_id}"` } })
    if (props.input.search) filter.push({ simple_query_string: { query: props.input.search, fields: props.input.source_id ? ['target_a_label^10', 'target_a_*^5', 'target_r_*_a_*'] : ['a_label^10', 'a_*^5', 'r_*_a_*'], default_operator: 'AND' } })
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
        'predicate',
        'target_type',
        'target_r_dcc_id', 'target_r_project_id',
        'target_r_source_id', 'target_r_relation_id', 'target_r_target_id',
        'target_r_disease_id', 'target_r_species_id', 'target_r_anatomy_id', 'target_r_gene_id', 'target_r_protein_id', 'target_r_compound_id', 'target_r_data_type_id', 'target_r_assay_type_id',
        'target_r_file_format_id', 'target_r_ptm_type_id', 'target_r_ptm_subtype_id', 'target_r_ptm_site_type_id',
      )
    } else {
      facets.push(
        'type', 'r_dcc_id',
        'r_source_id', 'r_relation_id', 'r_target_id',
        'r_disease_id', 'r_species_id', 'r_anatomy_id', 'r_gene_id', 'r_protein_id', 'r_compound_id', 'r_data_type_id', 'r_assay_type_id',
        'r_file_format_id', 'r_ptm_type_id', 'r_ptm_subtype_id', 'r_ptm_site_type_id',
      )
    }
    const searchRes = await elasticsearch.search<unknown, TermAggType<typeof facets[0]>>({
      index: props.input.source_id ? 'm2m_target_expanded' : 'entity_expanded',
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
              if (facet === 'r_dcc_id') return []
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
    const searchRes = await elasticsearch.search<M2MTargetType | EntityType>({
      index: props.input.source_id ? 'm2m_target_expanded' : 'entity',
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
            },
          },
          functions: [
            {
              field_value_factor: {
                field: props.input.source_id ? 'target_pagerank' : 'pagerank',
                missing: 1,
              }
            }
          ],
          boost_mode: "sum"
        },
      },
      sort: props.input.source_id ? [
        {'_score': {'order': 'desc'}},
        {'target_id': {'order': 'desc'} },
      ] : [
        {'_score': {'order': 'desc'}},
        {'id': {'order': 'desc'} },
      ],
      size: 10,
      track_total_hits: false,
    })
    const items = props.input.source_id ?
      searchRes.hits.hits.map(hit => ({ type: hit._source?.target_type, a_label: hit._source?.target_a_label }))
      : searchRes.hits.hits.map(hit => ({ type: hit._source?.type, a_label: hit._source?.a_label }))
    return items.filter((hit): hit is { type: string, a_label: string } => !!hit.type && !!hit.a_label)
  })
})
