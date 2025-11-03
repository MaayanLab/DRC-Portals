import React from "react";
import { redirect } from "next/navigation";
import { categoryLabel, EntityType, itemLabel, TermAggType } from "./utils";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import SearchFilter from '@/app/data/processed2/SearchFilter';
import elasticsearch from "@/lib/elasticsearch";
import { dccIcons } from "./icons";
import { Metadata, ResolvingMetadata } from "next";
import { estypes } from "@elastic/elasticsearch";

export async function generateMetadata(props: { params: Promise<{ type: string, search?: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | ${categoryLabel(params.type)}${params.search ? ` | Search ${decodeURIComponent(params.search)}` : ''}`,
    keywords: parentMetadata.keywords,
  }
}

export default async function Page(props: React.PropsWithChildren<{ params: Promise<{ type: string, search?: string } & Record<string, string>> }>) {
  const params = await props.params
  for (const k in params) params[k] = decodeURIComponent(params[k])
  if (!params.type) redirect('/data')
  const filter: estypes.QueryDslQueryContainer[] = []
  if (params.search) filter.push({ simple_query_string: { query: params.search, default_operator: 'AND' } })
  if (params.type) filter.push({ query_string: { query: `+type:"${params.type}"` } })
  const searchRes = await elasticsearch.search<EntityType, TermAggType<'types' | 'dccs'>>({
    index: 'entity',
    query: {
      bool: {
        filter,
      },
    },
    aggs: {
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
  const entityLookupRes = await elasticsearch.search<EntityType>({
    index: 'entity',
    query: {
      ids: {
        values: Array.from(new Set([
          // all dccs in the dcc filters
          ...searchRes.aggregations ? searchRes.aggregations.dccs.buckets.map(filter => filter.key) : [],
        ]))
      }
    },
    size: 100,
  })
  const entityLookup = Object.fromEntries([
    ...searchRes.hits.hits.map((hit) => [hit._id, hit._source]),
    ...entityLookupRes.hits.hits.map((hit) => [hit._id, hit._source]),
  ])
  const dccIconsResolved = await dccIcons
  Object.values<EntityType>(entityLookup).forEach((e) => {
    if (e.type === 'dcc')
      e.a_icon = dccIconsResolved[e.slug]
  })
  return (
    <ListingPageLayout
      count={Number(searchRes.hits.total)}
      filters={
        <>
          {searchRes.aggregations?.dccs && <>
            <div className="font-bold">DCC</div>
            {searchRes.aggregations.dccs.buckets.map((filter) =>
              <SearchFilter key={filter.key} id={`r_dcc:"${filter.key}"`} label={filter.key in entityLookup ? itemLabel(entityLookup[filter.key]) : filter.key} count={Number(filter.doc_count)} />
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
      {props.children}
    </ListingPageLayout>
  )
}
