import React from 'react'
import elasticsearch from "@/lib/elasticsearch"
import { categoryLabel, EntityExpandedType, EntityType, FilterAggType, itemDescription, itemIcon, itemLabel } from "@/app/data/processed/utils"
import SearchablePagedTable, { SearchablePagedTableCell, SearchablePagedTableCellIcon, LinkedTypedNode, Description, SearchablePagedTableHeader } from "@/app/data/processed/SearchablePagedTable";
import { notFound, redirect } from 'next/navigation';
import { create_url } from '@/app/data/processed/utils';
import { ensure_array, groupby } from '@/utils/array';
import { FetchDRSCartButton, DRSCartButton } from '@/app/data/processed/cart/DRSCartButton';
import { getEntity } from '@/app/data/processed/getEntity';
import { esDCCs } from '@/app/data/processed/dccs';
import { estypes } from '@elastic/elasticsearch';
import FormPagination from '@/app/data/processed/FormPagination';
import { Metadata, ResolvingMetadata } from 'next';

type PageProps = { params: Promise<{ type: string, slug: string, search?: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string }> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  for (const k in params) params[k] = decodeURIComponent(params[k])
  const parentMetadata = await parent
  return {
    title: [
      // NOTE: EntityPageLayout.generateMetadata will already be applied
      parentMetadata.title?.absolute,
      params.search && `Search ${params.search}`
    ].filter(item => !!item).join(' | '),
    keywords: [
      params.search,
      parentMetadata.keywords
    ].filter(item => !!item).join(', '),
  }
}

export default async function Page(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  for (const k in params) params[k] = decodeURIComponent(params[k])
  for (const k in searchParams) {
    const v = searchParams[k]
    searchParams[k] = Array.isArray(v) ? v.map(decodeURIComponent) : decodeURIComponent(v)
  }
  const item = await getEntity(params)
  if (!item) notFound()
  const must: estypes.QueryDslQueryContainer[] = []
  const filter: estypes.QueryDslQueryContainer[] = []
  filter.push({ simple_query_string: { query: `"${item.id}"`, fields: ['m2o_*.id', 'm2m_*'] } })
  if (params.search) must.push({ simple_query_string: { query: params.search, fields: ['a_label^10', 'a_*^5', 'm2o_*.a_*'], default_operator: 'AND' } })
  if (searchParams?.facet && ensure_array(searchParams.facet).length > 0) {
    filter.push({
      query_string: {
        query: Object.entries(groupby(
          ensure_array(searchParams.facet).filter(f => !!f), f => f.substring(0, f.indexOf(':'))
        )).map(([_, F]) => `(${F.join(' OR ')})`).join(' AND '),
      }
    })
  }
  if (must.length+filter.length === 0) redirect('/data')
  const display_per_page = Math.min(Number(searchParams?.display_per_page ?? 10), 50)
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
        boost_mode: "sum",
      },
    },
    aggs: {
      files: {
        filter: {
          exists: { field: 'a_access_url' }
        },
      },
    },
    sort: searchParams?.reverse === undefined ? [
      {'_score': {'order': 'desc'}},
      {'id': {'order': 'asc'} },
    ] :  [
      {'_score': {'order': 'asc'}},
      {'id': {'order': 'desc'} },
    ],
    search_after: searchParams?.cursor ? JSON.parse(searchParams.cursor as string) : undefined,
    size: display_per_page,
    rest_total_hits_as_int: true,
  })
  if (searchRes.hits.total === 0 && !params.search && !searchParams?.facet) return null
  const entityLookup: Record<string, EntityType> = Object.fromEntries([
    [item.id, item],
    ...searchRes.hits.hits.flatMap((hit) => hit._source ? [
      [hit._source?.id, hit._source],
      ...Object.entries(hit._source).flatMap(([key, value]) => {
        if (key.startsWith('m2o_')) {
          return [[(value as EntityType).id, value as EntityType]]
        } else {
          return []
        }
      }),
    ] : []),
    ...Object.entries(await esDCCs),
  ])
  return (
    <SearchablePagedTable
      tableHeader={
        <SearchablePagedTableHeader
          label="Linked to"
          search_name="entity_search"
          search={params?.search ?? ''}
          autocomplete={{
            source_id: item.id,
            facet: ensure_array(searchParams?.facet),
          }}
        />
      }
      columns={[
        <>&nbsp;</>,
        <>Label</>,
        <>Description</>,
        <>&nbsp;</>,
      ]}
      rows={searchRes.hits.hits.map((hit) => {
        const hit_source_target = hit._source
        if (!hit_source_target?.type) return []
        const href = create_url({ type: hit_source_target.type, slug: hit_source_target.slug})
        return [
          <SearchablePagedTableCellIcon href={href} src={itemIcon(entityLookup[hit_source_target.id], entityLookup)} alt={categoryLabel(hit_source_target.type)} />,
          <SearchablePagedTableCell><LinkedTypedNode href={href} type={hit_source_target.type} label={itemLabel(entityLookup[hit_source_target.id])} search={searchParams?.q as string ?? ''} /></SearchablePagedTableCell>,
          <SearchablePagedTableCell sx={{maxWidth: 'unset'}}><Description description={itemDescription(entityLookup[hit_source_target.id], entityLookup)} search={searchParams?.q as string ?? ''} /></SearchablePagedTableCell>,
          hit_source_target.a_access_url && <SearchablePagedTableCell><DRSCartButton access_url={hit_source_target.a_access_url} responsive /></SearchablePagedTableCell>,
        ]
      })}
      tableFooter={!!searchRes.aggregations?.files.doc_count &&
        <div className="flex flex-row justify-end">
          <FetchDRSCartButton
            source_id={item.id}
            search={params.search}
            facet={[
              ...ensure_array(searchParams?.facet),
              '_exists_:a_access_url',
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
