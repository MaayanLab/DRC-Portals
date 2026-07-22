import { SearchQueryComponent} from '../SearchQueryComponent';
import React from 'react';

type PageProps = { params: Promise<{ search?: string }>, searchParams: Promise<Record<string, string>> }

export default async function Page(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  return <SearchQueryComponent search={decodeURIComponent(params.search ?? '')} searchParams={searchParams} />
}
