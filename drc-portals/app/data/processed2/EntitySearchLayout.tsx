import React from "react";
import SearchTabs from "@/app/data/processed2/SearchTabs";
import { redirect } from "next/navigation";
import { FancyTab } from "@/components/misc/FancyTabs";
import { Metadata, ResolvingMetadata } from "next";
import { categoryLabel, EntityType, itemLabel, TermAggType } from "./utils";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import SearchFilter from '@/app/data/processed2/SearchFilter';
import elasticsearch from "@/lib/elasticsearch";
import { dccIcons } from "./icons";

export async function generateMetadata(props: { params: Promise<{ search: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | Search ${decodeURIComponent(params.search)}`,
    keywords: parentMetadata.keywords,
  }
}

export default async function Page(props: React.PropsWithChildren<{ params: Promise<{ search?: string, type?: string, slug?: string } & Record<string, string>> }>) {
  const params = await props.params
  for (const k in params) params[k] = decodeURIComponent(params[k])
  let q = params.search ?? ''
  if (params.type) q = `${q ? `(${q}) ` : ''}+type:"${params.type}"`
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
  if (!params.search) {
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
    </SearchTabs>
  )
}
