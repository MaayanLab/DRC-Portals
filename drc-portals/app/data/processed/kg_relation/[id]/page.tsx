import prisma from "@/lib/prisma"
import { format_description, useSanitizedSearchParams } from "@/app/data/processed/utils";
import { Prisma } from "@prisma/client";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";

const pageSize = 10

export default async function Page(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
  const [results] = await prisma.$queryRaw<Array<{
    item: { node: { label: string, description: string } },
    assertions: {
      id: string,
      evidence: Prisma.JsonValue,
      source: { id: string, type: string, label: string },
      relation: { id: string, label: string },
      target: { id: string, type: string, label: string },
      dcc: { short_label: string, icon: string, label: string },
    }[],
    n_filtered_assertions: number,
    n_assertions: number,
  }>>`
    with item as (
      select
        "kg_relation_node"."id",
        jsonb_build_object(
          'label', "node"."label",
          'description', "node"."description"
        ) as node
      from "kg_relation_node"
      inner join "node" on "node"."id" = "kg_relation_node"."id"
      where "kg_relation_node"."id" = ${props.params.id}::uuid
    ), kg_assertion_f as (
      select *
      from "kg_assertion"
      where "kg_assertion"."relation_id" = ${props.params.id}::uuid
    ), kg_assertion_fs as (
      select *
      from kg_assertion_f
    ${searchParams.q ? Prisma.sql`
      where
      "kg_assertion_f"."source_id" in (select id from "node" where "node"."type" = 'entity' and "node"."searchable" @@ websearch_to_tsquery('english', ${searchParams.q}))
      or "kg_assertion_f"."target_id" in (select id from "node" where "node"."type" = 'entity' and "node"."searchable" @@ websearch_to_tsquery('english', ${searchParams.q}))
    ` : Prisma.empty}
    ), kg_assertion_fsp as (
      select
        kg_assertion_fs."id",
        kg_assertion_fs."evidence",
        (
          select jsonb_build_object(
            'id', "entity_node"."id",
            'type', "entity_node".type,
            'label', "node".label
          )
          from "entity_node"
          inner join "node" on "node"."id" = "entity_node"."id"
          where "entity_node".id = "kg_assertion_fs"."source_id"
        ) as source,
        (
          select jsonb_build_object(
            'id', "entity_node"."id",
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
      (select row_to_json(item.*) from item) as item,
      (select coalesce(jsonb_agg(kg_assertion_fsp.*), '[]'::jsonb) from kg_assertion_fsp) as assertions,
      (select coalesce(count(kg_assertion_fs.*), 0)::int as count from kg_assertion_fs) as n_filtered_assertions,
      (select coalesce(count(kg_assertion_f.*), 0)::int as count from kg_assertion_f) as n_assertions
  `
  const ps = Math.floor((results.n_filtered_assertions ?? 1) / pageSize) + 1
  return (
    <LandingPageLayout
      label={results.item.node.label}
      description={format_description(results.item.node.description)}
      metadata={[
        { label: 'Description', value: format_description(results.item.node.description) },
        { label: 'Number of Assertions', value: results.n_assertions.toLocaleString() },
      ]}
    >
      <SearchablePagedTable
        q={searchParams.q ?? ''}
        p={searchParams.p}
        ps={ps}
        columns={[
          <>&nbsp;</>,
          <>Source</>,
          <>Relation</>,
          <>Target</>,
          <>Evidence</>,
        ]}
        rows={results.assertions.map(assertion => [
          assertion.dcc.icon ? <SearchablePagedTableCellIcon href={`/data/matrix/${assertion.dcc.short_label}`} src={assertion.dcc.icon} alt={assertion.dcc.label} /> : null,
          <LinkedTypedNode type="entity" id={assertion.source.id} label={assertion.source.label} entity_type={assertion.source.type} />,
          <LinkedTypedNode type="kg_relation" id={assertion.relation.id} label={assertion.relation.label} />,
          <LinkedTypedNode type="entity" id={assertion.target.id} label={assertion.target.label} entity_type={assertion.target.type} />,
          assertion.evidence?.toString(),
        ])}
      />
    </LandingPageLayout>
  )
}
