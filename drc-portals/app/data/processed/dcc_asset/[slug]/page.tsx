import prisma from "@/lib/prisma/slow"
import Link from "@/utils/link"
import { format_description, type_to_string } from "@/app/data/processed/utils";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import { Metadata, ResolvingMetadata } from 'next'
import { cache } from "react";
import { notFound } from "next/navigation";
import { metadata } from "@/app/data/layout";

type PageProps = { params: { slug: string } }

const getItem = cache((slug: string) => prisma.node.findUnique({
  where: { type_entity_type_slug: { type: 'dcc_asset', entity_type: '', slug: decodeURIComponent(slug) } },
  select: {
    id: true,
    label: true,
    description: true,
    dcc: {
      select: {
        short_label: true,
        label: true,
        icon: true,
        homepage: true,
      }
    },
    dcc_asset: {
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
          }
        }
      },
    },
  },
}))

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = type_to_string('dcc_asset', '')
  const item = await getItem(props.params.slug)
  if (!item?.dcc_asset) return {}
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

export default async function Page(props: { params: { slug: string } }) {
  const item = await getItem(props.params.slug)
  if (!item?.dcc_asset) return notFound()
  return (
    <>
      <LandingPageLayout
        icon={item.dcc?.icon ? { href: `/info/dcc/${item.dcc.short_label}`, src: item.dcc.icon, alt: item.dcc.label } : undefined}
        title={item.label}
        subtitle={type_to_string('dcc_asset', '')}
        description={format_description(item.description)}
        metadata={[
          ...(item.dcc?.label ? [
            { label: 'Project', value: <Link href={`/info/dcc/${item.dcc.short_label}`} className="underline cursor-pointer text-blue-600">{item.dcc.label}</Link> },
            item.dcc_asset.dcc_asset.fileAsset ? { label: 'Asset', value:  <Link href={`/data/matrix/${item.dcc.short_label}#${item.dcc_asset.dcc_asset.fileAsset.filetype}`} className="underline cursor-pointer text-blue-600">Asset Page</Link> } : null,
          ] : []),
          { label: 'Link', value: <Link href={item.dcc_asset.dcc_asset.link} className="underline cursor-pointer text-blue-600" target="_blank">{item.dcc_asset.dcc_asset.link}</Link> },
          process.env.PUBLIC_URL ? { label: 'DRS', value: `${process.env.PUBLIC_URL.replace(/^https?/, 'drs')}/${item.id}` } : null,
          item.dcc_asset.dcc_asset.fileAsset ? { label: 'File Type', value: item.dcc_asset.dcc_asset.fileAsset.filetype } : null,
          item.dcc_asset.dcc_asset.fileAsset ? { label: 'Size in Bytes', value: item.dcc_asset.dcc_asset.fileAsset.size?.toLocaleString() ?? 'unknown' } : null,
          { label: 'Last Modified', value: item.dcc_asset.dcc_asset.lastmodified.toLocaleDateString() },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context":"http://schema.org",
          "@type":"Dataset",
          "name":item.label,
          "description":item.description,
          "keywords":[
            metadata.keywords,
            item.dcc?.short_label,
            item.dcc_asset.dcc_asset.fileAsset?.filetype,
          ].join(', '),
          "includedInDataCatalog": {
            "@type": "DataCatalog",
            "name": "Common Fund Data Ecosystem (CFDE) Data Portal",
            "url": "https://data.cfde.cloud"
          },
          "funder":{
             "@type": "Organization",
             "sameAs": "https://commonfund.nih.gov/dataecosystem",
             "name": "National Institute of Health (NIH) Common Fund Data Ecosystem (CFDE)"
          },
          "provider":{
            "@type":"Organization",
            "name":"Common Fund Data Ecosystem (CFDE) Data Resource Center (DRC)",
            "url":"https://info.cfde.cloud"
          },
          "creator": item.dcc ? {
            "@type": "Organization",
            "name": item.dcc.label,
            "url": item.dcc.homepage || `https://info.cfde.cloud/dcc/${item.dcc.short_label}`
          } : undefined,
          "distribution":item.dcc_asset.dcc_asset.fileAsset ? [
            {
              "@type":"DataDownload",
              name: item.label,
              description: item.description,
              measurementMethod: item.dcc_asset.dcc_asset.fileAsset.filetype,
              uploadDate: item.dcc_asset.dcc_asset.lastmodified.toISOString(),
              contentUrl: item.dcc_asset.dcc_asset.link,
              contentSize: item.dcc_asset.dcc_asset.fileAsset?.size ? BigInt(item.dcc_asset.dcc_asset.fileAsset.size).toString() : undefined,
            },
          ] : undefined,
        }) }}
      />
    </>
  )
}
