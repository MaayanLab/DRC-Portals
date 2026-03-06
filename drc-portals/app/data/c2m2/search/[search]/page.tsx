import { SearchQueryComponent} from '../SearchQueryComponent';
import React from 'react';

type PageProps = { params: { search?: string }, searchParams: Record<string, string> }

export default async function Page(props: PageProps) {
  return <SearchQueryComponent search={decodeURIComponent(props.params.search ?? '')} searchParams={props.searchParams} />
}
