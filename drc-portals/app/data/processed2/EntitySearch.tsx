import React from 'react'
import elasticsearch from "@/lib/elasticsearch"
import { categoryLabel, create_url, EntityType, itemDescription, itemIcon, itemLabel, TermAggType } from "@/app/data/processed2/utils"
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed2/SearchablePagedTable";
import { redirect } from 'next/navigation';
import { ensure_array } from '@/utils/array';
import { dccIcons } from './icons';

export default async function Page(props: { params: Promise<{ type?: string, search?: string, search_type?: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string | undefined }> }) {
  const params = await props.params
  const searchParams = await props.searchParams
  for (const k in params) params[k] = decodeURIComponent(params[k])
  for (const k in searchParams) searchParams[k] = Array.isArray(searchParams[k]) ? searchParams[k].map(decodeURIComponent) : decodeURIComponent(searchParams[k] ?? '')
  let q = params.search ?? ''
  if (searchParams?.facet) q = `${q ? `${q} ` : ''}(${ensure_array(searchParams.facet).map(f => `+${f}`).join(' OR ')})`
  if (params.type) q = `${q ? `(${q}) ` : ''}+type:"${params.type}"`
  if (params.search_type) q = `${q ? `(${q}) ` : ''}+type:"${params.search_type}"`
  if (!q) redirect('/data')
  const display_per_page = Math.min(Number(searchParams?.display_per_page ?? 10), 50)
  const searchRes = await elasticsearch.search<EntityType>({
    index: 'entity',
    query: {
      query_string: {
        query: q,
        default_operator: 'AND',
      },
    },
    sort: searchParams?.reverse === undefined ? [
      {'pagerank': {'order': 'desc'}},
      {'_id': {'order': 'asc'} },
    ] :  [
      {'pagerank': {'order': 'asc'}},
      {'_id': {'order': 'desc'} },
    ],
    search_after: searchParams?.cursor ? JSON.parse(searchParams.cursor as string) : undefined,
    size: display_per_page,
    rest_total_hits_as_int: true,
  })
  if (searchParams?.reverse !== undefined) {
    searchRes.hits.hits.reverse()
  }
  const entityLookupRes = await elasticsearch.search<EntityType>({
    index: 'entity',
    query: {
      ids: {
        values: Array.from(new Set([
          // all dccs in the dcc filters
          ...searchRes.hits.hits.flatMap((item) => {
            const item_source = item._source
            if (!item_source) return []
            return Object.keys(item_source).filter(k => k.startsWith('r_')).map(k => item_source[k])
          })
        ]))
      }
    },
    size: 100,
  })
  const entityLookup = Object.fromEntries([
    ...searchRes.hits.hits.map((hit) => [hit._id, hit._source]),
    ...entityLookupRes.hits.hits.map((hit) => [hit._id, hit._source]),
  ])
  const dccIconsResolved = await dccIcons
  Object.values<EntityType>(entityLookup).forEach((e) => {
    if (e.type === 'dcc')
      e.a_icon = dccIconsResolved[e.slug]
  })
  return (
    <SearchablePagedTable
      label={params.type ? categoryLabel(params.type) : undefined}
      search_name={params.type ? "type_search" : "search"}
      search={params.search ?? ''}
      cursor={searchParams?.cursor as string}
      reverse={searchParams?.reverse !== undefined}
      display_per_page={display_per_page}
      page={Number(searchParams?.page || 1)}
      total={Number(searchRes.hits.total)}
      cursors={[
        searchRes.hits.hits.length && searchRes.hits.hits[0].sort ? encodeURIComponent(JSON.stringify(searchRes.hits.hits[0].sort)) : undefined,
        searchRes.hits.hits.length && searchRes.hits.hits[searchRes.hits.hits.length-1] ? encodeURIComponent(JSON.stringify(searchRes.hits.hits[searchRes.hits.hits.length-1].sort)) : undefined,
      ]}
      columns={[
        <>&nbsp;</>,
        <>Label</>,
        <>Description</>,
      ]}
      rows={searchRes.hits.hits.map((hit) => {
        if (!hit._source) return []
        const href = create_url({ type: hit._source.type, slug: hit._source.slug })
        return [
          <SearchablePagedTableCellIcon href={href} src={itemIcon(hit._source, entityLookup)} alt={categoryLabel(hit._source.type)} />,
          <LinkedTypedNode type={hit._source.type} id={hit._source.slug} label={itemLabel(hit._source)} search={searchParams?.q as string ?? ''} />,
          <Description description={itemDescription(hit._source, entityLookup)} search={searchParams?.q as string ?? ''} />,
        ]
      }) ?? []}
    />
  )
}
