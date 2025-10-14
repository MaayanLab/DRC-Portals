import React from 'react'
import elasticsearch from "@/lib/elasticsearch"
import { capitalize, categoryLabel, itemDescription, itemLabel, linkify, predicateLabel } from "@/app/data/search2/utils"
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/search2/SearchablePagedTable";
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import KGNode from '@/public/img/icons/KGNode.png'
import { notFound } from 'next/navigation';
import LandingPageLayout from '@/app/data/processed/LandingPageLayout';
import SearchFilter from '@/app/data/search2/SearchFilter';

export default async function Page(props: { params: { type: string, slug: string }, searchParams?: { [key: string]: string | undefined } }) {
  const itemRes = await elasticsearch.search({
    index: 'entity',
      query: {
        bool: {
          must: [
            { term: { 'type.keyword': decodeURIComponent(props.params.type) } },
            { term: { 'slug.keyword': decodeURIComponent(props.params.slug) } },
          ]
        },
      },
  })
  const item = itemRes.hits.hits[0]
  if (!item) notFound()
  let q = decodeURIComponent(props.searchParams?.q ?? '')
  if (props.searchParams?.f) q = `${q ? `${q} ` : ''}${decodeURIComponent(props.searchParams.f)}`
  q = `${q ? `${q} ` : ''}+source_id:${item._id}`
  const searchRes = await elasticsearch.search({
    index: 'm2m_expanded',
    query: {
      query_string: {
        query: q,
        default_operator: 'AND',
      },
    },
    aggs: {
      predicates: {
        terms: {
          field: 'predicate.keyword',
          size: 10,
        },
      },
      types: {
        terms: {
          field: 'target_type.keyword',
          size: 1000,
        },
      },
      dccs: {
        terms: {
          field: 'target_r_dcc.keyword',
          size: 1000,
        },
      },
    },
    sort: [
      {'target_pagerank': {'order': 'desc'}},
      {'_id': {'order': 'asc'} },
    ],
    size: 10,
    rest_total_hits_as_int: true,
  })
  const entityLookupRes = await elasticsearch.search({
    index: 'entity',
    query: {
      ids: {
        values: Array.from(new Set([
          // all dccs in the dcc filters
          ...searchRes.aggregations?.dccs.buckets.map((filter: any) => filter.key),
          ...searchRes.hits.hits.flatMap((hit: any) => Object.keys(hit._source).filter(k => k.startsWith('target_r_')).map(k => hit._source[k])),
          ...Object.keys(item._source).filter(k => k.startsWith('r_')).map(k => item._source[k]),
        ]))
      }
    },
    size: 100,
  })
  const entityLookup = Object.fromEntries([
    [item._id, item._source],
    ...searchRes.hits.hits.map((hit: any) => [hit._source.target_id, Object.fromEntries(Object.entries(hit._source).flatMap(([k,v]) => k.startsWith('target_') ? [[k.substring('target_'.length), v]] : []))]),
    ...entityLookupRes.hits.hits.map((hit: any) => [hit._id, hit._source]),
  ])

  return (
    <LandingPageLayout
      title={itemLabel(item._source)}
      subtitle={categoryLabel(item._source.type)}
      metadata={[
        ...Object.keys(item._source).toReversed().flatMap(predicate => {
          if (item._source[predicate] === 'null') return []
          const m = /^(a|r)_(.+)$/.exec(predicate)
          if (m === null) return []
          if (m[1] == 'a') {
            return [{
              label: capitalize(m[2].replaceAll('_', ' ')),
              value: linkify(item._source[predicate])
            }]
          } else if (m[1] === 'r') {
            return [{
              label: capitalize(m[2].replaceAll('_', ' ')),
              value: <div className="m-2">{item._source[predicate] in entityLookup ? <LinkedTypedNode type={entityLookup[item._source[predicate]].type} id={entityLookup[item._source[predicate]].slug} label={itemLabel(entityLookup[item._source[predicate]])} search={props.searchParams?.q ?? ''} /> : <>{item._source[predicate]}</>}</div>,
            }]
          }
          return []
        })
      ]}
    >
      <ListingPageLayout
        count={Number(searchRes.hits.total)}
        filters={
          <>
            {searchRes.aggregations?.predicates && <>
              <div className="font-bold">Predicate</div>
              {searchRes.aggregations.predicates.buckets.map((filter: any) =>
                <SearchFilter key={filter.key} f={`+predicate:${filter.key}`}>{predicateLabel(filter.key)} ({Number(filter.doc_count).toLocaleString()})</SearchFilter>
              )}
              <br />
            </>}
            {searchRes.aggregations?.types && <>
              <div className="font-bold">Type</div>
              {searchRes.aggregations.types.buckets.map((filter: any) =>
                <SearchFilter key={filter.key} f={`+target_type:${filter.key}`}>{categoryLabel(filter.key)} ({Number(filter.doc_count).toLocaleString()})</SearchFilter>
              )}
              <br />
            </>}
            {searchRes.aggregations?.dccs && <>
              <div className="font-bold">DCC</div>
              {searchRes.aggregations.dccs.buckets.map((filter: any) =>
                <SearchFilter key={filter.key} f={`+target_r_dcc:${filter.key}`}>{filter.key in entityLookup ? itemLabel(entityLookup[filter.key]) : filter.key} ({Number(filter.doc_count).toLocaleString()})</SearchFilter>
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
          label="Linked to"
          f={props.searchParams?.f ?? ''}
          p={1}
          r={10}
          count={Number(searchRes.hits.total)}
          columns={[
            <>&nbsp;</>,
            <>Label</>,
            <>Description</>,
          ]}
          rows={searchRes.hits.hits.map((hit: any) => {
            const href = `/data/search2/${hit._source.target_type}/${hit._source.target_slug}`
            return [
              <SearchablePagedTableCellIcon href={href} src={KGNode} alt={categoryLabel(hit._source.target_type)} />,
              <LinkedTypedNode type={hit._source.target_type} id={hit._source.target_slug} label={itemLabel(entityLookup[hit._source.target_id])} search={props.searchParams?.q ?? ''} />,
              <Description description={itemDescription(entityLookup[hit._source.target_id], entityLookup)} search={props.searchParams?.q ?? ''} />,
            ]
          })}
        />
      </ListingPageLayout>
    </LandingPageLayout>
  )
}
