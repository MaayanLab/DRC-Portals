import { FancyTab } from "@/components/misc/FancyTabs";
import AllSearchPages from '@/app/data/processed/search/AllSearchPages'
import { SearchQueryComponent as C2M2SearchQueryComponent} from '@/app/data/c2m2/search/SearchQueryComponent'
import React from "react";

export default function TypeTab(props: any) {
  return <>
    <React.Suspense fallback={<FancyTab id="c2m2" label="Cross-Cut Metadata" loading />}><C2M2SearchQueryComponent tab {...props} /></React.Suspense>
    <React.Suspense fallback={<FancyTab id="all" label="Processed Data" loading />}><AllSearchPages {...props} /></React.Suspense>
  </>
}
