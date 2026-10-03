import { ReviewQueryComponent} from './ReviewQueryComponent';
import React, { Suspense } from 'react';

type PageProps = { searchParams: Promise<Record<string, string>> }


export default async function Page(props: PageProps) {
return(
  <Suspense fallback={<div>Loading...</div>}>
    <ReviewQueryComponent {...props} />
  </Suspense>
)
}