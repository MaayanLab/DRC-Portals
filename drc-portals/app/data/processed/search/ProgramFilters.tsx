import prisma from "@/lib/prisma";
import SearchFilter from "./SearchFilter";

export default async function ProgramFilters({ q }: { q: string }) {
  const result = await prisma.$queryRaw<{id: string, short_label: string, count: number}[]>`
    with cte as (
      select "node"."dcc_id", count(*)::int as "count"
      from "node"
      where "node"."searchable" @@ websearch_to_tsquery('english', ${q})
      group by "node"."dcc_id"
    )
    select "dccs"."id", "dccs"."short_label", "cte"."count"
    from "dccs"
    inner join cte on "cte"."dcc_id" = "dccs"."id";
  `
  return result.map((dcc_count) =>
    <SearchFilter key={`dcc-${dcc_count.id}`} id={`dcc:${dcc_count.id}`} count={dcc_count.count} label={dcc_count.short_label} />
  )
}
