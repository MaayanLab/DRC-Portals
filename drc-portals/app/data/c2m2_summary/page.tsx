'use client';
import { useSanitizedSearchParams } from "@/app/data/review/utils"
import SummaryQueryComponent from './SummaryQueryComponent';
import React, { Suspense } from 'react';

type PageProps = { searchParams: Record<string, string> }

export default function Page(props: PageProps) {
  useSanitizedSearchParams(props); // Use the hook if needed for side effects
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SummaryQueryComponent />
    </Suspense>
  );
}
