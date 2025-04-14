import prisma from "@/lib/prisma/slow";
import SearchFilter from "./SearchFilter";
import { pluralize, type_to_color, type_to_string } from "@/app/data/processed/utils";

export default async function NodeTypeFilters({ q }: { q: string }) {
  const result = await prisma.$queryRaw<{type: string, count: number}[]>`
    select "node"."type", count(*)::int as "count"
    from "node"
    where "node"."searchable" @@ websearch_to_tsquery('english', ${q})
    and "node"."type" != 'entity'
    group by "node"."type"
  `
  return result.map((type_count) =>
    <SearchFilter key={`${type_count.type}`} id={type_count.type} count={type_count.count} label={pluralize(type_to_string(type_count.type, ''))} color={type_to_color(type_count.type, '')} />
  )
}
