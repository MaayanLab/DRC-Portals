import { Metadata, ResolvingMetadata } from "next"
import { type_to_string } from "@/app/data/processed/utils"

type PageProps = { params: { entity_type: string } }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const title = type_to_string('entity', decodeURIComponent(props.params.entity_type))
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | ${title}`,
    keywords: [title, parentMetadata.keywords].join(', '),
  }
}

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  return children
}
