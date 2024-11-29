import React from 'react'
import prisma from "@/lib/prisma/slow";
import { human_readable, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
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
import { Prisma_join } from '@/utils/prisma';
import ProgramFilters from './ProgramFilters';
import { safeAsync } from '@/utils/safe';
import NodeLinks from './NodeLinks';

export default async function Page(props: {
  search: string,
  type: string,
  entity_type: string | null,
  searchParams: Record<string, string>,
}) {
  const searchParams = useSanitizedSearchParams({ searchParams: { ...props.searchParams, q: props.search } })
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const dcc_filterable = {
    gene_set_library: true,
    gene_set: true,
    dcc_asset: true,
    c2m2_file: true,
  }[props.type]
  const { data: [results] = [], error } = searchParams.q ? await safeAsync(() => prisma.$queryRaw<Array<{
    items: {id: string, type: NodeType, entity_type: string | null, label: string, description: string, dcc: { short_label: string, icon: string, label: string } | null}[],
    count: number,
  }>>`
    with results as (
      select  "node".*
      from websearch_to_tsquery('english', ${searchParams.q}) q, "node"
      where ${Prisma_join([
        Prisma.sql`q @@ "node"."searchable"`,
        Prisma.sql`"node"."type" = ${props.type}::"NodeType"`,
        props.entity_type !== null ? Prisma.sql`"node"."entity_type" = ${props.entity_type}` : Prisma.empty,
        searchParams.et ? Prisma_join(searchParams.et.map(t => t.type === 'dcc' ? 
          dcc_filterable ? Prisma.sql`"node"."dcc_id" = ${t.entity_type}` : Prisma.empty
        : Prisma.sql`
        (
          "node"."type" = ${t.type}::"NodeType"
          ${t.entity_type ? Prisma.sql`
            and "node"."entity_type" = ${t.entity_type}
          ` : Prisma.empty}
        )
        `), ' or ') : Prisma.empty,
      ], ' and ')}
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
    ), total_count as (
      select count(*)::int as count
      from "results"
    )
    select 
      (select coalesce(jsonb_agg(items.*), '[]'::jsonb) from items) as items,
      (select count from total_count) as count
    ;
  `) : { error: undefined }
  if (error) console.error(error)
  return (
    <ListingPageLayout
      count={results?.count}
      maxCount={100}
      filters={{
        gene_set_library: true,
        gene_set: true,
        dcc_asset: true,
        c2m2_file: true,
      }[props.type] ?
        <span key={`${props.type}-${props.entity_type}`} className="has-[.not-empty:empty]:hidden">
          <Typography className="subtitle1">Program</Typography>
          <span className="not-empty flex flex-col">
            <React.Suspense fallback={null}>
              <ProgramFilters q={searchParams.q ??''} />
            </React.Suspense>
          </span>
        </span> : null
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
            <>Links</>,
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
              <NodeLinks item={item} />
            ]
          }) ?? []}
        />
      </React.Suspense>
    </ListingPageLayout>
  )
}