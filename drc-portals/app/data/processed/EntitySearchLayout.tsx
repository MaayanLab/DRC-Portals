import React from "react";
import SearchTabs from "@/app/data/processed/SearchTabs";
import { redirect } from "next/navigation";
import { FancyTab } from "@/components/misc/FancyTabs";
import { Metadata, ResolvingMetadata } from "next";
import { CardinalityAggType, categoryLabel, create_url, EntityType, M2MExpandedType, TermAggType } from "./utils";
import elasticsearch from "@/lib/elasticsearch";
import { estypes } from "@elastic/elasticsearch";

export async function generateMetadata(props: { params: Promise<{ search: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const parentMetadata = await parent
  return {
    title: [
      parentMetadata.title?.absolute,
      params.search && `Search ${decodeURIComponent(params.search)}`,
    ].filter(title => !!title).join(' | '),
    keywords: [
      parentMetadata.keywords,
      params.search,
    ].filter(item => !!item).join(', '),
  }
}

export default async function Page(props: React.PropsWithChildren<{ params: Promise<{ search: string } & Record<string, string>> }>) {
  const params = await props.params
  for (const k in params) params[k] = decodeURIComponent(params[k])
  if (!params.search) redirect('/data')
  const filter: estypes.QueryDslQueryContainer[] = []
  if (params.search) filter.push({ simple_query_string: { query: params.search, default_operator: 'AND' } })
  const searchRes = await elasticsearch.search<M2MExpandedType, CardinalityAggType<'total' | 'files'> & TermAggType<'types' | 'dccs'>>({
    index: 'm2m_v8_expanded_pagerankid',
    query: {
      bool: {
        filter,
      },
    },
    collapse: {
      field: 'source_pagerank_id',
    },
    aggs: {
      total: {
        cardinality: {
          field: 'source_pagerank_id',
        },
      },
      types: {
        terms: {
          field: 'source_type',
          size: 1000,
        },
      },
    },
    size: 0,
    rest_total_hits_as_int: true,
  })
  if (!searchRes.hits.total) redirect(create_url({ search: params.search , error: 'No results matching search' }))
  return (
    <SearchTabs>
      <FancyTab
        id={""}
        label={<>All<br />{Number(searchRes.hits.total).toLocaleString()}</>}
        priority={Number(searchRes.hits.total)}
      />
      {searchRes.aggregations?.types.buckets.map((filter) =>
        <FancyTab
          key={`${filter.key}`}
          id={filter.key}
          label={<>{categoryLabel(filter.key)}<br />{Number(filter.doc_count).toLocaleString()}</>}
          priority={Number(filter.doc_count)}
        />
      )}
      {props.children}
    </SearchTabs>
  )
}
