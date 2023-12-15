import prisma from "@/lib/prisma"
import { Container, Typography } from "@mui/material"
import { format_description, type_to_string } from "@/app/data/processed/utils";

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
    <>
      <Container><Typography variant="h1">{type_to_string('entity', item.type)}: {item.node.label}</Typography></Container>
      <Container><Typography variant="subtitle1">Description: {format_description(item.node.description)}</Typography></Container>
    </>
  )
}
