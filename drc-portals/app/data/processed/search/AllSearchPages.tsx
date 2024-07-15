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
      select *
      from websearch_to_tsquery('english', ${searchParams.q}) q, "node"
      where ${Prisma_join([
        Prisma.sql`q @@ "node"."searchable"`,
        searchParams.et ? Prisma.join(
          searchParams.et.map(t =>  t.type === 'dcc' ? 
              Prisma.sql`
              "results"."dcc_id" = ${t.entity_type}
              `
            : Prisma.sql`
            (
              "results"."type" = ${t.type}::"NodeType"
              ${t.entity_type ? Prisma.sql`
                and "results"."entity_type" = ${t.entity_type}
              ` : Prisma.empty}
            )
            `),
        ' or ') : Prisma.empty,
      ], ' and ')}
    ), total_count as (
      select count(*)::int as count
      from "results"
    ), type_counts as (
      select "type", "entity_type", count(*)::int as count
      from "results"
      group by "type", "entity_type"
      order by count(*) desc
    )
    select 
      (select count from total_count) as count,
      (select coalesce(jsonb_agg(type_counts.*), '[]'::jsonb) from type_counts) as type_counts
    ;
  `)
  results?.type_counts.sort((a, b) => b.count - a.count)
  results?.type_counts.splice(0, 0, { type: 'all', entity_type: null, count: results.type_counts.reduce((all, item) => all + item.count, 0) })
  if (!results) return null
  return Object.values(results.type_counts).map(result => (
    <FancyTab
      key={`${result.type}-${result.entity_type}`}
      id={`${result.type}-${result.entity_type}`}
      label={<>{type_to_string(result.type, result.entity_type)}<br />{BigInt(result.count).toLocaleString()}</>}
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
