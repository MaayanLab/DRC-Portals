import prisma from "@/lib/prisma"
import Link from "next/link"
import { format_description } from "@/app/data/processed/utils";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";

export default async function Page(props: { params: { id: string } }) {
  const item = await prisma.c2M2FileNode.findUniqueOrThrow({
    where: { id: props.params.id },
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
  })
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
