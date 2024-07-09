import React from "react";
import { Metadata } from "next";
import AllSearchPages from './AllSearchPages'
import { SearchQueryComponent as C2M2SearchQueryComponent} from '../../c2m2/search/SearchQueryComponent'
import { FancyTab, FancyTabs } from "@/components/misc/FancyTabs";
import ErrorRedirect from "./ErrorRedirect";

type PageProps = { searchParams: Record<string, string> }

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return {
    title: `Search ${props.searchParams.q ?? ''}`,
  }
}

export default async function Page(props: PageProps) {
  return (
    <FancyTabs
      preInitializationFallback={<>Loading...</>}
      //postInitializationFallback={<ErrorRedirect error={`No results for '${props.searchParams.q ?? ''}'`} />}
    >
      <React.Suspense fallback={<FancyTab id="all" label="All (Loading...)" />}>
        <AllSearchPages {...props} />
      </React.Suspense>
      <React.Suspense fallback={<FancyTab id="c2m2" label="C2M2 (Loading...)" />}>
        <C2M2SearchQueryComponent tab {...props} />
      </React.Suspense>
    </FancyTabs>
  )
}
