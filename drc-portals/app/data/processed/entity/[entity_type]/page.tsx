import prisma from "@/lib/prisma/slow";
import { format_description, pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Metadata, ResolvingMetadata } from "next";
import { safeAsync } from "@/utils/safe";

type PageProps = { params: { entity_type: string }, searchParams: Record<string, string | string[] | undefined> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = pluralize(type_to_string('entity', decodeURIComponent(props.params.entity_type)))
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
      type: string,
      node: {
        slug: string,
        type: NodeType,
        label: string,
        description: string,
      },
    }[]
    count: number,
  }>>`
    with items as (
      select *
      from
        ${searchParams.q ? Prisma.sql`websearch_to_tsquery('english', ${searchParams.q}) q,` : Prisma.empty}
        "node"
      where "node"."type" = 'entity' and "node"."entity_type" = ${decodeURIComponent(props.params.entity_type)}
      ${searchParams.q ? Prisma.sql`
      and q @@ "node"."searchable"
      ` : Prisma.empty}
      order by "node"."pagerank" desc
      offset ${offset}
      limit 100
    ), paginated_items as (
      select
        "entity_node"."id",
        "entity_node"."type",
        jsonb_build_object(
          'slug', items."slug",
          'type', items."type",
          'label', items."label",
          'description', items."description"
        ) as node
      from items
      inner join "entity_node" on "items"."id" = "entity_node"."id"
      limit ${limit}
    )
    select
      (select coalesce(jsonb_agg(paginated_items.*), '[]') from paginated_items) as items,
      ${searchParams.q ? Prisma.sql`
        (select count(items.id)::int from items) as count
      ` : Prisma.sql`
        (select count("entity_node".id)::int from "entity_node" where "entity_node"."type" = ${decodeURIComponent(props.params.entity_type)}) as count
      `}
    ;
  `)
  if (error) console.error(error)
  return (
    <ListingPageLayout
      count={results?.count ?? 0}
    >
      <SearchablePagedTable
        label={`${type_to_string('entity', decodeURIComponent(props.params.entity_type))} (Entity Type)`}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={results?.count ?? 0}
        columns={[
          <>Label</>,
          <>Description</>,
        ]}
        rows={results?.items.map(item => [
          <LinkedTypedNode type={item.node.type} slug={item.node.slug} label={item.node.label} entity_type={decodeURIComponent(props.params.entity_type)} search={searchParams.q ?? ''} />,
          format_description(item.node.description),
        ]) ?? []}
      />
    </ListingPageLayout>
  )
}
