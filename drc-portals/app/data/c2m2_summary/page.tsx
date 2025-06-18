'use client';
import {  useSanitizedSearchParams } from "@/app/data/review/utils"
import { SummaryQueryComponent } from './SummaryQueryComponent';
import React, { Suspense } from 'react';

type PageProps = { searchParams: Record<string, string> }


export default async function Page(props: PageProps) {
  
  const searchParams = useSanitizedSearchParams(props);
  
  
//console.log("I am here");
return(
  <Suspense fallback={<div>Loading...</div>}>
    <SummaryQueryComponent {...props} />
  </Suspense>
)
}