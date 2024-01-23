import prisma from "@/lib/prisma";
import { pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import SearchablePagedTable, { LinkedTypedNode, SearchablePagedTableCellIcon, Description } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Metadata, ResolvingMetadata } from 'next'

type PageProps = { searchParams: Record<string, string | string[] | undefined> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  return {
    title: `${(await parent).title?.absolute} | ${pluralize(type_to_string('gene_set_library', null))}`,
  }
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
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
        label={`${type_to_string('gene_set_library', null)} (Entity Type)`}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={count}
        columns={[
          <></>,
          <>Label</>,
          <>Description</>,
        ]}
        rows={items.map(item => [
          item.dcc_asset.dcc?.icon ? <SearchablePagedTableCellIcon href={`/info/dcc/${item.dcc_asset.dcc.short_label}`} src={item.dcc_asset.dcc.icon} alt={item.dcc_asset.dcc.short_label ?? ''} /> : null,
          <LinkedTypedNode type="gene_set_library" id={item.id} label={item.node.label} search={searchParams.q ?? ''} />,
          <Description description={item.node.description} search={searchParams.q ?? ''} />,
        ])}
      />
    </ListingPageLayout>
  )
}
