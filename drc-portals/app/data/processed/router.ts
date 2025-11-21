import { procedure, router } from '@/lib/trpc'
import elasticsearch from "@/lib/elasticsearch"
import { EntityType, M2MTargetType, targetEntityFromM2M, TermAggType } from '@/app/data/processed/utils'
import { estypes } from '@elastic/elasticsearch'
import { z } from 'zod'
import { groupby } from '@/utils/array'
import { safeAsync } from '@/utils/safe'

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
    if (props.input.search) {
      if (props.input.source_id) {
        must.push({ nested: { path: 'target', query: { simple_query_string: { query: props.input.search, fields: ['target.a_label^10', 'target.a_*^5'], default_operator: 'AND' } } } })
      } else {
        must.push({
          bool: {
            should: [
              { simple_query_string: { query: props.input.search, fields: ['a_label^10', 'a_*^5'], default_operator: 'AND' } },
              { nested: { path: 'r.target', query: { simple_query_string: { query: props.input.search, fields: ['r.target.a_*'], default_operator: 'AND' } } } }
            ],
          }
        })
      }
    }
    if (props.input.facet?.length) filter.push({
      query_string: {
        query: Object.entries(groupby(
          props.input.facet, f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
    const searchRes = await elasticsearch.search<M2MTargetType | EntityType>({
      index: props.input.source_id ? 'm2m_v11_nested_target_expanded' : 'entity_v11_nested_expanded',
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
    if (props.input.search) {
      if (props.input.source_id) {
        filter.push({ nested: { path: 'target', query: { simple_query_string: { query: props.input.search, fields: ['target.a_label^10', 'target.a_*^5'], default_operator: 'AND' } } } })
      } else {
        filter.push({
          bool: {
            should: [
              { simple_query_string: { query: props.input.search, fields: ['a_label^10', 'a_*^5'], default_operator: 'AND' } },
              { nested: { path: 'r.target', query: { simple_query_string: { query: props.input.search, fields: ['r.target.a_*'], default_operator: 'AND' } } } }
            ],
          }
        })
      }
    }
    if (props.input.facet?.length) filter.push({
      query_string: {
        query: Object.entries(groupby(
          props.input.facet, f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
    const aggs: Record<string, estypes.AggregationsAggregationContainer> = {}
    if (props.input.source_id) {
      aggs['predicate'] = { terms: { field: 'predicate', size: 20 } }
      aggs['target.type'] = { terms: { field: 'target.type', size: 20 } }
        // 'target.r_dcc', 'target.r_project',
        // 'target.r_source', 'target.r_relation', 'target.r_target',
        // 'target.r_disease', 'target.r_species', 'target.r_anatomy', 'target.r_gene', 'target.r_protein', 'target.r_compound', 'target.r_data_type', 'target.r_assay_type',
        // 'target.r_file_format', 'target.r_ptm_type', 'target.r_ptm_subtype', 'target.r_ptm_site_type',
    } else {
      aggs['type'] = { terms: { field: 'type', size: 20 } }
      aggs['r.predicate'] = { terms: { field: 'r.predicate', size: 20 } }
      aggs['r.target.id'] = { nested: { path: 'r.target' }, aggs: { 'r.target.id': { terms: { field: 'r.target.id' } } } }
        // 'type', 'r_dcc',
        // 'r_source', 'r_relation', 'r_target',
        // 'r_disease', 'r_species', 'r_anatomy', 'r_gene', 'r_protein', 'r_compound', 'r_data_type', 'r_assay_type',
        // 'r_file_format', 'r_ptm_type', 'r_ptm_subtype', 'r_ptm_site_type',
    }
    const { data: searchRes, error } = await safeAsync(() => elasticsearch.search<unknown, TermAggType<string>>({
      index: props.input.source_id ? 'm2m_v11_nested_target_expanded' : 'entity_v11_nested_expanded',
      query: {
        bool: {
          filter,
        },
      },
      aggs,
      size: 0,
      rest_total_hits_as_int: true,
    }))
    if (error || !searchRes) {
      console.error(error)
      throw new Error()
    }
    console.log(JSON.stringify(searchRes.aggregations))
    const aggregationsSimplified: Record<string, {buckets:{
        key: string;
        doc_count: number;
    }[]}> = Object.fromEntries(Object.entries(searchRes.aggregations).flatMap(([k,v]) => {
      if ('buckets' in v) return [[k,v]]
      else if ('buckets' in v[k]) return [[k, v[k]]]
      else return []
    }))
    console.log(aggregationsSimplified)
    const entityLookupRes = await elasticsearch.search<EntityType>({
      index: 'entity_v11',
      query: {
        ids: {
          values: Array.from(new Set([
            ...Object.entries(aggregationsSimplified).flatMap(([facet, { buckets }]) => {
              if (facet === 'r_dcc') return []
              else return buckets.map(filter => filter.key)
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
      aggregations: aggregationsSimplified,
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
      index: props.input.source_id ? 'm2m_v11_nested_target_expanded' : 'entity',
      query: {
        function_score: {
          query: {
            bool: {
              must: {
                match_phrase_prefix: props.input.source_id ? {
                  'target.a_label': props.input.search,
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
