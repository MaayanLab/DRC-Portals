'use client'
import React from "react";
import { useRouter } from "@/utils/navigation";
import { FancyTabs } from "@/components/misc/FancyTabs";
import { create_url, parse_url } from "./utils";
import usePathname from "@/utils/pathname";

export default function SearchTabs(props: React.PropsWithChildren<{}>) {
  const router = useRouter()
  const pathname = usePathname()
  const params = React.useMemo(() => parse_url({ pathname }), [pathname])
  return (
    <FancyTabs
      tab={params.search_type ?? ""}
      defaultTab=""
      onChange={(evt, tab) => {
        router.push(create_url({
          ...parse_url(),
          search_type: tab || null,
          facet: null,
          page: '1',
          cursor: null,
          reverse: null,
        }), { scroll: false })
      }}
    >
      {props.children}
    </FancyTabs>
  )
}
