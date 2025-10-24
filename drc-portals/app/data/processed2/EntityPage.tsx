import React from 'react'
import elasticsearch from "@/lib/elasticsearch"
import { categoryLabel, EntityType, itemDescription, itemIcon, itemLabel, M2MTargetType, TermAggType } from "@/app/data/processed2/utils"
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed2/SearchablePagedTable";
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { create_url } from './utils';
import { ensure_array } from '@/utils/array';

export default async function Page(props: { params: { type: string, slug: string, search?: string } & Record<string, string>, searchParams?: { [key: string]: string[] | string | undefined } }) {
  for (const k in props.params) props.params[k] = decodeURIComponent(props.params[k])
  for (const k in props.searchParams) props.searchParams[k] = Array.isArray(props.searchParams[k]) ? props.searchParams[k].map(decodeURIComponent) : decodeURIComponent(props.searchParams[k] ?? '')
  const itemRes = await elasticsearch.search<EntityType>({
    index: 'entity',
      query: {
        bool: {
          must: [
            { term: { 'type': props.params.type } },
            { term: { 'slug': props.params.slug } },
          ]
        },
      },
  })
  const item = itemRes.hits.hits[0]
  if (!item?._source) notFound()
  const item_source = item._source
  let q = props.params?.search ?? ''
  if (props.searchParams?.facet) q = `${q ? `${q} ` : ''}(${ensure_array(props.searchParams.facet).map(f => `+${f}`).join(' OR ')})`
  q = `${q ? `${q} ` : ''}+source_id:${item._id}`
  const display_per_page = Math.min(Number(props.searchParams?.display_per_page ?? 10), 50)
  const searchRes = await elasticsearch.search<M2MTargetType, TermAggType<'predicates' | 'types' | 'dccs'>>({
    index: 'm2m_target_expanded',
    query: {
      query_string: {
        query: q,
        default_operator: 'AND',
      },
    },
    sort: props.searchParams?.reverse === undefined ? [
      {'target_pagerank': {'order': 'desc'}},
      {'target_id': {'order': 'asc'} },
    ] :  [
      {'target_pagerank': {'order': 'asc'}},
      {'target_id': {'order': 'desc'} },
    ],
    search_after: props.searchParams?.cursor ? JSON.parse(props.searchParams.cursor as string) : undefined,
    size: display_per_page,
    rest_total_hits_as_int: true,
  })
  const entityLookupRes = await elasticsearch.search<EntityType>({
    index: 'entity',
    query: {
      ids: {
        values: Array.from(new Set([
          ...searchRes.hits.hits.flatMap((hit) => {
            const hit_source = hit._source
            if (!hit_source) return []
            return Object.keys(hit_source).filter(k => k.startsWith('target_r_')).map(k => hit_source[k])
          }),
          ...Object.keys(item_source).filter(k => k.startsWith('r_')).map(k => item_source[k]),
        ]))
      }
    },
    size: 100,
  })
  const entityLookup: Record<string, EntityType> = Object.fromEntries([
    [item._id, item_source],
    ...searchRes.hits.hits.flatMap((hit) => {
      const hit_source = hit._source
      if (!hit_source) return []
      return [[hit_source.target_id, Object.fromEntries(Object.entries(hit_source).flatMap(([k,v]) => k.startsWith('target_') ? [[k.substring('target_'.length), v]] : []))]]
    }),
    ...entityLookupRes.hits.hits.filter((hit): hit is typeof hit & {_source: EntityType} => !!hit._source).map((hit) => [hit._id, hit._source]),
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
      label="Linked to"
      search_name="entity_search"
      search={props.params?.search ?? ''}
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
        const hit_source = hit._source
        if (!hit_source) return []
        const href = create_url({ type: hit_source.target_type, slug: hit_source.target_slug})
        return [
          <SearchablePagedTableCellIcon href={href} src={itemIcon(entityLookup[hit_source.target_id], entityLookup)} alt={categoryLabel(hit_source.target_type)} />,
          <LinkedTypedNode type={hit_source.target_type} id={hit_source.target_slug} label={itemLabel(entityLookup[hit_source.target_id])} search={props.searchParams?.q as string ?? ''} />,
          <Description description={itemDescription(entityLookup[hit_source.target_id], entityLookup)} search={props.searchParams?.q as string ?? ''} />,
        ]
      })}
    />
  )
}
