import { Metadata, ResolvingMetadata } from "next"
import AllSearchPages from './AllSearchPages'
import { SearchQueryComponent as C2M2SearchQueryComponent} from '../../c2m2/search/SearchQueryComponent'

type PageProps = { searchParams: Record<string, string> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | Search ${props.searchParams.q ?? ''}`,
    keywords: parentMetadata.keywords,
  }
}

export default async function Page(props: PageProps) {
  return <>
    <AllSearchPages {...props} />
    <C2M2SearchQueryComponent tab {...props} />
  </>
}
