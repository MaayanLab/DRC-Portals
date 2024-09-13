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
  params: { entity_type: string, id: string },
}) {
  const item = await getItem(props.params.id)
  if (!item) return notFound()
  return (
    <LandingPageLayout
      title={item.node.label}
      subtitle={type_to_string('entity', decodeURIComponent(props.params.entity_type))}
      description={format_description(item.node.description)}
    >
      {props.analyze}
      {props.children}
      {props.gene_sets}
      {props.assertions}
    </LandingPageLayout>
  )
}
