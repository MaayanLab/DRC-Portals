'use client'

import React from "react"
import SearchFilter, { CollapseFilter, CollapseFilters } from "@/app/data/processed/SearchFilter"
import { categoryLabel, create_url, EntityType, facetLabel, itemLabel, parse_url } from "@/app/data/processed/utils"
import { useSearchParams } from "next/navigation"
import trpc from "@/lib/trpc/client"
import { Paper, Grid, Typography, Button } from "@mui/material"
import usePathname from "@/utils/pathname"
import { useRouter } from "next/navigation"
import classNames from "classnames"

export default function ListingPageLayoutClientSideFacets(props: React.PropsWithChildren<{
  source_id?: string,
  facets?: string[],
  search?: string,
  footer?: React.ReactNode,
  entityLookup?: Record<string, EntityType>,
}>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = React.useMemo(() => parse_url({ pathname, search: searchParams }), [pathname, searchParams])
  const { data: rawData } = trpc.facet.useQuery({
    source_id: props.source_id,
    search: props.search ?? (params.entity_search || undefined),
    facet: [...(props.facets ?? []), ...searchParams.getAll('facet')],
  }, {staleTime: Infinity})
  const [data, setData] = React.useState<{ current?: typeof rawData, previous?: typeof rawData }>({})
  React.useEffect(() => {
    if (rawData) {
      setData(({ current: previous, previous: _ }) => ({
        previous,
        current: {
          total: rawData.total,
          entityLookup: {
            ...(previous?.entityLookup ?? {}),
            ...(rawData.entityLookup ?? {}),
          },
          aggregations: Object.fromEntries(
            [...(new Set([...Object.keys(previous?.aggregations ?? {}), ...Object.keys(rawData.aggregations ?? {})]))]
              .map((bucket) => {
                const prev = Object.fromEntries(previous?.aggregations ? previous.aggregations[bucket].buckets.map(({ key, doc_count }) => [key, doc_count]) : [])
                const curr = Object.fromEntries(rawData.aggregations ? rawData.aggregations[bucket].buckets.map(({ key, doc_count }) => [key, doc_count]) : [])
                for (const k in prev) {
                  if (!(k in curr)) curr[k] = 0
                }
                return [
                  bucket,
                  { buckets: Object.entries(curr).map(([key, doc_count]) => ({ key, doc_count })) }
                ]
              })
          ),
        },
      }))
    }
  }, [rawData])
  const aggregations = React.useMemo(() => Object.entries(data.current?.aggregations ?? {}).flatMap(([facet, { buckets }]) => {
    const selectedGroup = searchParams.getAll('facet').some(f => decodeURIComponent(f).startsWith(`${facet}:`))
    const nonZeroSize = buckets.filter(bucket => bucket.doc_count !== 0).length
    if (!selectedGroup && nonZeroSize <= 1) return []
    return [[facet, { buckets, selectedGroup }] as const]
  }), [data.current, searchParams])
  const entityLookup = { ...(props.entityLookup ?? {}), ...(data.current?.entityLookup ?? {}) }
  return (
    <Grid item container spacing={2} style={{ overflow: 'hidden' }}>
      <Grid item container xs={12} spacing={2} flexDirection={"row-reverse"}>
        <Grid item xs={12} md={3} sx={{ display: data.current?.total === 0 && aggregations.length === 0 ? 'none' : 'block' }}>
          <Paper sx={{display: 'flex', flexDirection: 'column', background: "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)", height: '100%', padding: "12px 24px", overflow: 'hidden' }} elevation={0}>
            <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
              <Typography variant="h5">Results found</Typography>
              <Typography variant="h5">{data.current?.total?.toLocaleString()}</Typography>
            </div>
            <div className={classNames('flex flex-col text-lg', { 'hidden': aggregations.length === 0 })}>
              <Button
                sx={{textTransform: "uppercase"}}
                color="primary"
                variant="contained"
                disabled={!searchParams.has('facet')}
                onClick={evt => {router.push(create_url({...params, facet: null}), { scroll: false })}}
              >Reset filters</Button>
              <CollapseFilters>
                {aggregations.map(([facet, { buckets, selectedGroup }]) => {
                  return <div key={facet} className="mb-2">
                    <div className="font-bold">{facetLabel(facet)}</div>
                    <div className="flex flex-col">
                      <CollapseFilter>
                        {buckets.filter(filter => selectedGroup || filter.doc_count > 0).map(filter => 
                          <SearchFilter
                            key={`${filter.key}`}
                            id={`${facet}:"${filter.key}"`}
                            label={filter.key in entityLookup ? itemLabel(entityLookup[filter.key]) : facet === 'type' || facet === 'target_type' ? categoryLabel(filter.key) : filter.key}
                            count={filter.doc_count}
                          />
                        )}
                      </CollapseFilter>
                    </div>
                  </div>
                })}
              </CollapseFilters>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={data.current?.total === undefined ? 9 : data.current?.total === 0 && aggregations.length === 0 ? 12 : 9}>
          {props.children}
        </Grid>
      </Grid>
      {props.footer && <Grid item xs={12}>
        {props.footer}
      </Grid>}
    </Grid>
  )
}
