import prisma from "@/lib/prisma"
import Link from "next/link"
import { format_description, type_to_string } from "@/app/data/processed/utils";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import { Metadata, ResolvingMetadata } from 'next'
import { cache } from "react";

type PageProps = { params: { id: string } }

const getItem = cache((id: string) => prisma.c2M2FileNode.findUniqueOrThrow({
  where: { id },
  select: {
    persistent_id: true,
    size_in_bytes: true,
    file_format: true,
    assay_type: true,
    data_type: true,
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
      },
    }
  },
}))

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const item = await getItem(props.params.id)
  return {
    title: `${(await parent).title?.absolute} | ${type_to_string('c2m2_file', null)} | ${item.node.label}`,
    description: item.node.description,
  }
}

export default async function Page(props: PageProps) {
  const item = await getItem(props.params.id)
  return (
    <LandingPageLayout
      icon={item.node.dcc?.icon ? { href: `/data/matrix/${item.node.dcc.short_label}`, src: item.node.dcc.icon, alt: item.node.dcc.label } : undefined}
      label={item.node.label}
      description={format_description(item.node.description)}
      metadata={[
        item.node.dcc?.label ? { label: 'Project', value: <Link href={`/data/matrix/${item.node.dcc.short_label}`} className="underline cursor-pointer">{item.node.dcc.label}</Link> } : null,
        { label: 'Persistent ID', value: item.persistent_id },
        { label: 'Size in Bytes', value: item.size_in_bytes?.toString() ?? 'unknown' },
        { label: 'File Format', value: item.file_format },
        { label: 'Assay Type', value: item.assay_type },
        { label: 'Data Type', value: item.data_type },
      ]}
    />
  )
}
