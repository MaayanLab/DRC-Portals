import prisma from "@/lib/prisma/slow"
import { format_description, human_readable, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import { Prisma } from "@prisma/client";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

type PageProps = { params: { slug: string }, searchParams: Record<string, string | string[] | undefined> }

const getItem = cache((slug: string) => prisma.kGRelationNode.findUnique({
  where: { node: { type: 'kg_relation', entity_type: null, slug } },
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
  const title = type_to_string('kg_relation', null)
  const item = await getItem(props.params.slug)
  if (!item) return {}
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | ${title} | ${item.node.label}`,
    description: item.node.description,
    keywords: [
      title,
      item.node.label,
      parentMetadata.keywords,
    ].join(', '),
  }
}

export default async function Page(props: { params: { slug: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const item = await getItem(props.params.slug)
  if (!item) return notFound()
  const [results] = await prisma.$queryRaw<Array<{
    assertions: {
      id: string,
      evidence: Prisma.JsonValue,
      source: { slug: string, type: string, label: string },
      target: { slug: string, type: string, label: string },
      dcc: { short_label: string, icon: string, label: string },
    }[],
    n_filtered_assertions: number,
    n_assertions: number,
  }>>`
    with kg_assertion_f as (
      select *
      from "node" n
      inner join "kg_assertion" on "kg_assertion"."relation_id" = n.id
      where n.slug = ${props.params.slug}
    ), kg_assertion_fs as (
      select *
      from kg_assertion_f
    ${searchParams.q ? Prisma.sql`
        , websearch_to_tsquery('english', ${searchParams.q}) q
      where
      "kg_assertion_f"."source_id" in (select id from "node" where "node"."type" = 'entity' and q @@ "node"."searchable")
      or "kg_assertion_f"."target_id" in (select id from "node" where "node"."type" = 'entity' and q @@ "node"."searchable")
    ` : Prisma.empty}
    ), kg_assertion_fsp as (
      select
        kg_assertion_fs."id",
        kg_assertion_fs."evidence",
        (
          select jsonb_build_object(
            'slug', "node"."slug",
            'type', "node".entity_type,
            'label', "node".label
          )
          from "node"
          where "node"."id" = "kg_assertion_fs"."source_id"
        ) as source,
        (
          select jsonb_build_object(
            'slug', "node"."slug",
            'type', "node".entity_type,
            'label', "node".label
          )
          from "node"
          where "node".id = "kg_assertion_fs"."target_id"
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
  if (!results) return notFound()
  return (
    <LandingPageLayout
      title={human_readable(item.node.label)}
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
          <LinkedTypedNode type="entity" slug={assertion.source.slug} label={assertion.source.label} entity_type={assertion.source.type} search={searchParams.q ?? ''} />,
          <LinkedTypedNode type="kg_relation" slug={props.params.slug} label={human_readable(item.node.label)} focus />,
          <LinkedTypedNode type="entity" slug={assertion.target.slug} label={assertion.target.label} entity_type={assertion.target.type} search={searchParams.q ?? ''} />,
          assertion.evidence?.toString(),
        ])}
      />
    </LandingPageLayout>
  )
}
