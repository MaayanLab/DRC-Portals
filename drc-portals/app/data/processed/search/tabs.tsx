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
  const { search, subpath } = React.useMemo(() => {
    const m = /^\/data\/processed\/search\/(.+?)(\/(.+))?$/.exec(pathname)
    if (!m) return {}
    return { search: m[1], subpath: m[3] ?? 'all' }
  }, [pathname])
  return (
    <FancyTabs
      tab={subpath}
      onChange={(evt, tab) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('p')
        router.push(`/data/processed/search/${search}/${tab}?${newSearchParams.toString()}`, { scroll: false })
      }}
      postInitializationFallback={<ErrorRedirect error="No results" />}
    >
      {props.children}
    </FancyTabs>
  )
}
