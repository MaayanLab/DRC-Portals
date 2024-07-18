import { notFound } from 'next/navigation'
import { z } from 'zod'
import SearchPage from '@/app/data/processed/search/SearchPage'
import AllSearchPage from '@/app/data/processed/search/AllSearchPage'
import { SearchQueryComponent as C2M2SearchQueryComponent} from '@/app/data/c2m2/search/SearchQueryComponent'

type PageProps = { params: { search: string, type?: string | string[] }, searchParams: Record<string, string> }

export default function Page(props: PageProps) {
  const params = z.union([
    z.undefined().transform(() => ({ type: 'all', entity_type: null })),
    z.string().transform((type) => ({ type, entity_type: null })),
    z.string().array().length(2).transform(([type, entity_type]) => ({ type, entity_type })),
    z.string().array().length(1).transform(([type]) => ({ type, entity_type: null })),
  ]).safeParse(props.params.type)
  if (!params.success) notFound()
  if (params.data.type === 'c2m2') {
    return <C2M2SearchQueryComponent
      search={decodeURIComponent(props.params.search)}
      searchParams={props.searchParams}
    />
  } else if (params.data.type === 'all') {
    return <AllSearchPage
      search={decodeURIComponent(props.params.search)}
      type={decodeURIComponent(params.data.type)}
      entity_type={params.data.entity_type ? decodeURIComponent(params.data.entity_type) : null}
      searchParams={props.searchParams}
    />
  } else {
    return <SearchPage
      search={decodeURIComponent(props.params.search)}
      type={decodeURIComponent(params.data.type)}
      entity_type={params.data.entity_type ? decodeURIComponent(params.data.entity_type) : null}
      searchParams={props.searchParams}
    />
  }
}
