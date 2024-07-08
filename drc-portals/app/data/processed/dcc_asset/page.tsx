import prisma from "@/lib/prisma";
import { pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import { NodeType, Prisma } from "@prisma/client";
import ListingPageLayout from "../ListingPageLayout";
import SearchablePagedTable, { LinkedTypedNode, SearchablePagedTableCellIcon, Description} from "@/app/data/processed/SearchablePagedTable";
import { Metadata, ResolvingMetadata } from 'next'
import { safeAsync } from "@/utils/safe";

type PageProps = { searchParams: Record<string, string | string[] | undefined> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = pluralize(type_to_string('dcc_asset', null))
  const parentMetadata = await parent
  return {
    title: `${(await parent).title?.absolute} | ${title}`,
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
        type: NodeType,
        label: string,
        description: string,
        dcc: {
          label: string,
          short_label: string,
          icon: string,
        } | null,
      },
    }[]
    count: number,
  }>>`
    with items as (
      select
        "dcc_asset_node"."id",
        jsonb_build_object(
          'type', node."type",
          'label', node."label",
          'description', node."description",
          'dcc', (
            select jsonb_build_object(
              'short_label', short_label,
              'label', label,
              'icon', icon
            )
            from "dccs"
            where "node"."dcc_id" = "dccs"."id"
          )
        ) as node
      from "dcc_asset_node"
      inner join "node" on "node"."id" = "dcc_asset_node"."id"
      ${searchParams.q ? Prisma.sql`
        where "node"."searchable" @@ websearch_to_tsquery('english', ${searchParams.q})
        order by ts_rank_cd("node"."searchable", websearch_to_tsquery('english', ${searchParams.q})) desc
      ` : Prisma.sql`
        order by "dcc_asset_node"."id"
      `}
    ), paginated_items as (
      select *
      from items
      offset ${offset}
      limit ${limit}
    )
    select
      (select coalesce(jsonb_agg(paginated_items.*), '[]') from paginated_items) as items,
      ${searchParams.q ? Prisma.sql`
        (select count(items.id)::int from items) as count
      ` : Prisma.sql`
        (select count("dcc_asset_node".id)::int from "dcc_asset_node") as count
      `}
    ;
  `)
  if (error) console.error(error)
  return (
    <ListingPageLayout
      count={results?.count ?? 0}
    >
      <SearchablePagedTable
        label={`${type_to_string('dcc_asset', null)} (Entity Type)`}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={results?.count ?? 0}
        columns={[
          <>&nbsp;</>,
          <>Label</>,
          <>Description</>,
        ]}
        rows={results?.items.map(item => [
          item.node.dcc?.icon ? <SearchablePagedTableCellIcon href={`/data/processed/${item.node.type}/${item.id}`} src={item.node.dcc.icon} alt={item.node.dcc.label} /> : null,
          <LinkedTypedNode type={item.node.type} id={item.id} label={item.node.label} search={searchParams.q ?? ''} />,
          <Description description={item.node.description} search={searchParams.q ?? ''} />,
        ]) ?? []}
      />
    </ListingPageLayout>
  )
}
