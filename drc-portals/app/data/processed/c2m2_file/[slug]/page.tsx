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
  where: { type_entity_type_slug: { type: 'c2m2_file', entity_type: '', slug: decodeURIComponent(slug) } },
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
    c2m2_file: {
      select: {
        persistent_id: true,
        access_url: true,
        size_in_bytes: true,
        file_format: true,
        assay_type: true,
        data_type: true,
      }
    }
  },
}))

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = type_to_string('c2m2_file', '')
  const item = await getItem(props.params.slug)
  if (!item?.c2m2_file) return {}
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
  const item = await getItem(props.params.slug)
  if (!item?.c2m2_file) return notFound()
  return (
    <>
      <LandingPageLayout
        icon={item.dcc?.icon ? { href: `/info/dcc/${item.dcc.short_label}`, src: item.dcc.icon, alt: item.dcc.label } : undefined}
        title={item.label}
        subtitle={type_to_string('c2m2_file', '')}
        description={format_description(item.description)}
        metadata={[
          item.dcc?.label ? {
            label: 'Project',
            value: <Link href={`/info/dcc/${item.dcc.short_label}`} className="underline cursor-pointer text-blue-600">{item.dcc.label}</Link>
          } : null,
          item.c2m2_file.persistent_id ? {
            label: 'Persistent ID',
            value: /^https?:\/\//.exec(item.c2m2_file.persistent_id) !== null ?
              <Link href={item.c2m2_file.persistent_id} className="underline cursor-pointer text-blue-600" target="_blank">{item.c2m2_file.persistent_id}</Link>
              : item.c2m2_file.persistent_id,
          } : null,
          process.env.PUBLIC_URL && item.c2m2_file.access_url ? { label: 'DRS', value: `${process.env.PUBLIC_URL.replace(/^https?/, 'drs')}/${item.id}` } : null,
          item.c2m2_file.size_in_bytes ? {
            label: 'Size in Bytes',
            value: item.c2m2_file.size_in_bytes.toLocaleString(),
          } : null,
          { label: 'File Format', value: item.c2m2_file.file_format },
          { label: 'Assay Type', value: item.c2m2_file.assay_type },
          { label: 'Data Type', value: item.c2m2_file.data_type },
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
            item.c2m2_file.assay_type,
            item.c2m2_file.data_type,
            item.c2m2_file.file_format,
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
          "distribution": item.c2m2_file.access_url ? [
            {
              "@type":"DataDownload",
              name: item.label,
              description: item.description,
              measurementMethod: item.c2m2_file.assay_type,
              contentUrl: item.c2m2_file.access_url,
              contentSize: item.c2m2_file.size_in_bytes ? BigInt(item.c2m2_file.size_in_bytes).toString() : undefined,
            },
          ] : undefined,
        }) }}
      />
    </>
  )
}
