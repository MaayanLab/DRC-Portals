import prisma from "@/lib/prisma";
import { z } from 'zod';
import { format_description } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import SearchFilter from "./SearchFilter";
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";

const pageSize = 10

export default async function Page(props: { searchParams: Record<string, string> }) {
  const searchParams = z.object({
    q: z.union([
      z.array(z.string()).transform(qs => qs.join(' ')),
      z.string(),
      z.undefined(),
    ]),
    p: z.union([
      z.array(z.string()).transform(ps => +ps[ps.length-1]),
      z.string().transform(p => +p),
      z.undefined().transform(_ => 1),
    ]),
    t: z.union([
      z.array(z.string()),
      z.string().transform(ts => ts ? ts.split(',') : undefined),
      z.undefined(),
    ]).transform(ts => ts ? ts.map(t => {
      const [type, entity_type] = t.split(':')
      return { type, entity_type: entity_type ? entity_type : null }
    }) : undefined),
  }).parse(props.searchParams)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
  const [results] = searchParams.q ? await prisma.$queryRaw<Array<{
    items: {id: string, type: NodeType, entity_type: string | null, label: string, description: string, dcc: { short_label: string, icon: string, label: string } | null}[],
    count: number,
    type_counts: {type: NodeType, entity_type: string | null, count: number}[],
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
        ${Prisma.join(searchParams.t.map(t => Prisma.sql`
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
        ${Prisma.join(searchParams.t.map(t => Prisma.sql`
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
    )
    select 
      (select coalesce(jsonb_agg(items.*), '[]'::jsonb) from items) as items,
      (select count from total_count) as count,
      (select coalesce(jsonb_agg(type_counts.*), '[]'::jsonb) from type_counts) as type_counts
    ;
  ` : [undefined]
  return (
    <ListingPageLayout
      count={results?.count}
      filters={
        <>
          {results?.type_counts.filter(({ entity_type }) => !entity_type).map((type_count) =>
            <SearchFilter key={`${type_count.type}-${type_count.entity_type}`} type={type_count.type} entity_type={type_count.entity_type} count={type_count.count} />
          )}
          <hr className="m-2" />
          {results?.type_counts.filter(({ entity_type }) => !!entity_type).map((type_count) =>
            <SearchFilter key={`${type_count.type}-${type_count.entity_type}`} type={type_count.type} entity_type={type_count.entity_type} count={type_count.count} />
          )}
        </>
      }
    >
      <SearchablePagedTable
        q={searchParams.q ?? ''}
        p={searchParams.p}
        ps={Math.floor((results?.count ?? 1) / pageSize) + 1}
        columns={[
          <>&nbsp;</>,
          <>Label</>,
          <>Description</>,
        ]}
        rows={results?.items.map(item => [
          item.dcc?.icon ? <SearchablePagedTableCellIcon href={`/data/matrix/${item.dcc.short_label}`} src={item.dcc.icon} alt={item.dcc.label} />
            : item.type === 'entity' ? 
              item.entity_type === 'gene' ? <SearchablePagedTableCellIcon href={`/data/processed/${item.type}/${item.entity_type}`} src={GeneIcon} alt="Gene" />
              : item.entity_type === 'Drug' ? <SearchablePagedTableCellIcon href={`/data/processed/${item.type}/${item.entity_type}`} src={DrugIcon} alt="Drug" />
              : null
            : null,
          <LinkedTypedNode type={item.type} entity_type={item.entity_type} id={item.id} label={item.label} />,
          format_description(item.description),
        ]) ?? []}
      />
    </ListingPageLayout>
  )
}
