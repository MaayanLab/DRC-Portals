import { procedure, router } from '@/lib/trpc'
import elasticsearch from "@/lib/elasticsearch"
import { EntityExpandedType, FilterAggType, TermAggType } from '@/app/data/processed/utils'
import { estypes } from '@elastic/elasticsearch'
import { z } from 'zod'
import { groupby } from '@/utils/array'
import { TRPCError } from '@trpc/server'
import { esDCCs } from './dccs'

const limit = 100

export default router({
  dccs: procedure.query(async (props) => {
    return await esDCCs
  }),
  types: procedure.input(z.object({
    search: z.string().optional(),
    include: z.string().array().optional(),
  })).query(async (props) => {
    const filter: estypes.QueryDslQueryContainer[] = []
    if (props.input.search) filter.push({ simple_query_string: { query: props.input.search, fields: ['a_label^10', 'a_*^5', 'm2m_*.a_'], default_operator: 'AND' } })
    const searchRes = await elasticsearch.search<EntityExpandedType, TermAggType<'types'>>({
      index: 'entity_expanded',
      query: filter.length > 0 ? { bool: { filter } } : undefined,
      aggs: {
        types: {
          terms: {
            field: 'type',
            size: 1000,
            include: props.input.include,
          },
        },
      },
      size: 0,
      rest_total_hits_as_int: true,
    })
    if (!searchRes?.hits.total) throw new TRPCError({ code: 'NOT_FOUND' })
    return {
      types: searchRes.aggregations?.types.buckets,
      total: Number(searchRes.hits.total)
    }
  }),
  entity: procedure.input(z.object({
    type: z.string(),
    slug: z.string(),
  })).query(async (props) => {
    if (props.input.type === 'dcc') {
      return (await esDCCs)[props.input.slug]
    }
    const itemRes = await elasticsearch.search<EntityExpandedType>({
      index: 'entity_expanded',
        query: {
          bool: {
            must: [
              { term: { 'type': props.input.type } },
              { term: { 'slug': props.input.slug } },
            ]
          },
        },
    })
    const item = itemRes.hits.hits[0]
    return item?._source
  }),
  search: procedure.input(z.object({
    source_id: z.string().optional(),
    search: z.string().optional(),
    facet: z.string().array().optional(),
    cursor: z.string().optional(),
    reverse: z.boolean().optional().default(false),
    size: z.number().default(10).transform(size => Math.max(0, Math.min(size, limit))),
  })).query(async (props) => {
    const must: estypes.QueryDslQueryContainer[] = []
    const filter: estypes.QueryDslQueryContainer[] = []
    if (props.input.source_id) filter.push({ query_string: { query: `"${props.input.source_id}"`, fields: ['m2m_*.id'] } })
    if (props.input.search) must.push({ simple_query_string: { query: props.input.search, fields: ['a_label^10', 'a_*^5', 'm2m_*.a_'], default_operator: 'AND' } })
    if (props.input.facet?.length) filter.push({
      query_string: {
        query: Object.entries(groupby(
          props.input.facet, f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
    if (must.length + filter.length === 0) throw new TRPCError({ code: 'NOT_FOUND' })
    const searchRes = await elasticsearch.search<EntityExpandedType, FilterAggType<'files'>>({
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
      aggs: {
        files: {
          filter: {
            exists: { field: 'a_access_url' }
          },
        },
      },
      sort: !props.input.reverse ? [
        {'_score': {'order': 'desc'}},
        {'id': {'order': 'asc'} },
      ] : [
        {'_score': {'order': 'asc'}},
        {'id': {'order': 'desc'} },
      ],
      size: props.input.size,
      search_after: props.input.cursor ? JSON.parse(props.input.cursor) : undefined,
      rest_total_hits_as_int: true,
    })
    if (props.input.reverse) searchRes.hits.hits.reverse()
    const first = searchRes.hits.hits.length === props.input.size ? JSON.stringify(searchRes.hits.hits[0].sort) : undefined
    const next = searchRes.hits.hits.length === props.input.size ? JSON.stringify(searchRes.hits.hits[searchRes.hits.hits.length-1].sort) : undefined
    const items = searchRes.hits.hits.map(hit => hit._source).filter((hit): hit is EntityExpandedType => !!hit)
    return {
      items,
      total: searchRes.hits.total,
      total_accessible: searchRes.aggregations?.files.doc_count,
      first,
      next,
    }
  }),
  facet: procedure.input(z.object({
    source_id: z.string().optional(),
    search: z.string().optional(),
    facet: z.string().array().optional(),
  })).query(async (props) => {
    const filter: estypes.QueryDslQueryContainer[] = []
    if (props.input.source_id) filter.push({ simple_query_string: { query: `"${props.input.source_id}"`, fields: ['m2m_*.id'] } })
    if (props.input.search) filter.push({ simple_query_string: { query: props.input.search, fields: ['a_label^10', 'a_*^5', 'm2m_*.a_'], default_operator: 'AND' } })
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
      'm2m_disease.id', 'm2m_species.id', 'm2m_anatomy.id', 'm2m_gene.id', 'm2m_protein.id', 'm2m_compound.id', 'm2m_data_type.id', 'm2m_assay_type.id',
      'm2m_file_format.id', 'm2m_ptm_type.id', 'm2m_ptm_subtype.id', 'm2m_ptm_site_type.id',
      'm2m_project.id', 'm2m_dcc.id',
      'm2m_source.id', 'm2m_relation.id', 'm2m_target.id',
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
              if (facet === 'm2m_dcc.id') return []
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
    if (props.input.source_id) filter.push({ query_string: { query: `"${props.input.source_id}"`, fields: ['m2m_*.id'] } })
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
    const items = searchRes.hits.hits.map(hit => ({ type: hit._source?.type, a_label: hit._source?.a_label, id: hit._source?.id }))
    return items.filter((hit): hit is { type: string, a_label: string, id: string } => !!hit.type && !!hit.a_label)
  })
})
