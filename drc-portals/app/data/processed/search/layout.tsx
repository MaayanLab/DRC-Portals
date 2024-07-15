import React from "react";
import { FancyTabs } from "@/components/misc/FancyTabs";

export default async function Page({ children }: React.PropsWithChildren<{}>) {
  return (
    <FancyTabs
      //preInitializationFallback={<>Loading...</>}
      //postInitializationFallback={<ErrorRedirect error={`No results for '${props.searchParams.q ?? ''}'`} />}
    >
      {children}
    </FancyTabs>
  )
}
