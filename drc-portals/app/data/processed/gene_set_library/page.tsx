import prisma from "@/lib/prisma";
import { format_description, useSanitizedSearchParams } from "@/app/data/processed/utils";
import SearchablePagedTable, { LinkedTypedNode, SearchablePagedTableCellIcon } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";

const pageSize = 10

export default async function Page(props: { searchParams: Record<string, string | string[] | undefined> }) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
  const [items, count] = await prisma.$transaction([
    prisma.geneSetLibraryNode.findMany({
      where: searchParams.q ? {
        node: {
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        }
      } : {},
      select: {
        _count: {
          select: {
            gene_sets: true,
            genes: true,
          }
        },
        id: true,
        node: {
          select: {
            label: true,
            description: true,
          }
        },
        dcc_asset: {
          select: {
            dcc: {
              select: {
                short_label: true,
                icon: true,
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
    }),
    prisma.geneSetLibraryNode.count({
      where: searchParams.q ? {
        node: {
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        }
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
          <></>,
          <>Label</>,
          <>Description</>,
        ]}
        rows={items.map(item => [
          item.dcc_asset.dcc?.icon ? <SearchablePagedTableCellIcon href={`/data/matrix/${item.dcc_asset.dcc.short_label}`} src={item.dcc_asset.dcc.icon} alt={item.dcc_asset.dcc.short_label ?? ''} /> : null,
          <LinkedTypedNode type="gene_set_library" id={item.id} label={item.node.label} />,
          format_description(item.node.description),
        ])}
      />
    </ListingPageLayout>
  )
}
