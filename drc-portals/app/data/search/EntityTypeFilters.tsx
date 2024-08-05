import prisma from "@/lib/prisma/slow";
import SearchFilter from "./SearchFilter";
import { pluralize, type_to_color, type_to_string } from "@/app/data/processed/utils";

export default async function EntityTypeFilters({ q }: { q: string }) {
  const result = await prisma.$queryRaw<{type: string, count: number}[]>`
    select "entity_type", count(*)::int as "count"
    from "node"
    where "searchable" @@ websearch_to_tsquery('english', ${q})
    and "entity_type" is not null
    group by "entity_type"
  `
  return result.map((type_count) =>
    <SearchFilter key={`entity-${type_count.type}`} id={`entity:${type_count.type}`} count={type_count.count} label={pluralize(type_to_string('entity', type_count.type))} color={type_to_color('entity', type_count.type)} />
  )
}
