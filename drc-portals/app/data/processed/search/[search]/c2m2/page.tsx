import { SearchQueryComponent as C2M2SearchQueryComponent} from '@/app/data/c2m2/search/SearchQueryComponent'

type PageProps = { params: Promise<{ search: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string }> }

export default async function Page(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  for (const k in params) params[k] = decodeURIComponent(params[k])
  for (const k in searchParams) {
    const v = searchParams[k]
    searchParams[k] = Array.isArray(v) ? v.map(decodeURIComponent) : decodeURIComponent(v)
  }
  return <C2M2SearchQueryComponent
    search={params.search}
    searchParams={searchParams as Record<string, string>}
  />
}
