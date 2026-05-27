import React from 'react'
import trpc from '@/lib/trpc/server'
import { categoryLabel, create_url, EntityType, itemDescription, itemIcon, itemLabel } from "@/app/data/processed/utils"
import SearchablePagedTable, { SearchablePagedTableCell, SearchablePagedTableCellIcon, LinkedTypedNode, Description, SearchablePagedTableHeader } from "@/app/data/processed/SearchablePagedTable";
import { ensure_array } from '@/utils/array';
import { esDCCs } from '@/app/data/processed/dccs';
import { DRSCartButton, FetchDRSCartButton } from '@/app/data/processed/cart/DRSCartButton';
import FormPagination from '@/app/data/processed/FormPagination';
import { FancyTab } from '@/components/misc/FancyTabs';
import ListingPageLayoutClientSideFacets from '@/app/data/processed/ListingPageLayoutClientSideFacets';
import Link from '@/utils/link';
import { Button } from '@mui/material';
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';

type PageProps = { params: Promise<{ type?: string, search?: string, search_type?: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string }> }

export default async function Page(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  for (const k in params) params[k] = decodeURIComponent(params[k])
  for (const k in searchParams) {
    const v = searchParams[k]
    searchParams[k] = Array.isArray(v) ? v.map(decodeURIComponent) : decodeURIComponent(v)
  }
  const display_per_page = Math.min(Number(searchParams?.display_per_page ?? 10), 50)
  const liverSearch = params.search ? `${params.search} liver` : 'liver'
  const searchRes = await trpc.search({
    search: liverSearch,
    facet: [
      ...(params.type ? [`type:"${params.type}"`] : []),
      ...(params.search_type ? [`type:"${params.search_type}"`] : []),
      ...ensure_array(searchParams?.facet),
    ],
    size: display_per_page,
    reverse: !!searchParams?.reverse,
    cursor: searchParams?.cursor as string | undefined,
  })
  const entityLookup: Record<string, EntityType> = Object.fromEntries([
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
    <ListingPageLayoutClientSideFacets
      entityLookup={await esDCCs}
      facets={params.type ? [`type:"${params.type}"`] : []}
      search={liverSearch}
      footer={
        <Link href="/liverPortal">
          <Button
            sx={{ textTransform: "uppercase" }}
            color="primary"
            variant="contained"
            startIcon={<Icon path={mdiArrowLeft} size={1} />}>
            BACK TO LIVER PORTAL
          </Button>
        </Link>
      }
    >
      <>
        {params.type && searchRes.total === 0 && <FancyTab id={params.type} label={<>{categoryLabel(params.type)}<br />0</>} priority={0} />}
        <SearchablePagedTable
          tableHeader={
            params.type && <SearchablePagedTableHeader
              label={categoryLabel(params.type)}
              search_name="type_search"
              search={params?.search ?? ''}
              autocomplete={{
                type: params.type,
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
          rows={searchRes.items.map((hit_source) => {
            const href = create_url({ type: hit_source.type, slug: hit_source.slug })
            return [
              <SearchablePagedTableCellIcon href={href} src={itemIcon(hit_source, entityLookup)} alt={categoryLabel(hit_source.type)} />,
              <SearchablePagedTableCell><LinkedTypedNode href={href} type={hit_source.type} label={itemLabel(hit_source)} search={searchParams?.q as string ?? ''} /></SearchablePagedTableCell>,
              <SearchablePagedTableCell sx={{ maxWidth: 'unset' }}><Description description={itemDescription(hit_source, entityLookup)} search={searchParams?.q as string ?? ''} /></SearchablePagedTableCell>,
              hit_source.a_access_url && <SearchablePagedTableCell><DRSCartButton access_url={hit_source.a_access_url} responsive /></SearchablePagedTableCell>,
            ]
          }) ?? []}
          tableFooter={!!searchRes.total_accessible &&
            <div className="flex flex-row justify-end">
              <FetchDRSCartButton
                search={liverSearch}
                facet={[
                  ...ensure_array(params.type).map(type => type ? `type:"${type}"` : undefined),
                  ...ensure_array(params.search_type).map(type => type ? `type:"${type}"` : undefined),
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
                searchRes.first ? encodeURIComponent(searchRes.first) : undefined,
                searchRes.next ? encodeURIComponent(searchRes.next) : undefined,
              ]}
            />
          }
        />
      </>
    </ListingPageLayoutClientSideFacets>
  )
}