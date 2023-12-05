import prisma from "@/lib/prisma";
import { format_description, type_to_string, pluralize, useSanitizedSearchParams } from "@/app/data/processed/utils";
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Metadata, ResolvingMetadata } from 'next'
 
type PageProps = { searchParams: Record<string, string | string[] | undefined> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  return {
    title: `${(await parent).title?.absolute} | ${pluralize(type_to_string('entity', null))}`,
  }
}

const pageSize = 10

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
  const [results] = await prisma.$queryRaw<Array<{
    items: {
      id: string,
      type: string,
      node: {
        type: NodeType,
        label: string,
        description: string,
      },
    }[]
    count: number,
  }>>`
    with items as (
      select
        "entity_node"."id",
        "entity_node"."type",
        jsonb_build_object(
          'type', node."type",
          'label', node."label",
          'description', node."description"
        ) as node
      from "entity_node"
      inner join "node" on "node"."id" = "entity_node"."id"
      ${searchParams.q ? Prisma.sql`
        where "node"."searchable" @@ websearch_to_tsquery('english', ${searchParams.q})
        order by ts_rank_cd("node"."searchable", websearch_to_tsquery('english', ${searchParams.q})) desc
      ` : Prisma.sql`
        order by "entity_node"."id"
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
        (select count("entity_node".id)::int from "entity_node") as count
      `}
    ;
  `
  return (
    <ListingPageLayout
      count={results.count}
    >
      <SearchablePagedTable
        label={type_to_string('entity', null)}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        ps={Math.floor(results.count / pageSize) + 1}
        columns={[
          <>Label</>,
          <>Description</>,
        ]}
        rows={results.items.map(item => [
          <LinkedTypedNode type={item.node.type} id={item.id} label={item.node.label} entity_type={item.type} />,
          format_description(item.node.description),
        ])}
      />
    </ListingPageLayout>
  )
}
