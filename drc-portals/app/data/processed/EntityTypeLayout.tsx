import React from "react";
import { redirect } from "next/navigation";
import { categoryLabel } from "./utils";
import ListingPageLayoutClientSideFacets from '@/app/data/processed/ListingPageLayoutClientSideFacets';
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { Metadata, ResolvingMetadata } from "next";
import { esDCCs } from "./dccs";

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
  return (
    <ListingPageLayoutClientSideFacets
      entityLookup={await esDCCs}
      facets={[`type:"${params.type}"`]}
      search={params.search}
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
    </ListingPageLayoutClientSideFacets>
  )
}
