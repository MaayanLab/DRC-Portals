import { Metadata, ResolvingMetadata } from "next";
import { getItem } from './item'

type PageProps = { params: { entity_type: string, id: string }, searchParams: Record<string, string | string[] | undefined> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const item = await getItem(props.params.id)
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | ${item.node.label}`,
    description: item.node.description,
    keywords: [
      item.node.label,
      parentMetadata.keywords,
    ].join(', '),
  }
}

export default async function Page(props: PageProps) {
  return null
}
