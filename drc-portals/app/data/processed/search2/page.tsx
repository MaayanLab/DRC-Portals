import prisma from "@/lib/prisma/slow";
import { useSanitizedSearchParams } from "@/app/data/processed/utils"
import { NodeType, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import SearchPage from './SearchPage'
import SearchTabs from "./SearchTab";
import { safeAsync } from "@/utils/safe";

type PageProps = { searchParams: Record<string, string> }

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return {
    title: `Search ${props.searchParams.q ?? ''}`,
  }
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  if (!searchParams.q) redirect('/data')
  const { data: [results] = [undefined], error } = await safeAsync(() => prisma.$queryRaw<Array<{
    count: number,
    type_counts: {type: NodeType, entity_type: string | null, count: number}[],
    dcc_counts: {id: string, short_label: string, count: number}[],
  }>>`
    with results as (
      select
        "node".*,
        "entity_node"."type" as "entity_type"
      from "node"
      left join "entity_node" on "entity_node"."id" = "node"."id"
      where "node"."searchable" @@ websearch_to_tsquery('english', ${searchParams.q})
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
      (select count from total_count) as count,
      (select coalesce(jsonb_agg(type_counts.*), '[]'::jsonb) from type_counts) as type_counts,
      (select coalesce(jsonb_agg(dcc_counts.*), '[]'::jsonb) from dcc_counts) as dcc_counts
    ;
  `)
  if (!results && error) {
    console.error(error)
    redirect(`/data?error=${encodeURIComponent(`An unexpected error occurred, please try tweaking your query`)}`)
  }
  if (results?.count === 0) redirect(`/data?error=${encodeURIComponent(`No results for '${searchParams.q ?? ''}'`)}`)
  results?.type_counts.sort((a, b) => b.count - a.count)
  const s_type = searchParams.s?.type !== undefined ? searchParams.s?.type : results?.type_counts[0]?.type ?? ''
  const s_entity_type = searchParams.s?.entity_type !== undefined ? searchParams.s?.entity_type : results?.type_counts[0]?.entity_type ?? ''
  return (
    <>
      <SearchTabs
        type_counts={results?.type_counts ?? []}
        defaultSType={s_type}
        defaultSEntityType={s_entity_type}
      />
      <SearchPage searchParams={props.searchParams} type={s_type} entity_type={s_entity_type} />
    </>
  )
}
