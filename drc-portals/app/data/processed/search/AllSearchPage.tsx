import React from "react";
import prisma from "@/lib/prisma/slow";
import { type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import KGNode from '@/public/img/icons/KGNode.png'
import KGEdge from '@/public/img/icons/KGEdge.png'
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Button, Typography } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "@/utils/link";
import ProgramFilters from "./ProgramFilters";


/**
 * Like Prisma.join -- but filters out Prisma.empty, and supports empty/singular lists
 */
function Prisma_join<T>(L: T[], sep: string) {
  L = L.filter(el => el !== Prisma.empty)
  return L.length === 0 ? Prisma.empty : L.length === 1 ? L[0] : Prisma.join(L, sep)
}

export default async function Page(props: { search: string, type: string, entity_type: string | null, searchParams: Record<string, string> }) {
  const searchParams = useSanitizedSearchParams({ searchParams: {...props.searchParams, q: props.search } })
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const filterClause = searchParams.et ? Prisma_join([
    // when DCC is available, we'll filter by entities per-dcc
    searchParams.et.some(t => t.type === 'dcc')
      ? Prisma_join(
        searchParams.et.filter(t => t.type === 'dcc').map(t => Prisma_join([
          Prisma.sql`"node"."dcc_id" = ${t.entity_type}`,
          Prisma_join(searchParams.et ? searchParams.et.filter(t => t.type !== 'dcc' && t.entity_type === null).map(t => Prisma.sql`
            (
              "node"."type" = ${t.type}::"NodeType"
            )
            `) : [], ' or '),
        ], ' and ')),
        ' or '
      )
      // otherwise, we filter by entity type independent of dcc
      : Prisma_join(searchParams.et.filter(t => t.type !== 'dcc' && t.entity_type === null).map(t => Prisma.sql`
        (
          "node"."type" = ${t.type}::"NodeType"
        )
        `), ' or '),
    // entities not associated with a DCC should be independently filterable
    Prisma_join(searchParams.et.filter(t => t.entity_type !== null).map(t => Prisma.sql`
      (
        "node"."type" = 'entity'::"NodeType"
        ${t.entity_type ? Prisma.sql`
          and "node"."entity_type" = ${t.entity_type}
        ` : Prisma.empty}
      )
    `), ' or '),
  ], ' or ') : Prisma.empty
  const [results] = searchParams.q ? await prisma.$queryRaw<Array<{
    items: {id: string, type: NodeType, entity_type: string | null, label: string, description: string, dcc: { short_label: string, icon: string, label: string } | null}[],
    filter_count: number,
    total_count: number,
    dcc_counts: {id: string, short_label: string, count: number}[],
  }>>`
    with results as (
      select "node".*
      from websearch_to_tsquery('english', ${searchParams.q}) q, "node"
      where ${Prisma_join([Prisma.sql`q @@ "node"."searchable"`, filterClause], ' and ')}
      order by "node"."pagerank" desc
      offset ${offset}
      limit 100
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
      limit ${limit}
    ), filter_count as (
      select count(*)::int as count
      from "results"
    )
    select 
      (select coalesce(jsonb_agg(items.*), '[]'::jsonb) from items) as items,
      (select count from filter_count) as filter_count
    ;
  ` : [undefined]
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
        count={(results?.filter_count??0)+offset}
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
