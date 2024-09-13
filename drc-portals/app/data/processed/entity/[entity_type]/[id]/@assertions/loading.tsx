'use client'

import SearchablePagedTable from "@/app/data/processed/SearchablePagedTable"

export default function Loading() {
  return <SearchablePagedTable
    label="Knowledge Graph Assertions"
    loading
    q={''}
    p={1}
    r={10}
    count={0}
    columns={[
      <></>,
      <>Source</>,
      <>Relation</>,
      <>Target</>,
      <>Evidence</>,
    ]}
    rows={[]}
  />
}