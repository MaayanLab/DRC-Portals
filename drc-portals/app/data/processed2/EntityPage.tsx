import React from 'react'
import elasticsearch from "@/lib/elasticsearch"
import { categoryLabel, EntityType, itemDescription, itemIcon, itemLabel, M2MTargetType, TermAggType } from "@/app/data/processed2/utils"
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed2/SearchablePagedTable";
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { create_url } from './utils';
import { ensure_array } from '@/utils/array';
import DRSCartButton from '@/app/data/processed2/cart/DRSCartButton';

export default async function Page(props: { params: Promise<{ type: string, slug: string, search?: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string | undefined }> }) {
  const params = await props.params
  const searchParams = await props.searchParams
  for (const k in params) params[k] = decodeURIComponent(params[k])
  for (const k in searchParams) searchParams[k] = Array.isArray(searchParams[k]) ? searchParams[k].map(decodeURIComponent) : decodeURIComponent(searchParams[k] ?? '')
  const itemRes = await elasticsearch.search<EntityType>({
    index: 'entity',
      query: {
        bool: {
          must: [
            { term: { 'type': params.type } },
            { term: { 'slug': params.slug } },
          ]
        },
      },
  })
  const item = itemRes.hits.hits[0]
  if (!item?._source) notFound()
  const item_source = item._source
  let q = params?.search ?? ''
  if (searchParams?.facet) q = `${q ? `${q} ` : ''}(${ensure_array(searchParams.facet).map(f => `+${f}`).join(' OR ')})`
  q = `${q ? `${q} ` : ''}+source_id:${item._id}`
  const display_per_page = Math.min(Number(searchParams?.display_per_page ?? 10), 50)
  const searchRes = await elasticsearch.search<M2MTargetType, TermAggType<'predicates' | 'types' | 'dccs'>>({
    index: 'm2m_target_expanded',
    query: {
      query_string: {
        query: q,
        default_operator: 'AND',
      },
    },
    sort: searchParams?.reverse === undefined ? [
      {'target_pagerank': {'order': 'desc'}},
      {'target_id': {'order': 'asc'} },
    ] :  [
      {'target_pagerank': {'order': 'asc'}},
      {'target_id': {'order': 'desc'} },
    ],
    search_after: searchParams?.cursor ? JSON.parse(searchParams.cursor as string) : undefined,
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
      search={params?.search ?? ''}
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
        <>&nbsp;</>,
      ]}
      rows={searchRes.hits.hits.map((hit) => {
        const hit_source = hit._source
        if (!hit_source) return []
        const href = create_url({ type: hit_source.target_type, slug: hit_source.target_slug})
        return [
          <SearchablePagedTableCellIcon href={href} src={itemIcon(entityLookup[hit_source.target_id], entityLookup)} alt={categoryLabel(hit_source.target_type)} />,
          <LinkedTypedNode type={hit_source.target_type} id={hit_source.target_slug} label={itemLabel(entityLookup[hit_source.target_id])} search={searchParams?.q as string ?? ''} />,
          <Description description={itemDescription(entityLookup[hit_source.target_id], entityLookup)} search={searchParams?.q as string ?? ''} />,
          hit_source.target_type === 'file' ? <DRSCartButton access_url={hit_source.target_a_access_url ?? hit_source.target_a_persistent_id} />
          : hit_source.target_type === 'dcc_asset' ? <DRSCartButton access_url={hit_source.target_a_link} />
          : null,
        ]
      })}
    />
  )
}
