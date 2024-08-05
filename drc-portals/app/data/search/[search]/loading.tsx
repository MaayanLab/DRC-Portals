import React from "react";
import SearchTabs from "../tabs";
import { FancyTab } from "@/components/misc/FancyTabs";

export default function Page() {
  return (
    <SearchTabs>
      <FancyTab id='c2m2' label={<>Cross-Cut Metadata Model</>} priority={Infinity} loading />
      <FancyTab id='processed' label={<>Processed Data</>} loading />
    </SearchTabs>
  )
}
