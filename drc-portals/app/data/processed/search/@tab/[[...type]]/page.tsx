import AllSearchPages from '@/app/data/processed/search/AllSearchPages'
import { SearchQueryComponent as C2M2SearchQueryComponent} from '@/app/data/c2m2/search/SearchQueryComponent'
import React from "react";
import { FancyTab } from '@/components/misc/FancyTabs';

export default function TypeTab(props: { params: { type?: string | string[] }, searchParams: Record<string, string> }) {
  return <>
    <React.Suspense fallback={<FancyTab id='all' label={<>Processed Data</>} loading />}>
      <AllSearchPages {...props} />
    </React.Suspense>
    <React.Suspense fallback={<FancyTab id='c2m2' label={<>Cross-Cut Metadata Model</>} loading />}>
      <C2M2SearchQueryComponent tab {...props} />
    </React.Suspense>
  </>
}
