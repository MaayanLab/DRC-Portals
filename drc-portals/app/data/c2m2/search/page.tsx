import prisma from "@/lib/prisma";
import { pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import SearchFilter from "./SearchFilter";
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Button } from "@mui/material";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "next/link";

type PageProps = { searchParams: Record<string, string> }

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return {
    title: `Search ${props.searchParams.q ?? ''}`,
  }
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const [results] = searchParams.q ? await prisma.$queryRaw<Array<{
    items: {id: string, type: NodeType, entity_type: string | null, label: string, description: string, dcc: { short_label: string, icon: string, label: string } | null}[],
    count: number,
    type_counts: {type: NodeType, entity_type: string | null, count: number}[],
    dcc_counts: {id: string, short_label: string, count: number}[],
  }>>`
    with results as (
      select
        "node".*,
        "entity_node"."type" as "entity_type",
        ts_rank_cd("node"."searchable", websearch_to_tsquery('english', ${searchParams.q})) as "rank"
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
      ${searchParams.t ? Prisma.sql`
      where
        ${Prisma.join(searchParams.t.map(t => t.type === 'dcc' ? 
          Prisma.sql`
          "results"."dcc_id" = ${t.entity_type}
          `
        : Prisma.sql`
        (
          "results"."type" = ${t.type}::"NodeType"
          ${t.entity_type ? Prisma.sql`
            and "results"."entity_type" = ${t.entity_type}
          ` : Prisma.empty}
        )
        `), ' or ')}
      ` : Prisma.empty}
      order by "results"."rank"
      offset ${offset}
      limit ${limit}
    ), total_count as (
      select count(*)::int as count
      from "results"
      ${searchParams.t ? Prisma.sql`
      where
        ${Prisma.join(searchParams.t.map(t =>  t.type === 'dcc' ? 
          Prisma.sql`
          "results"."dcc_id" = ${t.entity_type}
          `
        : Prisma.sql`
        (
          "results"."type" = ${t.type}::"NodeType"
          ${t.entity_type ? Prisma.sql`
            and "results"."entity_type" = ${t.entity_type}
          ` : Prisma.empty}
        )
        `), ' or ')}
      ` : Prisma.empty}
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
      (select count from total_count) as count,
      (select coalesce(jsonb_agg(type_counts.*), '[]'::jsonb) from type_counts) as type_counts,
      (select coalesce(jsonb_agg(dcc_counts.*), '[]'::jsonb) from dcc_counts) as dcc_counts
    ;
  ` : [undefined]
  if (!results) redirect('/data')
  else if (results.count === 0) redirect(`/data?error=${encodeURIComponent(`No results for '${searchParams.q ?? ''}'`)}`)
  return (
    <ListingPageLayout
      count={results?.count}
      filters={
        <>
          {/* <Typography className="caption">Type</Typography> */}
          {results?.type_counts.filter(({ entity_type }) => !entity_type).map((type_count) =>
            <SearchFilter key={`${type_count.type}-${type_count.entity_type}`} id={type_count.type} count={type_count.count} label={pluralize(type_to_string(type_count.type, type_count.entity_type))} />
          )}
          {/* <hr className="m-2" />
          <Typography className="caption">Program</Typography> */}
          {results?.dcc_counts.map((dcc_count) =>
            <SearchFilter key={`dcc-${dcc_count.id}`} id={`dcc:${dcc_count.id}`} count={dcc_count.count} label={dcc_count.short_label} />
          )}
          {/* <hr className="m-2" />
          <Typography className="caption">Entity</Typography> */}
          {results?.type_counts.filter(({ entity_type }) => !!entity_type).map((type_count) =>
            <SearchFilter key={`${type_count.type}-${type_count.entity_type}`} id={`entity:${type_count.entity_type}`} count={type_count.count} label={pluralize(type_to_string(type_count.type, type_count.entity_type))} />
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
        count={results?.count}
        columns={[
          <>&nbsp;</>,
          <>Label</>,
          <>Description</>,
        ]}
        rows={results?.items.map(item => [
          item.dcc?.icon ? <SearchablePagedTableCellIcon href={`/info/dcc/${item.dcc.short_label}`} src={item.dcc.icon} alt={item.dcc.label} />
            : item.type === 'entity' ? 
              item.entity_type === 'gene' ? <SearchablePagedTableCellIcon href={`/data/processed/${item.type}/${item.entity_type}`} src={GeneIcon} alt="Gene" />
              : item.entity_type === 'Drug' ? <SearchablePagedTableCellIcon href={`/data/processed/${item.type}/${item.entity_type}`} src={DrugIcon} alt="Drug" />
              : null
            : null,
          <LinkedTypedNode type={item.type} entity_type={item.entity_type} id={item.id} label={item.label} />,
          <Description description={item.description}/>,
        ]) ?? []}
      />
    </ListingPageLayout>
  )
}