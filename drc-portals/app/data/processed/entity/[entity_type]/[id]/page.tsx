import prisma from "@/lib/prisma"
import { format_description } from "@/app/data/processed/utils";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";

type PageProps = { params: { entity_type: string, id: string }, searchParams: Record<string, string | string[] | undefined> }

const getItem = cache((id: string) => prisma.entityNode.findUniqueOrThrow({
  where: { id },
  select: {
    type: true,
    node: {
      select: {
        label: true,
        description: true,
      }
    }
  }
}))

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const item = await getItem(props.params.id)
  return {
    title: `${(await parent).title?.absolute} | ${item.node.label}`,
    description: item.node.description,
  }
}

export default async function Page(props: PageProps) {
  const item = await getItem(props.params.id)
  return (
    <LandingPageLayout
      label={item.node.label}
      description={format_description(item.node.description)}
    />
  )
}
