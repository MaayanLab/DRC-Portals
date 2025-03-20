import prisma from "@/lib/prisma/slow";
import {pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { LinkedTypedNode, SearchablePagedTableCellIcon, Description } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Metadata, ResolvingMetadata } from 'next'
import { safeAsync } from "@/utils/safe";

type PageProps = { searchParams: Record<string, string | string[] | undefined> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = pluralize(type_to_string('gene_set', ''))
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | ${title}`,
    keywords: [title, parentMetadata.keywords].join(', '),
  }
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const { data: [results] = [undefined], error } = await safeAsync(() => prisma.$queryRaw<Array<{
    items: {
      id: string,
      node: {
        slug: string,
        type: NodeType,
        label: string,
        description: string,
        dcc: {
          short_label: string,
          label: string,
          icon: string,
        } | null,
      },
    }[]
    count: number,
  }>>`
    with items as (
      select *
      from ${searchParams.q ? Prisma.sql`websearch_to_tsquery('english', ${searchParams.q}) q,` : Prisma.empty} "node"
      where "node"."type" = 'gene_set'
      ${searchParams.q ? Prisma.sql`
      and q @@ "node"."searchable"
      ` : Prisma.empty}
      order by "node"."pagerank" desc
      offset ${offset}
      limit 100
    ), paginated_items as (
      select
        "gene_set_node"."id",
        jsonb_build_object(
          'slug', items."slug",
          'type', items."type",
          'label', items."label",
          'description', items."description",
          'dcc', (
            select jsonb_build_object(
              'short_label', short_label,
              'label', label,
              'icon', icon
            )
            from "dccs"
            where "items"."dcc_id" = "dccs"."id"
          )
        ) as node
      from items
      inner join "gene_set_node" on "items"."id" = "gene_set_node"."id"
      limit ${limit}
    )
    select
      (select coalesce(jsonb_agg(paginated_items.*), '[]') from paginated_items) as items,
      ${searchParams.q ? Prisma.sql`
        (select count(items.id)::int from items) as count
      ` : Prisma.sql`
        (select count("gene_set_node".id)::int from "gene_set_node") as count
      `}
    ;
  `)
  if (error) console.error(error)
  return (
    <ListingPageLayout
      count={results?.count??0}
      maxCount={100}
    >
      <SearchablePagedTable
        label={`${type_to_string('gene_set', '')} (Entity Type)`}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={(results?.count??0)+offset}
        columns={[
          <>&nbsp;</>,
          <>Label</>,
          <>Description</>,
        ]}
        rows={results?.items.map(item => [
          item.node.dcc?.icon ? <SearchablePagedTableCellIcon href={`/data/processed/${item.node.type}/${encodeURIComponent(item.node.slug)}`} src={item.node.dcc.icon} alt={item.node.dcc.label} /> : null,
          <LinkedTypedNode type={item.node.type} slug={item.node.slug} label={item.node.label} search={searchParams.q ?? ''} />,
          <Description description={item.node.description} search={searchParams.q ?? ''} />,
        ]) ?? []}
      />
    </ListingPageLayout>
  )
}
