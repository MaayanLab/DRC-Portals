import React from 'react'
import { search_entity, search_entity_filters, search_entity_instant_estimate, search_entity_partial_exact } from "../utils";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import KGNode from '@/public/img/icons/KGNode.png'
import { db } from "@/lib/kysely";
import { cursor } from '@/lib/kysely/utils'

function itemLabel (item: any) {
  if (item['@type'] === 'file') return item.filename
  if (item['@type'] === 'dcc') return item.short_label
  return item.name ?? item.label
}
function itemDescription (item: any) {
  if (item['@type'] === 'file') return `A ${item.mime_type} file from ${item.project_local_id}`
  if (item.description) {
    if (item.description.length > 100) return `${item.description.slice(0, 100)}...`
    return `${item.description}`
  } else {
    return JSON.stringify(item)
  }
}

export async function EntityFilters(props: { search: string, instantEstimatedCount: number }) {
  const filters = await search_entity_filters(db, props.search, props.instantEstimatedCount)
  return <>
    {filters.map(filter => <div key={filter.entity['@id']}>{itemLabel(filter.entity)} ({Number(filter.count) < 100 ? `${filter.count}` : Number(filter.estimate) > 100 ? `~${filter.estimate}` : `100+`})</div>)}
  </>
}

export default async function Page(props: { params: { search: string }, searchParams: Record<string, string> }) {
  const searchParams = useSanitizedSearchParams({ searchParams: {...props.searchParams, q: decodeURIComponent(props.params.search) } })
  const [page,pagerank,slug] = 'c' in props.searchParams ? props.searchParams['c'].split(':') : [0, 0, '']
  const offset = (searchParams.p - 1 - Number(page))*searchParams.r
  const limit = searchParams.r
  let cur: { pagerank: string, slug: string } | undefined
  const instantEstimatedCount = await search_entity_instant_estimate(searchParams.q as string)
  const partialExactCount = await search_entity_partial_exact(searchParams.q as string, 100, cur)
  const items = await //cursor(
    db.with('search_entity', db =>
    search_entity(db, searchParams.q || '', instantEstimatedCount)
      .$if(cursor !== undefined, qb => {
        if (!cur) return qb
        return qb.where('pagerank', '<', cur.pagerank).where('slug', '>', cur.slug)
      })
      .select('search_entity.id')
      .offset(offset)
      .limit(limit)
    )
    .selectFrom('search_entity')
    .innerJoin('pdp.entity_complete', j=>j.onRef('entity_complete.id', '=', 'search_entity.id'))
      .selectAll()
      .execute()//,
    // { move: Number(offset), fetch: Number(limit) }
  // )
  return <>
      <ListingPageLayout
        count={partialExactCount < 100 ? partialExactCount : instantEstimatedCount}
        maxCount={100}
        filters={
          <>
            <React.Suspense fallback={null}>
              <EntityFilters search={searchParams.q as string} instantEstimatedCount={instantEstimatedCount} />
            </React.Suspense>
            {/* <span className="has-[.not-empty:empty]:hidden">
              <Typography className="subtitle1">Program</Typography>
              <span className="not-empty flex flex-col">
                <React.Suspense fallback={null}>
                  <ProgramFilters q={searchParams.q ??''} />
                </React.Suspense>
              </span>
              <hr className="m-2" />
            </span> */}
          </>
        }
        footer={
          <Link href="/data">
            <Button
              sx={{textTransform: "uppercase"}}
              color="primary"
              variant="contained"
              startIcon={<Icon path={mdiArrowLeft} size={1} />}>
                BACK TO SEARCH
            </Button>
          </Link>
        }
      >
        <SearchablePagedTable
          q={searchParams.q ?? ''}
          p={searchParams.p}
          r={searchParams.r}
          count={partialExactCount??0}
          columns={[
            <>&nbsp;</>,
            <>Label</>,
            <>Description</>,
          ]}
          rows={items.map(item => {
            const href = `/data/search2/entity/${item.entity['@type']}/${item.entity['@id']}`
            return [
              <SearchablePagedTableCellIcon href={href} src={KGNode} alt={type_to_string(item.entity['@type'], '')} />,
              <LinkedTypedNode type={item.entity['@type']} entity_type={''} id={item.entity['@id']} label={itemLabel(item.entity)} search={searchParams.q ?? ''} />,
              <Description description={itemDescription(item.entity)} search={searchParams.q ?? ''} />,
            ]
          }) ?? []}
        />
      </ListingPageLayout>
  </>
}
