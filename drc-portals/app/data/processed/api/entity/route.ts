import { type NextRequest } from 'next/server'
import elasticsearch from "@/lib/elasticsearch"
import { EntityType, M2MTargetType } from '@/app/data/processed/utils'
import { estypes } from '@elastic/elasticsearch'

const limit = 1000

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const filter: estypes.QueryDslQueryContainer[] = []
  if (searchParams.has('search')) filter.push({ simple_query_string: { query: searchParams.getAll('search').join(' '), default_operator: 'AND' } })
  if (searchParams.has('source_id')) filter.push({ query_string: { query: `+source_id:"${searchParams.get('source_id')}"` } })
  if (searchParams.has('facet')) searchParams.getAll('facet').forEach(facet => { if (facet) { filter.push({ query_string: { query: facet } }) } })
  const searchRes = await elasticsearch.search<M2MTargetType | EntityType>({
    index: searchParams.has('source_id') ? 'm2m_target_expanded' : 'entity',
    query: {
      bool: {
        filter,
      },
    },
    sort: searchParams.has('source_id') ? [
      {'target_pagerank': {'order': 'desc'}},
      {'target_id': {'order': 'asc'} },
    ] : [
      {'pagerank': {'order': 'desc'}},
      {'id': {'order': 'asc'} },
    ],
    size: limit,
    search_after: searchParams.has('cursor') ? JSON.parse(searchParams.get('cursor') as string) : undefined,
    rest_total_hits_as_int: true,
  })
  searchParams.set('cursor', JSON.stringify(searchRes.hits.hits[searchRes.hits.hits.length-1].sort))
  const items = searchParams.has('source_id') ?
    searchRes.hits.hits.map(hit => Object.fromEntries(Object.entries(hit._source as M2MTargetType).flatMap(([k,v]) => k.startsWith('target_') ? [[k.substring('target_'.length), v]] : [])))
    : searchRes.hits.hits.map(hit => hit._source)
  return Response.json({
    items,
    total: searchRes.hits.total,
    next: searchRes.hits.hits.length === limit ? searchParams.toString() : null,
  })
}
