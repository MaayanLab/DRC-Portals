import prisma from "@/lib/prisma/slow"
import { human_readable, useSanitizedSearchParams } from "@/app/data/processed/utils";
import { Prisma } from "@prisma/client";
import SearchablePagedTable, { LinkedTypedNode, SearchablePagedTableCellIcon } from "@/app/data/processed/SearchablePagedTable";
import { safeAsync } from "@/utils/safe";
import { getItem } from "../item";

export default async function Page(props: { params: { entity_type: string, slug: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const node = await getItem(props.params)
  if (!node) return null
  const { data: [results] = [], error } = await safeAsync(() => prisma.$queryRaw<Array<{
    assertions: {
      id: string,
      evidence: Prisma.JsonValue,
      source: { slug: string, type: string, label: string },
      relation: { slug: string, label: string },
      target: { slug: string, type: string, label: string },
      dcc: { short_label: string, icon: string, label: string },
    }[],
    n_filtered_assertions: number,
    n_assertions: number,
  }>>`
    with kg_assertion_f as (
      select
        "kg_assertion"."id",
        "kg_assertion"."evidence",
        "kg_assertion"."source_id",
        "kg_assertion"."relation_id",
        "kg_assertion"."target_id",
        "kg_assertion"."dcc_id"
      from "kg_assertion"
      where "kg_assertion"."source_id" = ${node.id}::uuid or "kg_assertion"."target_id" = ${node.id}::uuid
    ), kg_assertion_fs as (
      select *
      from kg_assertion_f
    ${searchParams.q ? Prisma.sql`
        , websearch_to_tsquery('english', ${searchParams.q}) q
      where
      "kg_assertion_f"."source_id" in (select id from "node" where "node"."type" = 'entity' and q @@ "node"."searchable")
      or "kg_assertion_f"."target_id" in (select id from "node" where "node"."type" = 'entity' and q @@ "node"."searchable")
      or "kg_assertion_f"."relation_id" in (select id from "node" where "node"."type" = 'kg_relation' and q @@ "node"."searchable")
    ` : Prisma.empty}
    ), kg_assertion_fsp as (
      select
        kg_assertion_fs."id",
        kg_assertion_fs."evidence",
        (
          select jsonb_build_object(
            'slug', "node"."slug",
            'type', "entity_node".type,
            'label', "node".label
          )
          from "entity_node"
          inner join "node" on "node"."id" = "entity_node"."id"
          where "entity_node".id = "kg_assertion_fs"."source_id"
        ) as source,
        (
          select jsonb_build_object(
            'slug', "node"."slug",
            'label', "node".label
          )
          from "kg_relation_node"
          inner join "node" on "node"."id" = "kg_relation_node"."id"
          where "kg_relation_node".id = "kg_assertion_fs"."relation_id"
        ) as relation,
        (
          select jsonb_build_object(
            'slug', "node"."slug",
            'type', "entity_node".type,
            'label', "node".label
          )
          from "entity_node"
          inner join "node" on "node"."id" = "entity_node"."id"
          where "entity_node".id = "kg_assertion_fs"."target_id"
        ) as target,
        (
          select jsonb_build_object(
            'short_label', "dccs".short_label,
            'icon', "dccs".icon,
            'label', "dccs".label
          )
          from "dccs"
          where "dccs".id = "kg_assertion_fs"."dcc_id"
        ) as dcc
      from kg_assertion_fs
      order by kg_assertion_fs."id"
      offset ${offset}
      limit ${limit}
    )
    select
      (select coalesce(jsonb_agg(kg_assertion_fsp.*), '[]'::jsonb) from kg_assertion_fsp) as assertions,
      (select coalesce(count(kg_assertion_fs.*), 0)::int as count from kg_assertion_fs) as n_filtered_assertions,
      (select coalesce(count(kg_assertion_f.*), 0)::int as count from kg_assertion_f) as n_assertions
  `)
  if (error) console.error(error)
  if (!results?.n_assertions) return null
  return (
    <SearchablePagedTable
      label="Knowledge Graph Assertions"
      q={searchParams.q ?? ''}
      p={searchParams.p}
      r={searchParams.r}
      count={results.n_filtered_assertions}
      columns={[
        <></>,
        <>Source</>,
        <>Relation</>,
        <>Target</>,
        <>Evidence</>,
      ]}
      rows={results.assertions.map(assertion => [
        assertion.dcc?.icon ? <SearchablePagedTableCellIcon href={`/info/dcc/${assertion.dcc.short_label}`} src={assertion.dcc.icon} alt={assertion.dcc.label} /> : null,
        <LinkedTypedNode type="entity" entity_type={assertion.source.type} slug={assertion.source.slug} focus={assertion.source.slug === props.params.slug} label={assertion.source.label} />,
        <LinkedTypedNode type="kg_relation" slug={assertion.relation.slug} label={human_readable(assertion.relation.label)} search={searchParams.q ?? ''} />,
        <LinkedTypedNode type="entity" entity_type={assertion.target.type} slug={assertion.target.slug} focus={assertion.target.slug === props.params.slug} label={assertion.target.label} />,
        assertion.evidence?.toString(),
      ])}
    />
  )
}
