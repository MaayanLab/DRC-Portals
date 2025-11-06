import React from "react";
import { redirect } from "next/navigation";
import { categoryLabel, EntityType, TermAggType } from "./utils";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import elasticsearch from "@/lib/elasticsearch";
import { esDCCs } from '@/app/data/processed/dccs';
import { Metadata, ResolvingMetadata } from "next";
import { estypes } from "@elastic/elasticsearch";
import ClientSideFacets from "@/app/data/processed/ClientSideFacets";

export async function generateMetadata(props: { params: Promise<{ type: string, search?: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const parentMetadata = await parent
  return {
    title: [
      parentMetadata.title?.absolute,
      categoryLabel(params.type),
      params.search && ` | Search ${decodeURIComponent(params.search)}`
    ].filter(item => !!item).join(' | '),
    keywords: [
      parentMetadata.keywords,
      categoryLabel(params.type),
      params.search,
    ].filter(item => !!item).join(', '),
  }
}

export default async function Page(props: React.PropsWithChildren<{ params: Promise<{ type: string, search?: string } & Record<string, string>> }>) {
  const params = await props.params
  for (const k in params) params[k] = decodeURIComponent(params[k])
  if (!params.type) redirect('/data')
  const filter: estypes.QueryDslQueryContainer[] = []
  if (params.search) filter.push({ simple_query_string: { query: params.search, default_operator: 'AND' } })
  if (params.type) filter.push({ query_string: { query: `+type:"${params.type}"` } })
  const facets = [
    'r_dcc',
    'r_source', 'r_relation', 'r_target',
    'r_disease', 'r_species', 'r_anatomy', 'r_gene', 'r_protein', 'r_compound', 'r_data_type', 'r_assay_type',
    'r_file_format', 'r_ptm_type', 'r_ptm_subtype', 'r_ptm_site_type',
  ]
  const searchRes = await elasticsearch.search<EntityType, TermAggType<typeof facets[0]>>({
    index: 'entity',
    query: {
      bool: {
        filter,
      },
    },
    aggs: Object.fromEntries(facets.map(facet => [facet, { terms: { field: facet as string, size: 5, min_doc_count: 2 } }])),
    size: 0,
    rest_total_hits_as_int: true,
  })
  const entityLookupRes = await elasticsearch.search<EntityType>({
    index: 'entity',
    query: {
      ids: {
        values: Array.from(new Set([
          ...facets.flatMap(facet => {
            if (facet === 'r_dcc') return []
            const agg = searchRes.aggregations
            if (!agg) return []
            return agg[facet].buckets.map(filter => filter.key)
          }),
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
        <ClientSideFacets
          aggregations={searchRes.aggregations ?? {}}
          params={{
            type: params.type,
            search: params.search,
          }}
          entityLookup={entityLookup}
        />
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
