import React from 'react'
import elasticsearch from "@/lib/elasticsearch"
import { estypes } from '@elastic/elasticsearch'
import { categoryLabel, create_url, EntityExpandedType, EntityType, FilterAggType, itemDescription, itemIcon, itemLabel, predicateLabel } from "@/app/data/processed/utils"
import SearchablePagedTable, { SearchablePagedTableCell, SearchablePagedTableCellIcon, LinkedTypedNode, Description, SearchablePagedTableHeader } from "@/app/data/processed/SearchablePagedTable";
import { redirect } from 'next/navigation';
import { ensure_array, groupby } from '@/utils/array';
import { esDCCs } from '@/app/data/processed/dccs';
import { DRSCartButton, FetchDRSCartButton } from '@/app/data/processed/cart/DRSCartButton';
import FormPagination from '@/app/data/processed/FormPagination';
import { FancyTab } from '@/components/misc/FancyTabs';

type PageProps = { params: Promise<{ type?: string, search?: string, search_type?: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string }> }

export default async function Page(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  for (const k in params) params[k] = decodeURIComponent(params[k])
  for (const k in searchParams) {
    const v = searchParams[k]
    searchParams[k] = Array.isArray(v) ? v.map(decodeURIComponent) : decodeURIComponent(v)
  }
  const must: estypes.QueryDslQueryContainer[] = []
  const filter: estypes.QueryDslQueryContainer[] = []
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
  if (params.type) filter.push({ query_string: { query: `+type:"${params.type}"` } })
  if (params.search_type) filter.push({ query_string: { query: `+type:"${params.search_type}"` } })
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
  if (searchParams?.reverse !== undefined) {
    searchRes.hits.hits.reverse()
  }
  const entityLookup: Record<string, EntityType> = Object.fromEntries([
    ...searchRes.hits.hits.flatMap((hit) => [
      [hit._id, hit._source],
      ...Object.entries(hit._source as EntityExpandedType).flatMap(([key, value]) => {
        if (key.startsWith('m2o_')) {
          return [[(value as EntityType).id, value as EntityType]]
        } else {
          return []
        }
      }),
    ]),
    ...Object.entries(await esDCCs),
  ])
  return (
    <>
      {params.type && searchRes.hits.total === 0 && <FancyTab id={params.type} label={<>{categoryLabel(params.type)}<br />0</>} priority={0} />}
      <SearchablePagedTable
        tableHeader={
          params.type && <SearchablePagedTableHeader
            label={categoryLabel(params.type)}
            search_name="type_search"
            search={params?.search ?? ''}
            autocomplete={{
              type: params.type,
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
          if (!hit._source) return []
          const href = create_url({ type: hit._source.type, slug: hit._source.slug })
          return [
            <SearchablePagedTableCellIcon href={href} src={itemIcon(hit._source, entityLookup)} alt={categoryLabel(hit._source.type)} />,
            <SearchablePagedTableCell><LinkedTypedNode href={href} type={hit._source.type} label={itemLabel(hit._source)} search={searchParams?.q as string ?? ''} /></SearchablePagedTableCell>,
            <SearchablePagedTableCell sx={{maxWidth: 'unset'}}><Description description={itemDescription(hit._source, entityLookup)} search={searchParams?.q as string ?? ''} /></SearchablePagedTableCell>,
            hit._source.a_access_url && <SearchablePagedTableCell><DRSCartButton access_url={hit._source.a_access_url} responsive /></SearchablePagedTableCell>,
          ]
        }) ?? []}
        tableFooter={!!searchRes.aggregations?.files.doc_count &&
          <div className="flex flex-row justify-end">
            <FetchDRSCartButton
              search={params.search}
              facet={[
                ...ensure_array(params.type).map(type => type ? `type:"${type}"` : undefined),
                ...ensure_array(params.search_type).map(type => type ? `type:"${type}"` : undefined),
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
    </>
  )
}
