import prisma from "@/lib/prisma/slow";

export default async function Page({ params: { q = '', p = '0' } }: { params: { q?: string, p?: string } }) {
  const node = await prisma.$queryRaw<{
    type: string, id: string, attributes: any, relationships: Record<string, { type: string, id: string }[]>
  }>`
    select
      source.*,
      (
        select jsonb_object_agg(rs.predicate, rs.target)
        from (
          select r.predicate, jsonb_object_create('type', r.target_type, 'id', r.target_id) as target
          from "pdp"."relationship" r on (r.source_type, r.source_id) = (source.type, source.id)
          where r.predicate = 'dcc'
        ) rs
        group by rs.predicate
      ) as relationships
    from "api"."searchEntity"(${q}) source
    offset ${Math.max(0, +p)*10}
    limit ${10};
  `
  return <>{JSON.stringify(node)}</>
}
