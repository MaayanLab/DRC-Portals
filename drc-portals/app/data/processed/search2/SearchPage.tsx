import React from 'react'
import prisma from "@/lib/prisma/slow";
import { human_readable, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import KGNode from '@/public/img/icons/KGNode.png'
import KGEdge from '@/public/img/icons/KGEdge.png'
import SearchFilter from "./SearchFilter";
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Button, Typography } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "next/link";

type PageProps = {
  searchParams: Record<string, string>,
  type: string,
  entity_type: string | null,
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const [results] = searchParams.q ? await prisma.$queryRaw<Array<{
    items: {id: string, type: NodeType, entity_type: string | null, label: string, description: string, dcc: { short_label: string, icon: string, label: string } | null}[],
    count: number,
    dcc_counts: {id: string, short_label: string, count: number}[],
  }>>`
    with results as (
      select
        "node".*,
      ${props.entity_type !== null ? Prisma.sql`
        "entity_node"."type" as "entity_type",
      ` : Prisma.sql`
        null as "entity_type",
      `}
        row_number() over (
          partition by "node"."dcc_id"
          order by ts_rank_cd("node"."searchable", websearch_to_tsquery('english', ${searchParams.q}))
        ) as "rank"
      from "node"
      left join "entity_node" on "entity_node"."id" = "node"."id"
      where
        "node"."type" = ${props.type}::"NodeType"
        ${props.entity_type !== null ? Prisma.sql`
        and "entity_node"."type" = ${props.entity_type}
        ` : Prisma.empty}
        and "node"."searchable" @@ websearch_to_tsquery('english', ${searchParams.q})
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
      (select coalesce(jsonb_agg(dcc_counts.*), '[]'::jsonb) from dcc_counts) as dcc_counts
    ;
  ` : [undefined]
  return (
    <ListingPageLayout
      count={results?.count}
      filters={results?.dcc_counts.length ?
        <>
          <Typography className="subtitle1">Program</Typography>
          {results?.dcc_counts.map((dcc_count) =>
            <SearchFilter key={`dcc-${dcc_count.id}`} id={`dcc:${dcc_count.id}`} count={dcc_count.count} label={dcc_count.short_label} />
          )}
        </>
      : undefined}
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
      <React.Suspense fallback={'Loading...'}>
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
          rows={results?.items.map(item => {
            const href = `/data/processed/${item.type}${item.entity_type ? `/${encodeURIComponent(item.entity_type)}` : ''}/${item.id}`
            return [
              item.dcc?.icon ? <SearchablePagedTableCellIcon href={href} src={item.dcc.icon} alt={item.dcc.label} />
                : item.entity_type !== null ?
                  item.entity_type === 'gene' ? <SearchablePagedTableCellIcon href={href} src={GeneIcon} alt="Gene" />
                  : item.entity_type === 'Drug' ? <SearchablePagedTableCellIcon href={href} src={DrugIcon} alt="Drug" />
                  : <SearchablePagedTableCellIcon href={href} src={KGNode} alt={type_to_string('entity', item.entity_type)} />
                : item.type === 'kg_relation' ? <SearchablePagedTableCellIcon href={href} src={KGEdge} alt={type_to_string('entity', item.entity_type)} />
                : null,
              <LinkedTypedNode type={item.type} entity_type={item.entity_type} id={item.id} label={item.type === 'kg_relation' ? human_readable(item.label) : item.label} search={searchParams.q ?? ''} />,
              <Description description={item.description} search={searchParams.q ?? ''} />,
            ]
          }) ?? []}
        />
      </React.Suspense>
    </ListingPageLayout>
  )
}