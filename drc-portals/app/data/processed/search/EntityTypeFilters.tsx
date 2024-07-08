import prisma from "@/lib/prisma";
import SearchFilter from "./SearchFilter";
import { pluralize, type_to_color, type_to_string } from "../utils";

export default async function EntityTypeFilters({ q }: { q: string }) {
  const result = await prisma.$queryRaw<{type: string, count: number}[]>`
    select "entity_node"."type", count(*)::int as "count"
    from "node"
    inner join "entity_node" on "entity_node"."id" = "node"."id"
    where "node"."searchable" @@ websearch_to_tsquery('english', ${q})
    group by "entity_node"."type"
  `
  return result.map((type_count) =>
    <SearchFilter key={`entity-${type_count.type}`} id={`entity:${type_count.type}`} count={type_count.count} label={pluralize(type_to_string('entity', type_count.type))} color={type_to_color('entity', type_count.type)} />
  )
}
