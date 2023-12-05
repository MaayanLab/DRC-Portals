import prisma from "@/lib/prisma";
import { format_description, pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import { NodeType, Prisma } from "@prisma/client";
import ListingPageLayout from "../ListingPageLayout";
import SearchablePagedTable, { LinkedTypedNode, SearchablePagedTableCellIcon } from "@/app/data/processed/SearchablePagedTable";
import { Metadata, ResolvingMetadata } from 'next'

type PageProps = { searchParams: Record<string, string | string[] | undefined> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  return {
    title: `${(await parent).title?.absolute} | ${pluralize(type_to_string('c2m2_file', null))}`,
  }
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const [results] = await prisma.$queryRaw<Array<{
    items: {
      id: string,
      data_type: string,
      assay_type: string,
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
        "c2m2_file_node"."id",
        "c2m2_file_node"."data_type",
        "c2m2_file_node"."assay_type",
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
      from "c2m2_file_node"
      inner join "node" on "node"."id" = "c2m2_file_node"."id"
      ${searchParams.q ? Prisma.sql`
        where "node"."searchable" @@ websearch_to_tsquery('english', ${searchParams.q})
        order by ts_rank_cd("node"."searchable", websearch_to_tsquery('english', ${searchParams.q})) desc
      ` : Prisma.sql`
        order by "c2m2_file_node"."id"
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
        (select count("c2m2_file_node".id)::int from "c2m2_file_node") as count
      `}
    ;
  `
  return (
    <ListingPageLayout
      count={results.count}
    >
      <SearchablePagedTable
        label={type_to_string('c2m2_file', null)}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={results.count}
        columns={[
          <>&nbsp;</>,
          <>Label</>,
          <>Description</>,
          <>Data Type</>,
          <>Assay Type</>,
        ]}
        rows={results.items.map(item => [
          item.node.dcc?.icon ? <SearchablePagedTableCellIcon href={`/data/matrix/${item.node.dcc.short_label}`} src={item.node.dcc.icon} alt={item.node.dcc.label} /> : null,
          <LinkedTypedNode type={item.node.type} id={item.id} label={item.node.label} />,
          format_description(item.node.description),
          item.data_type,
          item.assay_type,
        ])}
      />
    </ListingPageLayout>
  )
}
