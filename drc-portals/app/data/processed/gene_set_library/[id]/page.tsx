import prisma from "@/lib/prisma"
import Link from "next/link"
import { format_description, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import SearchablePagedTable, { LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

type PageProps = { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }

const getItem = cache((id: string) => prisma.geneSetLibraryNode.findUnique({
  where: { id },
  select: {
    dcc_asset_link: true,
    _count: {
      select: {
        gene_sets: true,
        genes: true,
      }
    },
    node: {
      select: {
        label: true,
        description: true,
        dcc: {
          select: {
            short_label: true,
            label: true,
            icon: true,
          }
        },
      }
    },
  },
}))

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = type_to_string('gene_set_library', null)
  const item = await getItem(props.params.id)
  if (!item) return {}
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | ${title} | ${item.node.label}`,
    description: item.node.description,
    keywords: [
      title,
      item.node.label,
      item.node.dcc?.short_label,
      parentMetadata.keywords,
    ].join(', '),
  }
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const library = await getItem(props.params.id)
  if (!library) return notFound()
  const library_sets = await prisma.geneSetLibraryNode.findUnique({
    where: { id: props.params.id },
    select: {
      _count: {
        select: {
          gene_sets: searchParams.q ? {
            where: {
              node: {
                OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
              }
            }
          } : true,
        },
      },
      gene_sets: {
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
        where: searchParams.q ? {
          node: {
            OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
          }
        } : {},
        skip: offset,
        take: limit,
        orderBy: {
          node: {
            pagerank: 'desc',
          }
        },
      }
    },
  })
  if (!library_sets) return notFound()
  return (
    <LandingPageLayout
      icon={library.node.dcc?.icon ? { href: `/info/dcc/${library.node.dcc.short_label}`, src: library.node.dcc.icon, alt: library.node.dcc.label } : undefined}
      title={library.node.label}
      subtitle={type_to_string('gene_set_library', null)}
      description={format_description(library.node.description)}
      metadata={[
        ...library.node.dcc?.label ? [
          { label: 'Project', value: <Link href={`/info/dcc/${library.node.dcc.short_label}`} className="underline cursor-pointer text-blue-600">{library.node.dcc.label}</Link> },
          { label: 'Asset', value:  <Link href={`/data/matrix/${library.node.dcc.short_label}#XMT`} className="underline cursor-pointer text-blue-600">Asset Page</Link> },
        ] : [],
        { label: 'Gene coverage', value: library._count.genes.toLocaleString() },
        { label: 'Gene sets', value: library._count.gene_sets.toLocaleString() },
        { label: 'Download', value: <Link href={library.dcc_asset_link} className="underline cursor-pointer text-blue-600">{library.dcc_asset_link}</Link> },
      ]}
    >
      <SearchablePagedTable
        label="Gene sets"
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={library_sets._count.gene_sets}
        columns={[
          <>Label</>,
          <>Description</>,
        ]}
        rows={library_sets.gene_sets.map(gene_set => [
          <LinkedTypedNode type="gene_set" id={gene_set.id} label={gene_set.node.label} search={searchParams.q ?? ''} />,
          format_description(gene_set.node.description),
        ])}
      />
    </LandingPageLayout>
  )
}
