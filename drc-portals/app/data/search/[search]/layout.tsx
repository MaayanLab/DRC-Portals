import React from "react";
import SearchTabs from "../tabs";
import { redirect } from "next/navigation";
import AllSearchPages from '@/app/data/search/AllSearchPages'
import { SearchQueryComponentTab as C2M2SearchQueryComponentTab} from '@/app/data/c2m2/search/SearchQueryComponent'
import { FancyTabPlaceholder } from "@/components/misc/FancyTabs";
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
      <FancyTabPlaceholder id='c2m2' label={<>Cross-Cut Metadata Model</>} priority={Infinity}>
        <React.Suspense>
          <C2M2SearchQueryComponentTab search={decodeURIComponent(props.params.search)} />
        </React.Suspense>
      </FancyTabPlaceholder>
      <FancyTabPlaceholder id='processed' label={<>Processed Data</>}>
        <React.Suspense>
          <AllSearchPages search={decodeURIComponent(props.params.search)} />
        </React.Suspense>
      </FancyTabPlaceholder>
      {props.children}
    </SearchTabs>
  )
}
