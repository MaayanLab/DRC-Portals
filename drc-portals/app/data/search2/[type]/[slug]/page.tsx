import React from 'react'
import elasticsearch from "@/lib/elasticsearch"
import { capitalize, categoryLabel, EntityType, itemDescription, itemLabel, linkify, M2MTargetType, predicateLabel, TermAggType } from "@/app/data/search2/utils"
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
  const itemRes = await elasticsearch.search<EntityType>({
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
  if (!item._source) notFound()
  const item_source = item._source
  let q = decodeURIComponent(props.searchParams?.q ?? '')
  if (props.searchParams?.f) q = `${q ? `${q} ` : ''}${decodeURIComponent(props.searchParams.f)}`
  q = `${q ? `${q} ` : ''}+source_id:${item._id}`
  const searchRes = await elasticsearch.search<M2MTargetType, TermAggType<'predicates' | 'types' | 'dccs'>>({
    index: 'm2m_target_expanded',
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
  const entityLookupRes = await elasticsearch.search<EntityType>({
    index: 'entity',
    query: {
      ids: {
        values: Array.from(new Set([
          // all dccs in the dcc filters
          ...searchRes.aggregations ? searchRes.aggregations.dccs.buckets.map((filter) => filter.key) : [],
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
  return (
    <LandingPageLayout
      title={itemLabel(item_source)}
      subtitle={categoryLabel(item_source.type)}
      metadata={[
        ...Object.keys(item_source).toReversed().flatMap(predicate => {
          if (item_source[predicate] === 'null') return []
          const m = /^(a|r)_(.+)$/.exec(predicate)
          if (m === null) return []
          if (m[1] == 'a') {
            return [{
              label: capitalize(m[2].replaceAll('_', ' ')),
              value: linkify(item_source[predicate])
            }]
          } else if (m[1] === 'r') {
            return [{
              label: capitalize(m[2].replaceAll('_', ' ')),
              value: <div className="m-2">{item_source[predicate] in entityLookup ? <LinkedTypedNode type={entityLookup[item_source[predicate]].type} id={entityLookup[item_source[predicate]].slug} label={itemLabel(entityLookup[item_source[predicate]])} search={props.searchParams?.q ?? ''} /> : <>{item_source[predicate]}</>}</div>,
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
              {searchRes.aggregations.predicates.buckets.map((filter) =>
                <SearchFilter key={filter.key} f={`+predicate:${filter.key}`}>{predicateLabel(filter.key)} ({filter.doc_count.toLocaleString()})</SearchFilter>
              )}
              <br />
            </>}
            {searchRes.aggregations?.types && <>
              <div className="font-bold">Type</div>
              {searchRes.aggregations.types.buckets.map((filter) =>
                <SearchFilter key={filter.key} f={`+target_type:${filter.key}`}>{categoryLabel(filter.key)} ({filter.doc_count.toLocaleString()})</SearchFilter>
              )}
              <br />
            </>}
            {searchRes.aggregations?.dccs && <>
              <div className="font-bold">DCC</div>
              {searchRes.aggregations.dccs.buckets.map((filter) =>
                <SearchFilter key={filter.key} f={`+target_r_dcc:${filter.key}`}>{filter.key in entityLookup ? itemLabel(entityLookup[filter.key]) : filter.key} ({filter.doc_count.toLocaleString()})</SearchFilter>
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
          rows={searchRes.hits.hits.map((hit) => {
            const hit_source = hit._source
            if (!hit_source) return []
            const href = `/data/search2/${hit_source.target_type}/${hit_source.target_slug}`
            return [
              <SearchablePagedTableCellIcon href={href} src={KGNode} alt={categoryLabel(hit_source.target_type)} />,
              <LinkedTypedNode type={hit_source.target_type} id={hit_source.target_slug} label={itemLabel(entityLookup[hit_source.target_id])} search={props.searchParams?.q ?? ''} />,
              <Description description={itemDescription(entityLookup[hit_source.target_id], entityLookup)} search={props.searchParams?.q ?? ''} />,
            ]
          })}
        />
      </ListingPageLayout>
    </LandingPageLayout>
  )
}
