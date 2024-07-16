'use client'
import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { FancyTabs } from "@/components/misc/FancyTabs";
import ErrorRedirect from "./ErrorRedirect";

export default function SearchTabs(props: React.PropsWithChildren<{}>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const subpathname = React.useMemo(() => {
    const m = /^\/data\/processed\/search(\/(.+))$/.exec(pathname)
    return m ? m[2] || '' : ''
  }, [pathname])
  return (
    <FancyTabs
      tab={subpathname || 'all'}
      onChange={(evt, tab) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('p')
        router.push(`/data/processed/search/${tab}?${newSearchParams.toString()}`, { scroll: false })
      }}
      postInitializationFallback={<ErrorRedirect error="No results" />}
    >
      {props.children}
    </FancyTabs>
  )
}
