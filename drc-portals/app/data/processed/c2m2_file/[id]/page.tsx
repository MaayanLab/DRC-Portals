import prisma from "@/lib/prisma/slow"
import Link from "@/utils/link"
import { format_description, type_to_string } from "@/app/data/processed/utils";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import { Metadata, ResolvingMetadata } from 'next'
import { cache } from "react";
import { notFound } from "next/navigation";
import { metadata } from "@/app/data/layout";

type PageProps = { params: { id: string } }

const getItem = cache((id: string) => prisma.c2M2FileNode.findUnique({
  where: { id },
  select: {
    persistent_id: true,
    access_url: true,
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
            homepage: true,
          }
        },
      },
    }
  },
}))

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = type_to_string('c2m2_file', null)
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
  const item = await getItem(props.params.id)
  if (!item) return notFound()
  return (
    <>
      <LandingPageLayout
        icon={item.node.dcc?.icon ? { href: `/info/dcc/${item.node.dcc.short_label}`, src: item.node.dcc.icon, alt: item.node.dcc.label } : undefined}
        title={item.node.label}
        subtitle={type_to_string('c2m2_file', null)}
        description={format_description(item.node.description)}
        metadata={[
          item.node.dcc?.label ? {
            label: 'Project',
            value: <Link href={`/info/dcc/${item.node.dcc.short_label}`} className="underline cursor-pointer text-blue-600">{item.node.dcc.label}</Link>
          } : null,
          item.persistent_id ? {
            label: 'Persistent ID',
            value: /^https?:\/\//.exec(item.persistent_id) !== null ?
              <Link href={item.persistent_id} className="underline cursor-pointer text-blue-600" target="_blank">{item.persistent_id}</Link>
              : item.persistent_id,
          } : null,
          process.env.PUBLIC_URL && item.access_url ? { label: 'DRS', value: `${process.env.PUBLIC_URL.replace(/^https?/, 'drs')}/${props.params.id}` } : null,
          item.size_in_bytes ? {
            label: 'Size in Bytes',
            value: item.size_in_bytes.toLocaleString(),
          } : null,
          { label: 'File Format', value: item.file_format },
          { label: 'Assay Type', value: item.assay_type },
          { label: 'Data Type', value: item.data_type },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context":"http://schema.org",
          "@type":"Dataset",
          "name":item.node.label,
          "description":item.node.description,
          "keywords":[
            metadata.keywords,
            item.node.dcc?.short_label,
            item.assay_type,
            item.data_type,
            item.file_format,
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
          "creator": item.node.dcc ? {
            "@type": "Organization",
            "name": item.node.dcc.label,
            "url": item.node.dcc.homepage || `https://info.cfde.cloud/dcc/${item.node.dcc.short_label}`
          } : undefined,
          "distribution": item.access_url ? [
            {
              "@type":"DataDownload",
              name: item.node.label,
              description: item.node.description,
              measurementMethod: item.assay_type,
              contentUrl: item.access_url,
              contentSize: item.size_in_bytes ? BigInt(item.size_in_bytes).toString() : undefined,
            },
          ] : undefined,
        }) }}
      />
    </>
  )
}
