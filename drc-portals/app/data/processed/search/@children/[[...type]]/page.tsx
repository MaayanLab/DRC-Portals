import SearchPage from '@/app/data/processed/search/SearchPage'
import AllSearchPage from '@/app/data/processed/search/AllSearchPage'
import { SearchQueryComponent as C2M2SearchQueryComponent} from '@/app/data/c2m2/search/SearchQueryComponent'
import { Metadata, ResolvingMetadata } from 'next'
import { redirect } from 'next/navigation'

type PageProps = { params: { type?: string[] }, searchParams: Record<string, string> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const parentMetadata = await parent
  return {
    title: `${parentMetadata.title?.absolute} | Search ${props.searchParams.q ?? ''}`,
    keywords: parentMetadata.keywords,
  }
}

export default async function Page(props: PageProps) {
  if (!props.searchParams.q) redirect('/data')
  let [type, entity_type] = props.params.type ?? [] as (string|null)[]
  if (type) type = decodeURIComponent(type)
  else type = 'all'
  if (entity_type) entity_type = decodeURIComponent(entity_type)
  else entity_type = null
  if (type === 'c2m2') {
    return <C2M2SearchQueryComponent {...props} />
  } else if (type === 'all') {
    return <AllSearchPage searchParams={props.searchParams} />
  } else {
    return <SearchPage searchParams={props.searchParams} type={type} entity_type={entity_type} />
  }
}
