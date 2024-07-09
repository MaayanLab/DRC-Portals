import prisma from "@/lib/prisma";
import { human_readable, pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import SearchablePagedTable, { LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import { Metadata, ResolvingMetadata } from 'next'

type PageProps = { searchParams: Record<string, string | string[] | undefined> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = pluralize(type_to_string('kg_relation', null))
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
  const [items, count] = await prisma.$transaction([
    prisma.kGRelationNode.findMany({
      where: searchParams.q ? {
        node: {
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        },
      } : {},
      select: {
        id: true,
        node: {
          select: {
            type: true,
            label: true,
            description: true,
          },
        },
      },
      orderBy: {
        node: {
          pagerank: 'desc',
        },
      },
      skip: offset,
      take: limit,
    }),
    prisma.kGRelationNode.count({
      where: searchParams.q ? {
        node: {
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        },
      } : {},
    }),
  ])
  return (
    <ListingPageLayout
      count={count}
    >
      <SearchablePagedTable
        label={`${type_to_string('kg_relation', null)} (Entity Type)`}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={count}
        columns={[
          <>Label</>,
          <>Description</>,
        ]}
        rows={items.map(item => [
          <LinkedTypedNode type={item.node.type} id={item.id} label={human_readable(item.node.label)} search={searchParams.q ?? ''} />,
          <Description description={item.node.description} search={searchParams.q ?? ''} />,
        ])}
      />
    </ListingPageLayout>
  )
}
