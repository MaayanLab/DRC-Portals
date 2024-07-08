import prisma from "@/lib/prisma";
import { human_readable, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import KGNode from '@/public/img/icons/KGNode.png'
import KGEdge from '@/public/img/icons/KGEdge.png'
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Button, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "next/link";
import { safeAsync } from "@/utils/safe";
import ProgramFilters from "./ProgramFilters";
import NodeTypeFilters from "./NodeTypeFilters";
import EntityTypeFilters from "./EntityTypeFilters";
import React from "react";
import { Prisma_join } from "@/utils/prisma";

type PageProps = { searchParams: Record<string, string> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | Search ${props.searchParams.q ?? ''}`,
    keywords: parentMetadata.keywords,
  }
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const filterClause = searchParams.t ? Prisma_join([
    // when DCC is available, we'll filter by entities per-dcc
    searchParams.t.some(t => t.type === 'dcc')
      ? Prisma_join(
        searchParams.t.filter(t => t.type === 'dcc').map(t => Prisma_join([
          Prisma.sql`"node"."dcc_id" = ${t.entity_type}`,
          Prisma_join(searchParams.t ? searchParams.t.filter(t => t.type !== 'dcc' && t.entity_type === null).map(t => Prisma.sql`
            (
              "node"."type" = ${t.type}::"NodeType"
            )
            `) : [], ' or '),
        ], ' and ')),
        ' or '
      )
      // otherwise, we filter by entity type independent of dcc
      : Prisma_join(searchParams.t.filter(t => t.type !== 'dcc' && t.entity_type === null).map(t => Prisma.sql`
        (
          "node"."type" = ${t.type}::"NodeType"
        )
        `), ' or '),
    // entities not associated with a DCC should be independently filterable
    Prisma_join(searchParams.t.filter(t => t.entity_type !== null).map(t => Prisma.sql`
      (
        "node"."type" = 'entity'::"NodeType"
        ${t.entity_type ? Prisma.sql`
          and "node"."entity_type" = ${t.entity_type}
        ` : Prisma.empty}
      )
    `), ' or '),
  ], ' or ') : Prisma.empty
  if (!searchParams.q) redirect('/data')
  const { data: [results] = [undefined], error } = await safeAsync(() => prisma.$queryRaw<Array<{
    items: {id: string, type: NodeType, entity_type: string | null, label: string, description: string, dcc: { short_label: string, icon: string, label: string } | null}[],
    filter_count: number,
    exists: boolean,
  }>>`
    with results as (
      select *
      from websearch_to_tsquery('english', ${searchParams.q}) q, "node"
      where ${Prisma_join([Prisma.sql`q @@ "node"."searchable"`, filterClause], ' and ')}
      order by "node"."pagerank" desc
      offset ${offset}
      limit 100
    ), items as (
      select
        "results".id,
        "results".type,
        "results".entity_type,
        "results".label,
        "results".description,
        (
          select jsonb_build_object(
            'short_label', "dccs".short_label,
            'icon', "dccs".icon,
            'label', "dccs".label
          )
          from "dccs"
          where "dccs".id = "dcc_id"
        ) as dcc
      from results
      limit ${limit}
    ), filter_count as (
      select count(*)::int as count
      from "results"
    )
    select 
      (select exists (select 1 from "results" limit 1)) as "exists",
      (select coalesce(jsonb_agg(items.*), '[]'::jsonb) from items) as items,
      (select count from filter_count) as filter_count
    ;
  `)
  if (!results && error) {
    console.error(error)
    redirect(`/data?error=${encodeURIComponent(`An unexpected error occurred, please try tweaking your query`)}`)
  }
  if (results?.exists === false) redirect(`/data?error=${encodeURIComponent(`No results for '${searchParams.q ?? ''}'`)}`)
  return (
    <ListingPageLayout
      count={results?.filter_count}
      maxCount={100}
      filters={
        <>
          <span className="has-[.not-empty:empty]:hidden">
            <Typography className="subtitle1">Program</Typography>
            <span className="not-empty flex flex-col">
              <React.Suspense fallback={null}>
                <ProgramFilters q={searchParams.q ??''} />
              </React.Suspense>
            </span>
            <hr className="m-2" />
          </span>
          <span className="has-[.not-empty:empty]:hidden">
            <Typography className="subtitle1">Type</Typography>
            <span className="not-empty flex flex-col">
              <React.Suspense fallback={null}>
                <NodeTypeFilters q={searchParams.q ??''} />
              </React.Suspense>
              <React.Suspense fallback={null}>
                <EntityTypeFilters q={searchParams.q ??''} />
              </React.Suspense>
            </span>
          </span>
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
        count={(results?.filter_count??0) + offset}
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
    </ListingPageLayout>
  )
}
