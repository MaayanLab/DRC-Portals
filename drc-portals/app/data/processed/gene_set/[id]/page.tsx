import React from 'react'
import prisma from "@/lib/prisma"
import Link from "next/link"
import { format_description, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import SearchablePagedTable, { LinkedTypedNode } from "@/app/data/processed/SearchablePagedTable";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import modules from "./modules";

type PageProps = { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }

const getItem = cache((id: string) => prisma.geneSetNode.findUniqueOrThrow({
  where: {
    id,
  },
  select: {
    id: true, 
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
            type: true,
            label: true,
            description: true,
          }
        },
      }
    },
    node: {
      select: {
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
      }
    },
  }
}))

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = type_to_string('gene_set', null)
  const item = await getItem(props.params.id)
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
  const offset = (searchParams.p - 1) * searchParams.r
  const limit = searchParams.r
  const gene_set = await getItem(props.params.id)
  const genes = await prisma.geneSetNode.findUniqueOrThrow({
    where: {
      id: props.params.id,
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
  return (
    <LandingPageLayout
      icon={gene_set.node.dcc?.icon ? { href: `/info/dcc/${gene_set.node.dcc.short_label}`, src: gene_set.node.dcc.icon, alt: gene_set.node.dcc.label } : undefined}
      title={gene_set.node.label}
      subtitle={type_to_string('gene_set', null)}
      description={format_description(gene_set.node.description)}
      metadata={[
        gene_set.node.dcc ? { label: 'Project', value: <Link href={`/info/dcc/${gene_set.node.dcc.short_label}`} className="underline cursor-pointer text-blue-600">{gene_set.node.dcc.label}</Link> } : null,
        { label: 'Gene Set Library', value: <Link href={`/data/processed/${gene_set.gene_set_library.node.type}/${gene_set.gene_set_library.id}`} className="underline cursor-pointer text-blue-600">{gene_set.gene_set_library.node.label}</Link> },
        { label: 'Genes', value: gene_set._count.genes.toLocaleString() },
      ]}
    >
      <Grid container sx={{paddingTop: 5, paddingBottom: 5}}>
        <Grid item xs={12} sx={{marginBottom: 5}}>
          <Typography variant="h2" color="secondary">Analyze</Typography>
        </Grid>
        <Grid item xs={12} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules
            .filter(({ compatible }) => compatible({ id: props.params.id, node: gene_set.node }))
            .map(({ button: ModButton }, i) => <ModButton item={{ id: props.params.id, node: gene_set.node }} />)}
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
          <LinkedTypedNode type="entity" id={gene.id} label={gene.entity.node.label} entity_type="gene" search={searchParams.q ?? ''} />,
          format_description(gene.entity.node.description),
        ])}
      />
    </LandingPageLayout>
  )
}
