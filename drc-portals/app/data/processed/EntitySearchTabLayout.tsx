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

type PageProps = { params: Promise<{ search: string, type?: string } & Record<string, string>> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  for (const k in props.params) params[k] = decodeURIComponent(params[k])
  const parentMetadata = await parent
  return {
    title: [
      parentMetadata.title?.absolute,
      params.type && categoryLabel(params.type),
    ].filter(title => !!title).join(' | '),
    keywords: [
      parentMetadata.keywords,
      params.type && categoryLabel(params.type),
    ].filter(item => !!item).join(', '),
  }
}

export default async function Page(props: React.PropsWithChildren<PageProps>) {
  const params = await props.params
  for (const k in params) params[k] = decodeURIComponent(params[k])
  if (!params.search) redirect('/data')
  return (
    <ListingPageLayoutClientSideFacets
      entityLookup={await esDCCs}
      facets={params.type ? [`type:"${params.type}"`] : []}
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
