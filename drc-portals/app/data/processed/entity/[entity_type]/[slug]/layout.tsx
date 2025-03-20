import React from "react"
import { format_description, type_to_string } from "@/app/data/processed/utils";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import { getItem } from './item'
import { notFound } from "next/navigation";

export default async function Layout(props: {
  children: React.ReactNode,
  analyze: React.ReactNode,
  gene_sets: React.ReactNode,
  assertions: React.ReactNode,
  params: { entity_type: string, slug: string },
}) {
  const item = await getItem(props.params)
  if (!item?.entity) return notFound()
  return (
    <LandingPageLayout
      title={item.label}
      subtitle={type_to_string('entity', decodeURIComponent(props.params.entity_type))}
      description={format_description(item.description)}
      metadata={[
        item.entity.gene && {
          label: <>Ensembl Gene ID</>,
          value: <a className="text-blue-600 cursor:pointer underline" href={`https://www.ensembl.org/id/${item.entity.gene.ensembl}`} target="_blank">{item.entity.gene.ensembl}</a>
        },
        item.entity.gene && {
          label: <>Entrez Gene ID</>,
          value: <a className="text-blue-600 cursor:pointer underline" href={`https://www.ncbi.nlm.nih.gov/gene/${item.entity.gene.entrez}`} target="_blank">{item.entity.gene.entrez}</a>
        },
      ]}
    >
      {props.analyze}
      {props.children}
      {props.gene_sets}
      {props.assertions}
    </LandingPageLayout>
  )
}
