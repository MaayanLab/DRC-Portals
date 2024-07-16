import React from "react";
import SearchTabs from "./tabs";

export default function Page(props: React.PropsWithChildren<{ tab: React.ReactNode }>) {
  return (
    <SearchTabs>
      {props.tab}
      {props.children}
    </SearchTabs>
  )
}
