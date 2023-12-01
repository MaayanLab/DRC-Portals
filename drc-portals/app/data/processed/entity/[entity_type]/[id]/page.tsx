import prisma from "@/lib/prisma"
import { format_description } from "@/app/data/processed/utils";
import LandingPageLayout from "@/app/data/processed/LandingPageLayout";

export default async function Page(props: { params: { entity_type: string, id: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const item = await prisma.entityNode.findUniqueOrThrow({
    where: {
      id: props.params.id
    },
    select: {
      type: true,
      node: {
        select: {
          label: true,
          description: true,
        }
      }
    }
  })
  return (
    <LandingPageLayout
      label={item.node.label}
      description={format_description(item.node.description)}
    />
  )
}
