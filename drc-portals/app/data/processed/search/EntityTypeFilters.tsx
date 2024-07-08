import prisma from "@/lib/prisma";
import SearchFilter from "./SearchFilter";
import { pluralize, type_to_color, type_to_string } from "../utils";

export default async function EntityTypeFilters({ q }: { q: string }) {
  const result = await prisma.$queryRaw<{entity_type: string, count: number}[]>`
    select "node"."entity_type", count(*)::int as "count"
    from "node"
    where "node"."searchable" @@ websearch_to_tsquery('english', ${q})
    and "node"."entity_type" is not null
    group by "node"."entity_type"
  `
  return result.map((type_count) =>
    <SearchFilter key={`entity-${type_count.entity_type}`} id={`entity:${type_count.entity_type}`} count={type_count.count} label={pluralize(type_to_string('entity', type_count.entity_type))} color={type_to_color('entity', type_count.entity_type)} />
  )
}
