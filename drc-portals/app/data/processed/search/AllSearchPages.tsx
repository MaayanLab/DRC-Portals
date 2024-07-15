import prisma from "@/lib/prisma/slow";
import { type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import { NodeType, Prisma } from "@prisma/client";
import SearchPage from './SearchPage'
import AllSearchPage from './AllSearchPage'
import React from "react";
import { FancyTab } from "@/components/misc/FancyTabs";
import { redirect } from "next/navigation";
import { safeAsync } from "@/utils/safe";
import { Prisma_join } from "@/utils/prisma";

type PageProps = { searchParams: Record<string, string> }

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  if (!searchParams.q) redirect('/data')
  const { data: [results] = [undefined], error } = await safeAsync(() => prisma.$queryRaw<Array<{
    count: number,
    type_counts: {type: NodeType | 'all' | 'c2m2', entity_type: string | null, count: number}[],
  }>>`
    with results as (
      select "type", "entity_type", count(*) as count
      from websearch_to_tsquery('english', ${searchParams.q}) q, "node"
      where q @@ "node"."searchable"
      group by "type", "entity_type"
    ), total_count as (
      select sum(count) as count
      from "results"
    )
    select 
      (select count from total_count) as count,
      (select coalesce(jsonb_agg("results".*), '[]'::jsonb) from "results") as type_counts
      ;
  `)
  results?.type_counts.splice(0, 0, { type: 'all', entity_type: null, count: results.count })
  if (!results?.count) return null
  return Object.values(results.type_counts).map(result => (
    <FancyTab
      key={`${result.type}-${result.entity_type}`}
      id={`${result.type}-${result.entity_type}`}
      label={<>{type_to_string(result.type, result.entity_type)}<br />{BigInt(result.count ?? 0).toLocaleString()}</>}
      priority={result.count}
      hidden={result.count === 0}
    >
      <React.Suspense fallback={null}>
        {result.type === 'all' ? <AllSearchPage {...props} />
        : <SearchPage searchParams={props.searchParams} type={result.type} entity_type={result.entity_type} />}
      </React.Suspense>
    </FancyTab>
  ))
}
