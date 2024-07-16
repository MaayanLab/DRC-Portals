import AllSearchPages from '@/app/data/processed/search/AllSearchPages'
import { SearchQueryComponent as C2M2SearchQueryComponent} from '@/app/data/c2m2/search/SearchQueryComponent'
import React from "react";

export default function TypeTab(props: { params: { type?: string | string[] }, searchParams: Record<string, string> }) {
  return <>
    <AllSearchPages {...props} />
    <C2M2SearchQueryComponent tab {...props} />
  </>
}
