import React from 'react'
import elasticsearch from "@/lib/elasticsearch"
import { categoryLabel, create_url, EntityType, itemDescription, itemIcon, itemLabel, TermAggType } from "@/app/data/processed2/utils"
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed2/SearchablePagedTable";
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ensure_array } from '@/utils/array';

export default async function Page(props: { params: { type?: string, search?: string, search_type?: string } & Record<string, string>, searchParams?: { [key: string]: string[] | string | undefined } }) {
  for (const k in props.params) props.params[k] = decodeURIComponent(props.params[k])
  for (const k in props.searchParams) props.searchParams[k] = Array.isArray(props.searchParams[k]) ? props.searchParams[k].map(decodeURIComponent) : decodeURIComponent(props.searchParams[k] ?? '')
  let q = props.params.search ?? ''
  if (props.searchParams?.facet) q = `${q ? `${q} ` : ''}(${ensure_array(props.searchParams.facet).map(f => `+${f}`).join(' OR ')})`
  if (props.params.type) q = `${q ? `(${q}) ` : ''}+type:"${props.params.type}"`
  if (props.params.search_type) q = `${q ? `(${q}) ` : ''}+type:"${props.params.search_type}"`
  const display_per_page = Math.min(Number(props.searchParams?.display_per_page ?? 10), 50)
  if (!q) redirect('/data')
  const searchRes = await elasticsearch.search<EntityType>({
    index: 'entity',
    query: {
      query_string: {
        query: q,
        default_operator: 'AND',
      },
    },
    sort: props.searchParams?.reverse === undefined ? [
      {'pagerank': {'order': 'desc'}},
      {'_id': {'order': 'asc'} },
    ] :  [
      {'pagerank': {'order': 'asc'}},
      {'_id': {'order': 'desc'} },
    ],
    search_after: props.searchParams?.cursor ? JSON.parse(props.searchParams.cursor as string) : undefined,
    size: display_per_page,
    rest_total_hits_as_int: true,
  })
  if (props.searchParams?.reverse !== undefined) {
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
  // add dcc icons to dcc nodes (TODO: cache this)
  const dccEntityLookup = Object.fromEntries(
    Object.entries<EntityType>(entityLookup)
      .filter(([_, e]) => e.type === 'dcc')
      .map(([id, e]) => [e.a_label, id])
  )
  const dccs = await prisma.dCC.findMany({
    where: {
      short_label: {
        in: Object.keys(dccEntityLookup),
      }
    },
    select: {
      short_label: true,
      icon: true,
    },
  })
  dccs.forEach(dcc => {
    entityLookup[dccEntityLookup[dcc.short_label as string]].a_icon = dcc.icon as string
  })
  return (
    <SearchablePagedTable
      label={props.params.type ? categoryLabel(props.params.type) : undefined}
      search_name={props.params.type ? "type_search" : "search"}
      search={props.params.search ?? ''}
      cursor={props.searchParams?.cursor as string}
      reverse={props.searchParams?.reverse !== undefined}
      display_per_page={display_per_page}
      page={Number(props.searchParams?.page || 1)}
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
          <LinkedTypedNode type={hit._source.type} id={hit._source.slug} label={itemLabel(hit._source)} search={props.searchParams?.q as string ?? ''} />,
          <Description description={itemDescription(hit._source, entityLookup)} search={props.searchParams?.q as string ?? ''} />,
        ]
      }) ?? []}
    />
  )
}
