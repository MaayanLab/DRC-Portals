import React from "react";
import SearchTabs from "../tabs";
import { redirect } from "next/navigation";
import AllSearchPages from '@/app/data/processed/search/AllSearchPages'
import { SearchQueryComponentTab as C2M2SearchQueryComponentTab} from '@/app/data/c2m2/search/SearchQueryComponent'
import { FancyTab } from "@/components/misc/FancyTabs";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(props: { params: { search: string } }, parent: ResolvingMetadata): Promise<Metadata> {
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | Search ${decodeURIComponent(props.params.search)}`,
    keywords: parentMetadata.keywords,
  }
}

export default function Page(props: React.PropsWithChildren<{ params: { search: string } }>) {
  if (!props.params.search) redirect('/data')
  return (
    <SearchTabs>
      <React.Suspense fallback={<FancyTab id='c2m2' label={<>Cross-Cut Metadata Model</>} priority={Infinity} loading />}>
        <C2M2SearchQueryComponentTab search={decodeURIComponent(props.params.search)} />
      </React.Suspense>
      <React.Suspense fallback={<FancyTab id='all' label={<>Processed Data</>} loading />}>
        <AllSearchPages search={decodeURIComponent(props.params.search)} />
      </React.Suspense>
      {props.children}
    </SearchTabs>
  )
}
