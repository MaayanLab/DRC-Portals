import prisma from "@/lib/prisma"
import Link from "next/link"
import { format_description, type_to_string } from "@/app/data/processed/utils";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import { Metadata, ResolvingMetadata } from 'next'
import { cache } from "react";

type PageProps = { params: { id: string } }

const getItem = cache((id: string) => prisma.dCCAssetNode.findUniqueOrThrow({
  where: { id },
  select: {
    dcc_asset: {
      select: {
        link: true,
        lastmodified: true,
        fileAsset: {
          select: {
            filetype: true,
            size: true,
          },
        },
      },
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
      },
    }
  },
}))

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = type_to_string('dcc_asset', null)
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

export default async function Page(props: { params: { id: string } }) {
  const item = await getItem(props.params.id)
  return (
    <LandingPageLayout
      icon={item.node.dcc?.icon ? { href: `/info/dcc/${item.node.dcc.short_label}`, src: item.node.dcc.icon, alt: item.node.dcc.label } : undefined}
      title={item.node.label}
      subtitle={type_to_string('dcc_asset', null)}
      description={format_description(item.node.description)}
      metadata={[
        ...(item.node.dcc?.label ? [
          { label: 'Project', value: <Link href={`/info/dcc/${item.node.dcc.short_label}`} className="underline cursor-pointer text-blue-600">{item.node.dcc.label}</Link> },
          item.dcc_asset.fileAsset ? { label: 'Asset', value:  <Link href={`/data/matrix/${item.node.dcc.short_label}#${item.dcc_asset.fileAsset.filetype}`} className="underline cursor-pointer text-blue-600">Asset Page</Link> } : null,
         ] : []),
        { label: 'Link', value: <Link href={item.dcc_asset.link} className="underline cursor-pointer text-blue-600">{item.dcc_asset.link}</Link> },
        process.env.PUBLIC_URL ? { label: 'DRS', value: `${process.env.PUBLIC_URL.replace(/^https?/, 'drs')}/${props.params.id}` } : null,
        item.dcc_asset.fileAsset ? { label: 'File Type', value: item.dcc_asset.fileAsset.filetype } : null,
        item.dcc_asset.fileAsset ? { label: 'Size in Bytes', value: item.dcc_asset.fileAsset.size?.toLocaleString() ?? 'unknown' } : null,
        { label: 'Last Modified', value: item.dcc_asset.lastmodified.toLocaleDateString() },
      ]}
    />
  )
}
