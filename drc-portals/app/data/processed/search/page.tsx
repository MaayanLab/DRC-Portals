import React from "react";
import { Metadata } from "next";
import AllSearchPages from './AllSearchPages'
import { SearchQueryComponent as C2M2SearchQueryComponent} from '../../c2m2/search/SearchQueryComponent'
import { FancyTab, FancyTabs } from "@/components/misc/FancyTabs";

type PageProps = { searchParams: Record<string, string> }

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return {
    title: `Search ${props.searchParams.q ?? ''}`,
  }
}

export default async function Page(props: PageProps) {
  return (
    <FancyTabs>
      <React.Suspense fallback={<FancyTab id="c2m2" label="All (Loading...)" />}>
        <AllSearchPages {...props} />
      </React.Suspense>
      <React.Suspense fallback={<FancyTab id="c2m2" label="C2M2 (Loading...)" />}>
        <C2M2SearchQueryComponent tab {...props} />
      </React.Suspense>
    </FancyTabs>
  )
}
