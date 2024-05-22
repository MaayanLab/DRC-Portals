import prisma from "@/lib/prisma";
import { type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import { NodeType, Prisma } from "@prisma/client";
import SearchPage from './SearchPage'
import AllSearchPage from './AllSearchPage'
import React from "react";
import { FancyTab } from "@/components/misc/FancyTabs";

type PageProps = { searchParams: Record<string, string> }

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  const [results = {
    count: 0,
    type_counts: [],
    dcc_counts: [],
  }] = searchParams.q ? await prisma.$queryRaw<Array<{
    count: number,
    type_counts: {type: NodeType | 'all' | 'c2m2', entity_type: string | null, count: number}[],
    dcc_counts: {id: string, short_label: string, count: number}[],
  }>>`
    with results as (
      select
        "node".*,
        "entity_node"."type" as "entity_type"
      from "node"
      left join "entity_node" on "entity_node"."id" = "node"."id"
      where "node"."searchable" @@ websearch_to_tsquery('english', ${searchParams.q})
    ), total_count as (
      select count(*)::int as count
      from "results"
      ${searchParams.et ? Prisma.sql`
      where
        ${Prisma.join(searchParams.et.map(t =>  t.type === 'dcc' ? 
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
        `), ' or ')}
      ` : Prisma.empty}
    ), type_counts as (
      select "type", "entity_type", count(*)::int as count
      from "results"
      group by "type", "entity_type"
      order by count(*) desc
    ), dcc_id_counts as (
      select "dcc_id", count(*)::int as count
      from "results"
      group by "dcc_id"
    ), dcc_counts as (
      select "dccs".id, "dccs".short_label, "dcc_id_counts".count as count
      from "dcc_id_counts"
      inner join "dccs" on "dccs".id = "dcc_id"
    )
    select 
      (select count from total_count) as count,
      (select coalesce(jsonb_agg(type_counts.*), '[]'::jsonb) from type_counts) as type_counts,
      (select coalesce(jsonb_agg(dcc_counts.*), '[]'::jsonb) from dcc_counts) as dcc_counts
    ;
  ` : [undefined]
  results.type_counts.sort((a, b) => b.count - a.count)
  if (results.count) {
    results.type_counts.splice(0, 0, { type: 'all', entity_type: null, count: results.type_counts.reduce((all, item) => all + item.count, 0) })
  }
  return Object.values(results.type_counts).map(result => (
    <React.Suspense fallback={null}>
      <FancyTab id={`${result.type}-${result.entity_type}`} label={`${type_to_string(result.type, result.entity_type)} (${result.count})`} priority={result.count}>
        <React.Suspense fallback={null}>
          {result.type === 'all' ? <AllSearchPage {...props} />
          : <SearchPage searchParams={props.searchParams} type={result.type} entity_type={result.entity_type} />}
        </React.Suspense>
      </FancyTab>
    </React.Suspense>
  ))
}
