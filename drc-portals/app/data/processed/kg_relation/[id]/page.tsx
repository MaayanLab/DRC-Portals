import prisma from "@/lib/prisma"
import { format_description, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import { Prisma } from "@prisma/client";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";

type PageProps = { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }

const getItem = cache((id: string) => prisma.kGRelationNode.findUniqueOrThrow({
  where: { id },
  select: {
    node: {
      select: {
        label: true,
        description: true,
      },
    },
  },
}))

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const item = await getItem(props.params.id)
  return {
    title: `${(await parent).title?.absolute} | ${type_to_string('kg_relation', null)} | ${item.node.label}`,
    description: item.node.description,
  }
}

export default async function Page(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const item = await getItem(props.params.id)
  const [results] = await prisma.$queryRaw<Array<{
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
    with kg_assertion_f as (
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
      (select coalesce(jsonb_agg(kg_assertion_fsp.*), '[]'::jsonb) from kg_assertion_fsp) as assertions,
      (select coalesce(count(kg_assertion_fs.*), 0)::int as count from kg_assertion_fs) as n_filtered_assertions,
      (select coalesce(count(kg_assertion_f.*), 0)::int as count from kg_assertion_f) as n_assertions
  `
  return (
    <LandingPageLayout
      title={item.node.label}
      subtitle={type_to_string('kg_relation', null)}
      description={format_description(item.node.description)}
      metadata={[
        { label: 'Assertions', value: results.n_assertions.toLocaleString() },
      ]}
    >
      <SearchablePagedTable
        label="Knowledge Graph Assertions"
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={results.n_filtered_assertions}
        columns={[
          <>&nbsp;</>,
          <>Source</>,
          <>Relation</>,
          <>Target</>,
          <>Evidence</>,
        ]}
        rows={results.assertions.map(assertion => [
          assertion.dcc.icon ? <SearchablePagedTableCellIcon href={`/info/dcc/${assertion.dcc.short_label}`} src={assertion.dcc.icon} alt={assertion.dcc.label} /> : null,
          <LinkedTypedNode type="entity" id={assertion.source.id} label={assertion.source.label} entity_type={assertion.source.type} />,
          <LinkedTypedNode type="kg_relation" id={props.params.id} label={item.node.label} focus />,
          <LinkedTypedNode type="entity" id={assertion.target.id} label={assertion.target.label} entity_type={assertion.target.type} />,
          assertion.evidence?.toString(),
        ])}
      />
    </LandingPageLayout>
  )
}
