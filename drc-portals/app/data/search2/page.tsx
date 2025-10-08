import React from 'react'
import { Grid, Typography } from "@mui/material"
import elasticsearch from "@/lib/elasticsearch"
import { capitalize, categoryLabel, itemDescription, itemLabel, pluralize } from "./utils"
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "./SearchablePagedTable";
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import KGNode from '@/public/img/icons/KGNode.png'
import { notFound } from 'next/navigation';
import LandingPageLayout from '../processed/LandingPageLayout';

function linkify(value: any) {
  const m = /^(https?|drs):\/\/(.+)/.exec(value)
  if (m === null) return <>{value}</>
  if (m[1] === 'drs') return <a className="text-blue-600 cursor:pointer underline" href={`/data/drs?q=${encodeURIComponent(value)}`} target="_blank">{value}</a>
  else return <a className="text-blue-600 cursor:pointer underline" href={`https://www.ensembl.org/id/${value}`} target="_blank">{value}</a>
}

export default async function Page(props: { params: { type?: string, slug?: string }, searchParams?: { [key: string]: string | undefined } }) {
  let q = decodeURIComponent(props.searchParams?.q ?? '')
  if (props.searchParams?.f) q = `${q ? `${q} ` : ''}${decodeURIComponent(props.searchParams.f)}`
  if (props.params.type && !props.params.slug) q = `${q ? `(${q}) ` : ''}+type:${decodeURIComponent(props.params.type)}`
  if (!q && !props.params.slug) {
    const res = await elasticsearch.search({
      index: 'entity',
      size: 0,
      aggs: {
        keys: {
          terms: {
            field: "type.keyword", 
            size: 1000,
          },
        },
      },
    })
    if (!res.aggregations) return null
    return <div className="flex flex-row gap-4 flex-wrap place-items-center justify-center">{res.aggregations.keys.buckets.map((result: any) => (
      <Grid key={result.key} item xs={6} sm={4} md={3} lg={2}>
        <a href={`/data/search2/${result.key}`}>
          <div className="flex flex-col items-center">
            <Typography variant="h2" color="secondary">{BigInt(result.doc_count).toLocaleString()}</Typography>
            <Typography variant="subtitle1" color="secondary">{pluralize(categoryLabel(result.key))}</Typography>
          </div>
        </a>
      </Grid>
    ))}</div>
  }
  let item: any | undefined
  if (props.params.type && props.params.slug) {
    const res0 = await elasticsearch.search({
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
    item = res0.hits.hits[0]
    if (!item) notFound()
    q = `${q ? `(${q}) ` : ''}+${item._id}`
  }
  const res = await elasticsearch.search({
    index: 'entity',
    query: {
      query_string: {
        query: q,
        default_operator: 'AND',
      },
    },
    aggs: {
      types: props.params.type && !props.params.slug ? undefined as any : {
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
  const res2 = await elasticsearch.search({
    index: 'entity',
    body: {
      query: {
        ids: {
          values: Array.from(new Set([
            // all dccs in the dcc filters
            ...res.aggregations?.dccs.buckets.map((filter: any) => filter.key),
            ...[
              // and items in the result set
              ...res.hits.hits,
              // the primary item
              ...(item ? [item] : []),
            ].flatMap((item: any) => Object.keys(item._source).filter(k => k.startsWith('r_')).map(k => item._source[k])),
          ]))
        }
      },
    },
    size: 100,
  })
  const entity_lookup = Object.fromEntries([
    ...(item ? [[item._id, item._source]] : []),
    ...res.hits.hits.map((hit: any) => [hit._id, hit._source]),
    ...res2.hits.hits.map((hit: any) => [hit._id, hit._source]),
  ])
  return (
    <LandingPageLayout
      title={item ? itemLabel(item._source) : 'Search'}
      subtitle={item ? categoryLabel(item._source.type) : props.searchParams?.q}
      metadata={[
        ...Object.keys(item?._source ?? {}).toReversed().flatMap(predicate => {
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
              value: <div className="m-2">{item._source[predicate] in entity_lookup ? <LinkedTypedNode type={entity_lookup[item._source[predicate]].type} id={entity_lookup[item._source[predicate]].slug} label={itemLabel(entity_lookup[item._source[predicate]])} search={props.searchParams?.q ?? ''} /> : <>{item._source[predicate]}</>}</div>,
            }]
          }
          return []
        })
      ]}
    >
      <ListingPageLayout
        count={res.hits.total}
        filters={
          <>
            {res.aggregations?.types && <>
              <div className="font-bold">Type</div>
              {res.aggregations.types.buckets.map((filter: any) =>
                <a key={filter.key} href={`?q=${encodeURIComponent(props.searchParams?.q ?? '')}&f=${encodeURIComponent(`+type:${filter.key}`)}`}>{categoryLabel(filter.key)} ({Number(filter.doc_count).toLocaleString()})</a>
              )}
              <br />
            </>}
            {res.aggregations?.dccs && <>
              <div className="font-bold">DCC</div>
              {res.aggregations.dccs.buckets.map((filter: any) =>
                <a key={filter.key} href={`?q=${encodeURIComponent(props.searchParams?.q ?? '')}&f=${encodeURIComponent(`+r_dcc:${filter.key}`)}`}>{filter.key in entity_lookup ? itemLabel(entity_lookup[filter.key]) : filter.key} ({Number(filter.doc_count).toLocaleString()})</a>
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
          q={props.searchParams?.q ?? ''}
          count={res.hits.total}
          columns={[
            <>&nbsp;</>,
            <>Label</>,
            <>Description</>,
          ]}
          rows={res.hits.hits.map((item: any) => {
            const href = `/data/search2/${item._source['type']}/${item._source.slug}`
            return [
              <SearchablePagedTableCellIcon href={href} src={KGNode} alt={categoryLabel(item._source['type'])} />,
              <LinkedTypedNode type={item._source['type']} id={item._source.slug} label={itemLabel(item._source)} search={props.searchParams?.q ?? ''} />,
              <Description description={itemDescription(item._source, entity_lookup)} search={props.searchParams?.q ?? ''} />,
            ]
          }) ?? []}
        />
      </ListingPageLayout>
    </LandingPageLayout>
  )
}
