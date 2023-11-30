import prisma from "@/lib/prisma";
import { format_description, useSanitizedSearchParams } from "@/app/data/processed/utils";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import SearchablePagedTable, { LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";

const pageSize = 10

export default async function Page(props: { searchParams: Record<string, string | string[] | undefined> }) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
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
    prisma.node.count({
      where: searchParams.q ? {
        OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
      } : {},
    }),
  ])
  return (
    <ListingPageLayout
      count={count}
    >
      <SearchablePagedTable
        q={searchParams.q ?? ''}
        p={searchParams.p}
        ps={Math.floor(count / pageSize) + 1}
        columns={[
          <>Label</>,
          <>Description</>,
        ]}
        rows={items.map(item => [
          <LinkedTypedNode type={item.node.type} id={item.id} label={item.node.label} />,
          format_description(item.node.description),
        ])}
      />
    </ListingPageLayout>
  )
}
