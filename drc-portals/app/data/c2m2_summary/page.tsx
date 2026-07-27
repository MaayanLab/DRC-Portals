'use client';
import { useSanitizedSearchParams } from "@/app/data/review/utils"
import SummaryQueryComponent from './SummaryQueryComponent';
import React, { Suspense } from 'react';

type PageProps = { searchParams: Promise<Record<string, string>> }

export default async function Page(props: PageProps) {
  const searchParams = React.use(props.searchParams)
  useSanitizedSearchParams({ searchParams }); // Use the hook if needed for side effects
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SummaryQueryComponent />
    </Suspense>
  );
}
