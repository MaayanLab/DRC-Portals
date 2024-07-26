import prisma from "@/lib/prisma/slow";
import { type_to_string } from "@/app/data/processed/utils"
import { NodeType } from "@prisma/client";
import React from "react";
import { safeAsync } from "@/utils/safe";
import { FancyTab } from "@/components/misc/FancyTabs";
import ErrorRedirect from "./ErrorRedirect";

export default async function Page(props: { search: string }) {
  const { data: [results] = [undefined], error } = await safeAsync(() => prisma.$queryRaw<Array<{
    count: number,
    type_counts: {type: NodeType | 'all' | 'c2m2', entity_type: string | null, count: number}[],
  }>>`
    with results as (
      select "type", "entity_type", count(*) as count
      from websearch_to_tsquery('english', ${props.search}) q, "node"
      where q @@ "node"."searchable"
      group by "type", "entity_type"
    ), total_count as (
      select sum(count) as count
      from "results"
    )
    select 
      (select count::int from total_count) as count,
      (select coalesce(jsonb_agg("results".*), '[]'::jsonb) from "results") as type_counts
      ;
  `)
  if (error) console.error(error)
  if (!results?.count) return <FancyTab id="all" label="All" hidden />
  results.type_counts.splice(0, 0, { type: 'all', entity_type: null, count: results.count })
  return Object.values(results.type_counts).map(result => (
    <FancyTab
      key={`${result.type}-${result.entity_type}`}
      id={`${encodeURIComponent(result.type)}${result.entity_type ? `/${encodeURIComponent(result.entity_type)}` : ''}`}
      label={<>{type_to_string(result.type, result.entity_type)}<br />{BigInt(result.count ?? 0).toLocaleString()}</>}
      priority={result.count}
    />
  ))
}
