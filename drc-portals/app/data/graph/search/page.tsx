import { Suspense } from 'react'
import GraphPathway from "@/components/prototype/components/GraphPathway";

export default async function Page() {
  return <Suspense fallback={<div>Loading...</div>}><GraphPathway /></Suspense>;
}
