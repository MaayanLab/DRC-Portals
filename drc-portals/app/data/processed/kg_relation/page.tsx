import prisma from "@/lib/prisma";
import { pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import SearchablePagedTable, { LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import { Metadata, ResolvingMetadata } from 'next'

type PageProps = { searchParams: Record<string, string | string[] | undefined> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  return {
    title: `${(await parent).title?.absolute} | ${pluralize(type_to_string('kg_relation', null))}`,
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
        label={type_to_string('kg_relation', null)}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={count}
        columns={[
          <>Label</>,
          <>Description</>,
        ]}
        rows={items.map(item => [
          <LinkedTypedNode type={item.node.type} id={item.id} label={item.node.label} />,
          <Description description={item.node.description}/>,
        ])}
      />
    </ListingPageLayout>
  )
}
