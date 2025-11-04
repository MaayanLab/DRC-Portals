import React from 'react'
import elasticsearch from "@/lib/elasticsearch"
import { categoryLabel, EntityType, FilterAggType, itemDescription, itemIcon, itemLabel, M2MTargetType, TermAggType } from "@/app/data/processed2/utils"
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description, SearchablePagedTableHeader } from "@/app/data/processed2/SearchablePagedTable";
import { notFound } from 'next/navigation';
import { create_url } from '@/app/data/processed2/utils';
import { ensure_array } from '@/utils/array';
import { FetchDRSCartButton, DRSCartButton } from '@/app/data/processed2/cart/DRSCartButton';
import { getEntity } from '@/app/data/processed2/getEntity';
import { dccIcons } from '@/app/data/processed2/icons';
import { estypes } from '@elastic/elasticsearch';
import FormPagination from '@/app/data/processed2/FormPagination';

export default async function Page(props: { params: Promise<{ type: string, slug: string, search?: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string }> }) {
  const params = await props.params
  const searchParams = await props.searchParams
  for (const k in params) params[k] = decodeURIComponent(params[k])
  for (const k in searchParams) {
    const v = searchParams[k]
    searchParams[k] = Array.isArray(v) ? v.map(decodeURIComponent) : decodeURIComponent(v)
  }
  const item = await getEntity(params)
  if (!item) notFound()
  const filter: estypes.QueryDslQueryContainer[] = []
  filter.push({ query_string: { query: `+source_id:"${item.id}"` } })
  if (params?.search) filter.push({ simple_query_string: { query: params.search, default_operator: 'AND' } })
  if (searchParams?.facet && ensure_array(searchParams.facet).length > 0) filter.push({ query_string: { query: ensure_array(searchParams.facet).map(f => f).join(' OR ') } })
  const display_per_page = Math.min(Number(searchParams?.display_per_page ?? 10), 50)
  const searchRes = await elasticsearch.search<M2MTargetType, FilterAggType<'files'>>({
    index: 'm2m_target_expanded',
    query: {
      bool: {
        filter,
      },
    },
    aggs: {
      files: {
        filter: {
          exists: { field: 'target_a_access_url' }
        },
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
  if (searchRes.hits.total === 0 && !searchParams?.facet) return null
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
          ...Object.keys(item).filter(k => k.startsWith('r_')).map(k => item[k]),
        ]))
      }
    },
    size: 100,
  })
  const entityLookup: Record<string, EntityType> = Object.fromEntries([
    [item.id, item],
    ...searchRes.hits.hits.flatMap((hit) => {
      const hit_source = hit._source
      if (!hit_source) return []
      return [[hit_source.target_id, Object.fromEntries(Object.entries(hit_source).flatMap(([k,v]) => k.startsWith('target_') ? [[k.substring('target_'.length), v]] : []))]]
    }),
    ...entityLookupRes.hits.hits.filter((hit): hit is typeof hit & {_source: EntityType} => !!hit._source).map((hit) => [hit._id, hit._source]),
  ])
  const dccIconsResolved = await dccIcons
  Object.values<EntityType>(entityLookup).forEach((e) => {
    if (e.type === 'dcc')
      e.a_icon = dccIconsResolved[e.slug]
  })
  return (
    <SearchablePagedTable
      tableHeader={
        <SearchablePagedTableHeader
          label="Linked to"
          search_name="entity_search"
          search={params?.search ?? ''}
        />
      }
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
          <LinkedTypedNode href={href} type={hit_source.target_type} label={itemLabel(entityLookup[hit_source.target_id])} search={searchParams?.q as string ?? ''} />,
          <Description description={itemDescription(entityLookup[hit_source.target_id], entityLookup)} search={searchParams?.q as string ?? ''} />,
          hit_source.target_a_access_url && <DRSCartButton access_url={hit_source.target_a_access_url} />,
        ]
      })}
      tableFooter={!!searchRes.aggregations?.files.doc_count &&
        <div className="flex flex-row justify-end">
          <FetchDRSCartButton
            source_id={item.id}
            search={params.search}
            facet={[
              ensure_array(searchParams?.facet).map(f => f).join(' OR '),
              '_exists_:target_a_access_url',
            ]}
            count={searchRes.aggregations.files.doc_count}
          />
        </div>
      }
      tablePagination={
        <FormPagination
          cursor={searchParams?.cursor as string}
          reverse={searchParams?.reverse !== undefined}
          display_per_page={display_per_page}
          page={Number(searchParams?.page || 1)}
          total={Number(searchRes.hits.total)}
          cursors={[
            searchRes.hits.hits.length && searchRes.hits.hits[0].sort ? encodeURIComponent(JSON.stringify(searchRes.hits.hits[0].sort)) : undefined,
            searchRes.hits.hits.length && searchRes.hits.hits[searchRes.hits.hits.length-1] ? encodeURIComponent(JSON.stringify(searchRes.hits.hits[searchRes.hits.hits.length-1].sort)) : undefined,
          ]}
        />
      }
    />
  )
}
