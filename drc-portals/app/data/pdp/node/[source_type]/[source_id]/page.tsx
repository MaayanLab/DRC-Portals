import prisma from "@/lib/prisma/slow";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { source_type: string, source_id: string }}) {
  const node = await prisma.$queryRaw<{
    type: string,
    id: string,
    attributes: any,
    relationships: Record<string, { type: string, id: string }>
  } | null>`
    select
      type,
      id,
      attributes,
      (
        select jsonb_object_agg("rels"."predicate", "rels"."target")
        from (
          select "relation"."predicate", jsonb_build_object('type', "relation"."target_type", 'id', "relation"."target_id") as "target"
          from "relation"
          where ("relation"."source_type", "relation"."source_id") = ("source"."type", "source"."id")
        ) "rels"
      ) as "relationships"
    from "node" "source"
    where ("source"."type", "source"."id") = (${params.source_type}, ${params.source_id});
  `
  if (node === null) return notFound()
  return <>
    {node.type}
    {JSON.stringify(node.attributes)}
    {JSON.stringify(node.relationships)}
  </>
}
