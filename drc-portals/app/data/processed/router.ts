import { procedure, router } from '@/lib/trpc'
import elasticsearch from "@/lib/elasticsearch"
import { EntityExpandedType, TermAggType } from '@/app/data/processed/utils'
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
    if (props.input.source_id) filter.push({ query_string: { query: `${props.input.source_id}`, fields: ['m2o_*.id', 'm2m_*'] } })
    if (props.input.search) must.push({ simple_query_string: { query: props.input.search, fields: ['a_label^10', 'a_*^5', 'm2o_*.a_*'], default_operator: 'AND' } })
    if (props.input.facet?.length) filter.push({
      query_string: {
        query: Object.entries(groupby(
          props.input.facet, f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
    const searchRes = await elasticsearch.search<EntityExpandedType>({
      index: 'entity_expanded',
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
                field: 'pagerank',
                missing: 1,
              }
            }
          ],
          boost_mode: "sum"
        },
      },
      sort: [
        {'_score': {'order': 'desc'}},
        {'id': {'order': 'asc'} },
      ],
      size: limit,
      search_after: props.input.cursor ? JSON.parse(props.input.cursor) : undefined,
      rest_total_hits_as_int: true,
    })
    const next = searchRes.hits.hits.length === limit ? JSON.stringify(searchRes.hits.hits[searchRes.hits.hits.length-1].sort) : undefined
    const items = searchRes.hits.hits.filter((hit): hit is typeof hit & { _source: EntityExpandedType } => !!hit._source)
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
    if (props.input.source_id) filter.push({ simple_query_string: { query: `"${props.input.source_id}"`, fields: ['m2o_*.id', 'm2m_*'] } })
    if (props.input.search) filter.push({ simple_query_string: { query: props.input.search, fields: ['a_label^10', 'a_*^5', 'm2o_*.a_*'], default_operator: 'AND' } })
    if (props.input.facet?.length) filter.push({
      query_string: {
        query: Object.entries(groupby(
          props.input.facet, f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
    let facets: string[] = []
    facets.push(
      'type',
      'm2o_disease.id', 'm2o_species.id', 'm2o_anatomy.id', 'm2o_gene.id', 'm2o_protein.id', 'm2o_compound.id', 'm2o_data_type.id', 'm2o_assay_type.id',
      'm2o_file_format.id', 'm2o_ptm_type.id', 'm2o_ptm_subtype.id', 'm2o_ptm_site_type.id',
      'm2o_project.id', 'm2o_dcc.id',
      'm2o_source.id', 'm2o_relation.id', 'm2o_target.id',
    )
    const searchRes = await elasticsearch.search<EntityExpandedType, TermAggType<typeof facets[0]>>({
      index: 'entity_expanded',
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
              if (facet === 'm2o_dcc.id') return []
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
    const must: estypes.QueryDslQueryContainer[] = []
    const filter: estypes.QueryDslQueryContainer[] = []
    if (props.input.source_id) filter.push({ query_string: { query: `"${props.input.source_id}"`, fields: ['m2o_*.id', 'm2m_*'] } })
    if (props.input.facet?.length) filter.push({
      query_string: {
        query: Object.entries(groupby(
          props.input.facet, f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
    must.push({ match_phrase_prefix: { a_label: props.input.search } })
    const searchRes = await elasticsearch.search<EntityExpandedType>({
      index: 'entity_expanded',
      query: {
        function_score: {
          query: {
            bool: {
              must,
              filter,
            }
          },
          functions: [
            {
              field_value_factor: {
                field: 'pagerank',
                missing: 1,
              }
            }
          ],
          boost_mode: "sum"
        },
      },
      sort: [
        {'_score': {'order': 'desc'}},
        {'id': {'order': 'asc'} },
      ],
      size: 10,
      track_total_hits: false,
    })
    const items = searchRes.hits.hits.map(hit => ({ type: hit._source?.type, a_label: hit._source?.a_label }))
    return items.filter((hit): hit is { type: string, a_label: string } => !!hit.type && !!hit.a_label)
  })
})
