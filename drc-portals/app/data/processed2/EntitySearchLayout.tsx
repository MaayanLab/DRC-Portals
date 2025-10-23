import React from "react";
import SearchTabs from "@/app/data/processed2/SearchTabs";
import { redirect } from "next/navigation";
import { FancyTab } from "@/components/misc/FancyTabs";
import { Metadata, ResolvingMetadata } from "next";
import { categoryLabel, EntityType, TermAggType } from "./utils";
import elasticsearch from "@/lib/elasticsearch";

export async function generateMetadata(props: { params: Promise<{ search: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | Search ${decodeURIComponent(params.search)}`,
    keywords: parentMetadata.keywords,
  }
}

export default async function Page(props: React.PropsWithChildren<{ params: Promise<{ search?: string, type?: string } & Record<string, string>> }>) {
  const params = await props.params
  for (const k in params) params[k] = decodeURIComponent(params[k])
  let q = params.search ?? ''
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
    size: 0,
    rest_total_hits_as_int: true,
  })
  return (
    <SearchTabs>
      <FancyTab
        id={""}
        label={<>All ({Number(searchRes.hits.total).toLocaleString()})</>}
        priority={Number(searchRes.hits.total)}
      />
      {searchRes.aggregations?.types.buckets.map((filter) =>
        <FancyTab
          key={`${filter.key}`}
          id={filter.key}
          label={<>{categoryLabel(filter.key)} ({Number(filter.doc_count).toLocaleString()})</>}
          priority={Number(filter.doc_count)}
        />
      )}
      {props.children}
    </SearchTabs>
  )
}
