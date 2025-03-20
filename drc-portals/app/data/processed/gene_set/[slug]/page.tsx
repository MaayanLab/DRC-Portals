import React from 'react'
import prisma from "@/lib/prisma/slow"
import Link from "@/utils/link"
import { format_description, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import SearchablePagedTable, { LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import modules from "./modules";
import { notFound } from 'next/navigation';

type PageProps = { params: { slug: string }, searchParams: Record<string, string | string[] | undefined> }

const getItem = cache((slug: string) => prisma.node.findUnique({
  where: {
    type_entity_type_slug: { type: 'gene_set', entity_type: '', slug: decodeURIComponent(slug) },
  },
  select: {
    id: true,
    type: true,
    label: true,
    description: true,
    dcc: {
      select: {
        short_label: true,
        icon: true,
        label: true,
      },
    },
    gene_set: {
      select: {
        _count: {
          select: {
            genes: true,
          },
        },
        gene_set_library: {
          select: {
            id: true,
            node: {
              select: {
                slug: true,
                type: true,
                label: true,
                description: true,
              }
            },
          }
        },
      },
    },
  }
}))

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = type_to_string('gene_set', '')
  const item = await getItem(props.params.slug)
  if (!item?.gene_set) return {}
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
  const gene_set = await getItem(props.params.slug)
  if (!gene_set?.gene_set) return notFound()
  const genes = await prisma.geneSetNode.findUnique({
    where: {
      id: gene_set.id,
    },
    select: {
      _count: {
        select: {
          genes: searchParams.q ? {
            where: {
              entity: {
                node: {
                  OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
                }
              },
            }
          } : true,
        },
      },
      genes: {
        select: {
          id: true,
          entity: {
            select: {
              node: {
                select: {
                  slug: true,
                  type: true,
                  label: true,
                  description: true,
                },
              },
            },
          },
        },
        where: searchParams.q ? {
          entity: {
            node: {
              OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
            },
          },
        } : {},
        skip: offset,
        take: limit,
      },
    }
  })
  if (!genes) return notFound()
  return (
    <LandingPageLayout
      icon={gene_set.dcc?.icon ? { href: `/info/dcc/${gene_set.dcc.short_label}`, src: gene_set.dcc.icon, alt: gene_set.dcc.label } : undefined}
      title={gene_set.label}
      subtitle={type_to_string('gene_set', '')}
      description={format_description(gene_set.description)}
      metadata={[
        gene_set.dcc ? { label: 'Project', value: <Link href={`/info/dcc/${gene_set.dcc.short_label}`} className="underline cursor-pointer text-blue-600">{gene_set.dcc.label}</Link> } : null,
        { label: 'Gene Set Library', value: <Link href={`/data/processed/${gene_set.gene_set.gene_set_library.node.type}/${gene_set.gene_set.gene_set_library.node.slug}`} className="underline cursor-pointer text-blue-600">{gene_set.gene_set.gene_set_library.node.label}</Link> },
        { label: 'Genes', value: gene_set.gene_set._count.genes.toLocaleString() },
      ]}
    >
      <Grid container sx={{paddingTop: 5, paddingBottom: 5}}>
        <Grid item xs={12} sx={{marginBottom: 5}}>
          <Typography variant="h2" color="secondary">Analyze</Typography>
        </Grid>
        <Grid item xs={12} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules
            .filter(({ compatible }) => compatible(gene_set))
            .map(({ button: ModButton }, i) => <ModButton key={i} item={gene_set} />)}
        </Grid>
      </Grid>
      <SearchablePagedTable
        label="Genes"
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={genes._count.genes}
        columns={[
          <>Label</>,
          <>Description</>,
        ]}
        rows={genes.genes.map(gene => [
          <LinkedTypedNode type="entity" slug={gene.entity.node.slug} label={gene.entity.node.label} entity_type="gene" search={searchParams.q ?? ''} />,
          format_description(gene.entity.node.description),
        ])}
      />
    </LandingPageLayout>
  )
}
