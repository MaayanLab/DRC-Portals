import React from 'react'
import elasticsearch from "@/lib/elasticsearch"
import { categoryLabel, EntityType, itemDescription, itemLabel, TermAggType } from "./utils"
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "./SearchablePagedTable";
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import KGNode from '@/public/img/icons/KGNode.png'
import { redirect } from 'next/navigation';
import SearchFilter from './SearchFilter';

export default async function Page(props: { params: { type?: string }, searchParams?: { [key: string]: string | undefined } }) {
  let q = decodeURIComponent(props.searchParams?.q ?? '')
  if (props.searchParams?.facet) q = `${q ? `${q} ` : ''}${decodeURIComponent(props.searchParams.facet)}`
  if (props.searchParams?.filter) q = `${q ? `${q} ` : ''}${decodeURIComponent(props.searchParams.filter)}`
  if (props.params.type) q = `${q ? `(${q}) ` : ''}+type:${decodeURIComponent(props.params.type)}`
  const display_per_page = Math.min(Number(props.searchParams?.display_per_page ?? 10), 50)
  if (!q) redirect('/data')
  const searchRes = await elasticsearch.search<EntityType, TermAggType<'types' | 'dccs'>>({
    index: 'entity',
    query: {
      query_string: {
        query: q,
        default_operator: 'AND',
      },
    },
    aggs: {
      types: {
        terms: {
          field: 'type',
          size: 1000,
        },
      },
      dccs: {
        terms: {
          field: 'r_dcc.keyword',
          size: 1000,
        },
      },
    },
    sort: props.searchParams?.reverse === undefined ? [
      {'pagerank': {'order': 'desc'}},
      {'_id': {'order': 'asc'} },
    ] :  [
      {'pagerank': {'order': 'asc'}},
      {'_id': {'order': 'desc'} },
    ],
    search_after: props.searchParams?.cursor ? JSON.parse(decodeURIComponent(props.searchParams.cursor)) : undefined,
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
          ...searchRes.aggregations ? searchRes.aggregations.dccs.buckets.map(filter => filter.key) : [],
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
  return (
    <ListingPageLayout
      count={Number(searchRes.hits.total)}
      filters={
        <>
          {searchRes.aggregations?.types && <>
            <div className="font-bold">Type</div>
            {searchRes.aggregations.types.buckets.map((filter) =>
              <SearchFilter key={filter.key} facet={`+type:${filter.key}`}>{categoryLabel(filter.key)} ({Number(filter.doc_count).toLocaleString()})</SearchFilter>
            )}
            <br />
          </>}
          {searchRes.aggregations?.dccs && <>
            <div className="font-bold">DCC</div>
            {searchRes.aggregations.dccs.buckets.map((filter) =>
              <SearchFilter key={filter.key} facet={`+r_dcc:${filter.key}`}>{filter.key in entityLookup ? itemLabel(entityLookup[filter.key]) : filter.key} ({Number(filter.doc_count).toLocaleString()})</SearchFilter>
            )}
          </>}
        </>
      }
      footer={
        <Link href="/data">
          <Button
            sx={{textTransform: "uppercase"}}
            color="primary"
            variant="contained"
            startIcon={<Icon path={mdiArrowLeft} size={1} />}>
              BACK TO SEARCH
          </Button>
        </Link>
      }
    >
      <SearchablePagedTable
        label={props.params.type ? categoryLabel(props.params.type) : undefined}
        filter={props.searchParams?.filter ?? ''}
        cursor={props.searchParams?.cursor}
        reverse={props.searchParams?.reverse !== undefined}
        display_per_page={display_per_page}
        page={Number(props.searchParams?.page || 1)}
        total={Number(searchRes.hits.total)}
        cursors={[
          searchRes.hits.hits[0].sort ? encodeURIComponent(JSON.stringify(searchRes.hits.hits[0].sort)) : undefined,
          searchRes.hits.hits[searchRes.hits.hits.length-1] ? encodeURIComponent(JSON.stringify(searchRes.hits.hits[searchRes.hits.hits.length-1].sort)) : undefined,
        ]}
        columns={[
          <>&nbsp;</>,
          <>Label</>,
          <>Description</>,
        ]}
        rows={searchRes.hits.hits.map((hit) => {
          if (!hit._source) return []
          const href = `/data/search2/${hit._source.type}/${hit._source.slug}`
          return [
            <SearchablePagedTableCellIcon href={href} src={KGNode} alt={categoryLabel(hit._source.type)} />,
            <LinkedTypedNode type={hit._source.type} id={hit._source.slug} label={itemLabel(hit._source)} search={props.searchParams?.q ?? ''} />,
            <Description description={itemDescription(hit._source, entityLookup)} search={props.searchParams?.q ?? ''} />,
          ]
        }) ?? []}
      />
    </ListingPageLayout>
  )
}
