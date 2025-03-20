import prisma from "@/lib/prisma/slow"
import Link from "@/utils/link"
import { format_description, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import SearchablePagedTable, { LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import modules from "./modules";

type PageProps = { params: { slug: string }, searchParams: Record<string, string | string[] | undefined> }

const getItem = cache((slug: string) => prisma.node.findUnique({
  where: { type_entity_type_slug: { type: 'gene_set_library', entity_type: '', slug: decodeURIComponent(slug) } },
  select: {
    id: true,
    label: true,
    description: true,
    dcc: {
      select: {
        short_label: true,
        label: true,
        icon: true,
      }
    },
    gene_set_library: {
      select: {
        dcc_asset_link: true,
        dcc_asset: {
          select: {
            fileAsset: {
              select: {
                filename: true,
              },
            },
          },
        },
        _count: {
          select: {
            gene_sets: true,
            genes: true,
          }
        },
      },
    },
  },
}))

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = type_to_string('gene_set_library', '')
  const item = await getItem(props.params.slug)
  if (!item?.gene_set_library) return {}
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | ${title} | ${item.label}`,
    description: item.description,
    keywords: [
      title,
      item.label,
      item.dcc?.short_label,
      parentMetadata.keywords,
    ].join(', '),
  }
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const library = await getItem(props.params.slug)
  if (!library?.gene_set_library) return notFound()
  const library_sets = await prisma.geneSetLibraryNode.findUnique({
    where: { id: library.id },
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
              slug: true,
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
      icon={library.dcc?.icon ? { href: `/info/dcc/${library.dcc.short_label}`, src: library.dcc.icon, alt: library.dcc.label } : undefined}
      title={library.label}
      subtitle={type_to_string('gene_set_library', '')}
      description={format_description(library.description)}
      metadata={[
        ...library.dcc?.label ? [
          { label: 'Project', value: <Link href={`/info/dcc/${library.dcc.short_label}`} className="underline cursor-pointer text-blue-600">{library.dcc.label}</Link> },
          { label: 'Asset', value:  <Link href={`/data/matrix/${library.dcc.short_label}#XMT`} className="underline cursor-pointer text-blue-600">Asset Page</Link> },
        ] : [],
        { label: 'Gene coverage', value: library.gene_set_library._count.genes.toLocaleString() },
        { label: 'Gene sets', value: library.gene_set_library._count.gene_sets.toLocaleString() },
        { label: 'Download', value: <Link href={library.gene_set_library.dcc_asset_link} className="underline cursor-pointer text-blue-600">{library.gene_set_library.dcc_asset_link}</Link> },
      ]}
    >
    <Grid container sx={{paddingTop: 5, paddingBottom: 5}}>
      <Grid item xs={12} sx={{marginBottom: 5}}>
        <Typography variant="h2" color="secondary">Analyze</Typography>
      </Grid>
      <Grid item xs={12} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules
          .filter(({ compatible }) => library.gene_set_library && compatible({ id: library.id, node: library, access_url: library.gene_set_library.dcc_asset_link, filename: library.gene_set_library.dcc_asset.fileAsset?.filename ?? `${library.label}.gmt` }))
          .map(({ button: ModButton }, i) => library.gene_set_library && <ModButton key={i} item={{ id: library.id, node: library, access_url: library.gene_set_library.dcc_asset_link, filename: library.gene_set_library.dcc_asset.fileAsset?.filename ?? `${library.label}.gmt` }} />)}
      </Grid>
    </Grid>
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
          <LinkedTypedNode type="gene_set" slug={gene_set.node.slug} label={gene_set.node.label} search={searchParams.q ?? ''} />,
          format_description(gene_set.node.description),
        ])}
      />
    </LandingPageLayout>
  )
}
