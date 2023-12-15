import React from "react"
import { format_description, type_to_string } from "@/app/data/processed/utils";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import { getItem } from './item'

export default async function Layout(props: {
  children: React.ReactNode,
  assertions: React.ReactNode,
  gene_sets: React.ReactNode,
  params: { entity_type: string, id: string },
}) {
  const item = await getItem(props.params.id)
  return (
    <LandingPageLayout
      title={item.node.label}
      subtitle={type_to_string('entity', props.params.entity_type)}
      description={format_description(item.node.description)}
    >
      {props.children}
      {props.gene_sets}
      {props.assertions}
    </LandingPageLayout>
  )
}
