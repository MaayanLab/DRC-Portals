import prisma from "@/lib/prisma/slow";
import { type_to_string, pluralize, useSanitizedSearchParams } from "@/app/data/processed/utils";
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Metadata, ResolvingMetadata } from 'next'
import { safeAsync } from "@/utils/safe";
 
type PageProps = { searchParams: Record<string, string | string[] | undefined> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = pluralize(type_to_string('entity', null))
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
      where "node"."type" = 'entity'
      ${searchParams.q ? Prisma.sql`
      and q @@ "node"."searchable"
      ` : Prisma.empty}
      order by "node"."pagerank" desc
      offset ${offset}
      limit 100
    ), paginated_items as (
      select
        "items"."id",
        "items"."entity_type",
        jsonb_build_object(
          'type', items."type",
          'label', items."label",
          'description', items."description"
        ) as node
      from "items"
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
  `)
  if (error) console.error(error)
  return (
    <ListingPageLayout
      count={results?.count ?? 0}
      maxCount={100}
    >
      <SearchablePagedTable
        label={`${type_to_string('entity', null)} (Entity Type)`}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={(results?.count??0)+offset}
        columns={[
          <>Label</>,
          <>Description</>,
        ]}
        rows={results?.items.map(item => [
          <LinkedTypedNode type={item.node.type} id={item.id} label={item.node.label} entity_type={item.type} search={searchParams.q ?? ''} />,
          <Description description={item.node.description} search={searchParams.q ?? ''} />,
        ]) ?? []}
      />
    </ListingPageLayout>
  )
}
