import React from "react";
import trpc from '@/lib/trpc/server'
import SearchTabs from "@/app/data/processed/SearchTabs";
import { redirect } from "next/navigation";
import { FancyTab, FancyTabPlaceholder } from "@/components/misc/FancyTabs";
import { Metadata, ResolvingMetadata } from "next";
import { categoryLabel, create_url } from "./utils";
import { SearchQueryComponentTab as C2M2SearchQueryComponentTab } from '@/app/data/c2m2/search/SearchQueryComponent'
import { safeAsync } from "@/utils/safe";
import { ErrorBoundary } from "react-error-boundary";
import { TRPCError } from "@trpc/server";

export async function generateMetadata(props: { params: Promise<{ search: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const parentMetadata = await parent
  return {
    title: [
      parentMetadata.title?.absolute,
      params.search && `Search ${decodeURIComponent(params.search)}`,
    ].filter(title => !!title).join(' | '),
    keywords: [
      parentMetadata.keywords,
      params.search,
    ].filter(item => !!item).join(', '),
  }
}

export default async function Page(props: React.PropsWithChildren<{ params: Promise<{ search: string } & Record<string, string>> }>) {
  const params = await props.params
  for (const k in params) params[k] = decodeURIComponent(params[k])
  if (!params.search) redirect('/data')
  const searchRes = await safeAsync(() => trpc.types({ search: params.search }))
  if (!searchRes.data) {
    redirect(create_url({ search: params.search, error: searchRes.error instanceof TRPCError && searchRes.error.code === 'NOT_FOUND' ? 'No results matching search' : (searchRes.error as Error).message }))
  }
  return (
    <SearchTabs>
      <FancyTabPlaceholder id="c2m2" label={<>Cross-Cut Metadata Model</>} priority={Infinity}>
      <ErrorBoundary fallback={<div/>}>
        <React.Suspense fallback={null}>
            <C2M2SearchQueryComponentTab search={params.search} />
        </React.Suspense>
      </ErrorBoundary>
      </FancyTabPlaceholder>
      <FancyTab
        id={""}
        label={<>Processed Data<br />{Number(searchRes.data.total).toLocaleString()}</>}
        priority={Number(searchRes.data.total)}
      />
      {searchRes.data.types?.map((filter) =>
        <FancyTab
          key={`${filter.key}`}
          id={filter.key}
          label={<>{categoryLabel(filter.key)}<br />{Number(filter.doc_count).toLocaleString()}</>}
          priority={Number(filter.doc_count)}
        />
      )}
      {props.children}
    </SearchTabs>
  )
}
