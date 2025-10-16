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
  if (props.searchParams?.f) q = `${q ? `${q} ` : ''}${decodeURIComponent(props.searchParams.f)}`
  if (props.params.type) q = `${q ? `(${q}) ` : ''}+type:${decodeURIComponent(props.params.type)}`
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
          field: 'type.keyword',
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
    sort: [
      {'pagerank': {'order': 'desc'}},
      {'_id': {'order': 'asc'} },
    ],
    size: 10,
    rest_total_hits_as_int: true,
  })
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
              <SearchFilter key={filter.key} f={`+type:${filter.key}`}>{categoryLabel(filter.key)} ({Number(filter.doc_count).toLocaleString()})</SearchFilter>
            )}
            <br />
          </>}
          {searchRes.aggregations?.dccs && <>
            <div className="font-bold">DCC</div>
            {searchRes.aggregations.dccs.buckets.map((filter) =>
              <SearchFilter key={filter.key} f={`+r_dcc:${filter.key}`}>{filter.key in entityLookup ? itemLabel(entityLookup[filter.key]) : filter.key} ({Number(filter.doc_count).toLocaleString()})</SearchFilter>
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
        f={props.searchParams?.f ?? ''}
        p={1}
        r={10}
        count={Number(searchRes.hits.total)}
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
