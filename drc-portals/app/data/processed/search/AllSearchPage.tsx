import prisma from "@/lib/prisma";
import { pluralize, type_to_color, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import KGNode from '@/public/img/icons/KGNode.png'
import KGEdge from '@/public/img/icons/KGEdge.png'
import SearchFilter from "./SearchFilter";
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Button, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "next/link";

type PageProps = { searchParams: Record<string, string> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | Search ${props.searchParams.q ?? ''}`,
    keywords: parentMetadata.keywords,
  }
}

/**
 * Like Prisma.join -- but filters out Prisma.empty, and supports empty/singular lists
 */
function Prisma_join<T>(L: T[], sep: string) {
  L = L.filter(el => el !== Prisma.empty)
  return L.length === 0 ? Prisma.empty : L.length === 1 ? L[0] : Prisma.join(L, sep)
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const filterClause = searchParams.et ? Prisma_join([
    // when DCC is available, we'll filter by entities per-dcc
    searchParams.et.some(t => t.type === 'dcc')
      ? Prisma_join(
        searchParams.et.filter(t => t.type === 'dcc').map(t => Prisma_join([
          Prisma.sql`"results"."dcc_id" = ${t.entity_type}`,
          Prisma_join(searchParams.et ? searchParams.et.filter(t => t.type !== 'dcc' && t.entity_type === null).map(t => Prisma.sql`
            (
              "results"."type" = ${t.type}::"NodeType"
            )
            `) : [], ' or '),
        ], ' and ')),
        ' or '
      )
      // otherwise, we filter by entity type independent of dcc
      : Prisma_join(searchParams.et.filter(t => t.type !== 'dcc' && t.entity_type === null).map(t => Prisma.sql`
        (
          "results"."type" = ${t.type}::"NodeType"
        )
        `), ' or '),
    // entities not associated with a DCC should be independently filterable
    Prisma_join(searchParams.et.filter(t => t.entity_type !== null).map(t => Prisma.sql`
      (
        "results"."type" = 'entity'::"NodeType"
        ${t.entity_type ? Prisma.sql`
          and "results"."entity_type" = ${t.entity_type}
        ` : Prisma.empty}
      )
    `), ' or '),
  ], ' or ') : Prisma.empty
  const [results] = searchParams.q ? await prisma.$queryRaw<Array<{
    items: {id: string, type: NodeType, entity_type: string | null, label: string, description: string, dcc: { short_label: string, icon: string, label: string } | null}[],
    filter_count: number,
    total_count: number,
    type_counts: {type: NodeType, entity_type: string | null, count: number}[],
    dcc_counts: {id: string, short_label: string, count: number}[],
  }>>`
    with results as (
      select
        "node".*,
        "entity_node"."type" as "entity_type",
        row_number() over (
          partition by "node"."type", "node"."dcc_id"
          order by ts_rank_cd("node"."searchable", websearch_to_tsquery('english', ${searchParams.q}))
        ) as "rank"
      from "node"
      left join "entity_node" on "entity_node"."id" = "node"."id"
      where "node"."searchable" @@ websearch_to_tsquery('english', ${searchParams.q})
    ), items as (
      select id, type, entity_type, label, description, (
        select jsonb_build_object(
          'short_label', "dccs".short_label,
          'icon', "dccs".icon,
          'label', "dccs".label
        )
        from "dccs"
        where "dccs".id = "dcc_id"
      ) as dcc
      from "results"
      ${filterClause !== Prisma.empty ? Prisma.sql`where ${filterClause}` : Prisma.empty}
      order by "results"."rank"
      offset ${offset}
      limit ${limit}
    ), filter_count as (
      select count(*)::int as count
      from "results"
      ${filterClause !== Prisma.empty ? Prisma.sql`where ${filterClause}` : Prisma.empty}
    ), total_count as (
      select count(*)::int as count
      from "results"
    ), type_counts as (
      select "type", "entity_type", count(*)::int as count
      from "results"
      group by "type", "entity_type"
      order by count(*) desc
    ), dcc_id_counts as (
      select "dcc_id", count(*)::int as count
      from "results"
      group by "dcc_id"
    ), dcc_counts as (
      select "dccs".id, "dccs".short_label, "dcc_id_counts".count as count
      from "dcc_id_counts"
      inner join "dccs" on "dccs".id = "dcc_id"
    )
    select 
      (select coalesce(jsonb_agg(items.*), '[]'::jsonb) from items) as items,
      (select count from total_count) as total_count,
      (select count from filter_count) as filter_count,
      (select coalesce(jsonb_agg(type_counts.*), '[]'::jsonb) from type_counts) as type_counts,
      (select coalesce(jsonb_agg(dcc_counts.*), '[]'::jsonb) from dcc_counts) as dcc_counts
    ;
  ` : [undefined]
  if (!results?.total_count) return null
  return (
    <ListingPageLayout
      count={results?.filter_count}
      filters={
        <>
          <Typography className="subtitle1">Program</Typography>
          {results?.dcc_counts.map((dcc_count) =>
            <SearchFilter key={`dcc-${dcc_count.id}`} id={`dcc:${dcc_count.id}`} count={dcc_count.count} label={dcc_count.short_label} />
          )}
          <hr className="m-2" />
          <Typography className="subtitle1">Type</Typography>
          {results?.type_counts.filter(({ entity_type }) => !entity_type).map((type_count) =>
            <SearchFilter key={`${type_count.type}-${type_count.entity_type}`} id={type_count.type} count={type_count.count} label={pluralize(type_to_string(type_count.type, type_count.entity_type))} color={type_to_color(type_count.type, type_count.entity_type)} />
          )}
          {results?.type_counts.filter(({ entity_type }) => !!entity_type).map((type_count) =>
            <SearchFilter key={`${type_count.type}-${type_count.entity_type}`} id={`entity:${type_count.entity_type}`} count={type_count.count} label={pluralize(type_to_string(type_count.type, type_count.entity_type))} color={type_to_color(type_count.type, type_count.entity_type)} />
          )}
        </>
      }
      footer={
        <Link href="/data">
          <Button
            sx={{textTransform: "uppercase"}}
            color="primary"
            variant="contained"
            startIcon={<Icon path={mdiArrowLeft} size={1} />}>
              BACK TO SEARCH
          </Button>
        </Link>
      }
    >
      <SearchablePagedTable
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={results?.filter_count}
        columns={[
          <>&nbsp;</>,
          <>Label</>,
          <>Description</>,
        ]}
        rows={results?.items.map(item => [
          item.dcc?.icon ? <SearchablePagedTableCellIcon href={`/info/dcc/${item.dcc.short_label}`} src={item.dcc.icon} alt={item.dcc.label} />
            : item.entity_type !== null ?
              item.entity_type === 'gene' ? <SearchablePagedTableCellIcon href={`/data/processed/${item.type}/${encodeURIComponent(item.entity_type)}`} src={GeneIcon} alt="Gene" />
              : item.entity_type === 'Drug' ? <SearchablePagedTableCellIcon href={`/data/processed/${item.type}/${encodeURIComponent(item.entity_type)}`} src={DrugIcon} alt="Drug" />
              : <SearchablePagedTableCellIcon href={`/data/processed/${item.type}/${encodeURIComponent(item.entity_type)}`} src={KGNode} alt={type_to_string('entity', item.entity_type)} />
            : item.type === 'kg_relation' ? <SearchablePagedTableCellIcon href={`/data/processed/${item.type}`} src={KGEdge} alt={type_to_string('entity', item.entity_type)} />
            : null,
          <LinkedTypedNode type={item.type} entity_type={item.entity_type} id={item.id} label={item.label} search={searchParams.q ?? ''} />,
          <Description description={item.description} search={searchParams.q ?? ''} />,
        ]) ?? []}
      />
    </ListingPageLayout>
  )
}
