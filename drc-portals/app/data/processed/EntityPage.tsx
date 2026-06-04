import React from 'react'
import trpc from '@/lib/trpc/server'
import { categoryLabel, EntityType, itemDescription, itemIcon, itemLabel } from "@/app/data/processed/utils"
import SearchablePagedTable, { SearchablePagedTableCell, SearchablePagedTableCellIcon, LinkedTypedNode, Description, SearchablePagedTableHeader } from "@/app/data/processed/SearchablePagedTable";
import { notFound } from 'next/navigation';
import { create_url } from '@/app/data/processed/utils';
import { ensure_array } from '@/utils/array';
import { FetchDRSCartButton, DRSCartButton } from '@/app/data/processed/cart/DRSCartButton';
import { getEntity } from '@/app/data/processed/getEntity';
import { esDCCs } from '@/app/data/processed/dccs';
import FormPagination from '@/app/data/processed/FormPagination';
import { Metadata, ResolvingMetadata } from 'next';

type PageProps = { params: Promise<{ type: string, slug: string, search?: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string }> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  for (const k in params) params[k] = decodeURIComponent(params[k])
  const parentMetadata = await parent
  return {
    title: [
      // NOTE: EntityPageLayout.generateMetadata will already be applied
      parentMetadata.title?.absolute,
      params.search && `Search ${params.search}`
    ].filter(item => !!item).join(' | '),
    keywords: [
      params.search,
      parentMetadata.keywords
    ].filter(item => !!item).join(', '),
  }
}

export default async function Page(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  for (const k in params) params[k] = decodeURIComponent(params[k])
  for (const k in searchParams) {
    const v = searchParams[k]
    searchParams[k] = Array.isArray(v) ? v.map(decodeURIComponent) : decodeURIComponent(v)
  }
  const item = await getEntity(params)
  if (!item) notFound()
  const display_per_page = Math.min(Number(searchParams?.display_per_page ?? 10), 50)
  const searchRes = await trpc.search({
    source_id: item.id,
    search: params.search,
    facet: ensure_array(searchParams?.facet),
    reverse: !!searchParams?.reverse,
    cursor: searchParams?.cursor as string | undefined,
    size: display_per_page,
  })
  if (searchRes.total === 0 && !params.search && !searchParams?.facet) return null
  const entityLookup: Record<string, EntityType> = Object.fromEntries([
    [item.id, item],
    ...searchRes.items.flatMap((hit) => [
      [hit.id, hit],
      ...Object.entries(hit).flatMap(([key, value]) => {
        if (key.startsWith('m2o_')) {
          return [[(value as EntityType).id, value as EntityType]]
        } else {
          return []
        }
      }),
    ]),
    ...Object.entries(await esDCCs),
  ])
  return (
    <SearchablePagedTable
      tableHeader={
        <SearchablePagedTableHeader
          label="Linked to"
          search_name="entity_search"
          search={params?.search ?? ''}
          autocomplete={{
            source_id: item.id,
            facet: ensure_array(searchParams?.facet),
          }}
        />
      }
      columns={[
        <>&nbsp;</>,
        <>Label</>,
        <>Description</>,
        <>&nbsp;</>,
      ]}
      rows={searchRes.items.map((hit_source_target) => {
        if (!hit_source_target.type) return []
        const href = create_url({ type: hit_source_target.type, slug: hit_source_target.slug})
        return [
          <SearchablePagedTableCellIcon href={href} src={itemIcon(entityLookup[hit_source_target.id], entityLookup)} alt={categoryLabel(hit_source_target.type)} />,
          <SearchablePagedTableCell><LinkedTypedNode href={href} type={hit_source_target.type} label={itemLabel(entityLookup[hit_source_target.id])} search={searchParams?.q as string ?? ''} /></SearchablePagedTableCell>,
          <SearchablePagedTableCell sx={{maxWidth: 'unset'}}><Description description={itemDescription(entityLookup[hit_source_target.id], entityLookup)} search={searchParams?.q as string ?? ''} /></SearchablePagedTableCell>,
          hit_source_target.a_access_url && <SearchablePagedTableCell><DRSCartButton access_url={hit_source_target.a_access_url} responsive /></SearchablePagedTableCell>,
        ]
      })}
      tableFooter={!!searchRes.total_accessible &&
        <div className="flex flex-row justify-end">
          <FetchDRSCartButton
            source_id={item.id}
            search={params.search}
            facet={[
              ...ensure_array(searchParams?.facet),
              '_exists_:a_access_url',
            ]}
            count={searchRes.total_accessible}
          />
        </div>
      }
      tablePagination={
        <FormPagination
          cursor={searchParams?.cursor as string}
          reverse={searchParams?.reverse !== undefined}
          display_per_page={display_per_page}
          page={Number(searchParams?.page || 1)}
          total={Number(searchRes.total)}
          cursors={[
            searchRes.items.length && searchRes.first ? encodeURIComponent(searchRes.first) : undefined,
            searchRes.items.length && searchRes.next ? encodeURIComponent(searchRes.next) : undefined,
          ]}
        />
      }
    />
  )
}
