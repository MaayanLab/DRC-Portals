import React from "react";
import { redirect } from "next/navigation";
import { capitalize, EntityType, itemLabel, TermAggType } from "./utils";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import SearchFilter from '@/app/data/processed2/SearchFilter';
import elasticsearch from "@/lib/elasticsearch";
import { esDCCs } from '@/app/data/processed2/dccs';
import { FancyTab } from "@/components/misc/FancyTabs";
import { estypes } from "@elastic/elasticsearch";

export default async function Page(props: React.PropsWithChildren<{ params: Promise<{ search: string, type?: string } & Record<string, string>> }>) {
  const params = await props.params
  for (const k in params) params[k] = decodeURIComponent(params[k])
  if (!params.search) redirect('/data')
  const filter: estypes.QueryDslQueryContainer[] = []
  if (params.search) filter.push({ simple_query_string: { query: params.search, default_operator: 'AND' } })
  if (params.type) filter.push({ query_string: { query: `+type:"${params.type}"` } })
  const searchRes = await elasticsearch.search<EntityType, TermAggType<'dccs'>>({
    index: 'entity',
    query: {
      bool: {
        filter,
      },
    },
    aggs: {
      dccs: {
        terms: {
          field: 'r_dcc',
          size: 1000,
        },
      },
    },
    size: 0,
    rest_total_hits_as_int: true,
  })
  if (searchRes.hits.total === 0) {
    if (!params.type) redirect('/data')
    return (
      <>
        <FancyTab
          id={params.type}
          label={<>{capitalize(params.type)}<br />{Number(searchRes.hits.total).toLocaleString()}</>}
          priority={Number(searchRes.hits.total)}
        />
        {props.children}
      </>
    )
  }
  const entityLookupRes = await elasticsearch.search<EntityType>({
    index: 'entity',
    query: {
      ids: {
        values: Array.from(new Set([
        ]))
      }
    },
    size: 100,
  })
  const entityLookup = Object.fromEntries([
    ...Object.entries(await esDCCs),
    ...searchRes.hits.hits.map((hit) => [hit._id, hit._source]),
    ...entityLookupRes.hits.hits.map((hit) => [hit._id, hit._source]),
  ])
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
