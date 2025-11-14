import React from "react";
import SearchTabs from "@/app/data/processed/SearchTabs";
import { redirect } from "next/navigation";
import { FancyTab } from "@/components/misc/FancyTabs";
import { Metadata, ResolvingMetadata } from "next";
import { categoryLabel, create_url, EntityType, TermAggType } from "./utils";
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
  const searchRes = await elasticsearch.search<EntityType, TermAggType<'types' | 'dccs'>>({
    index: 'entity',
    query: {
      bool: {
        filter,
      },
    },
    aggs: {
      types: {
        terms: {
          field: 'type',
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
