'use client'

import React from "react"
import SearchFilter, { CollapseFilter, CollapseFilters } from "@/app/data/processed/SearchFilter"
import { categoryLabel, create_url, EntityType, facetLabel, itemLabel, parse_url } from "@/app/data/processed/utils"
import { useSearchParams } from "next/navigation"
import trpc from "@/lib/trpc/client"
import { Paper, Grid, Typography, Button } from "@mui/material"
import usePathname from "@/utils/pathname"
import { useRouter } from "next/navigation"

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
  const { data } = trpc.facet.useQuery({
    source_id: props.source_id,
    search: props.search ?? (params.entity_search || undefined),
    facet: [...(props.facets ?? []), ...searchParams.getAll('facet')],
  }, {staleTime: Infinity})
  const aggregations = data?.aggregations ?? {}
  const entityLookup = {...(props.entityLookup ?? {}), ...(data?.entityLookup ?? {})}
  return (
    <Grid item container justifyContent={"center"} spacing={2} style={{ overflow: 'hidden' }}>
      <Grid item container xs={12} spacing={2} flexDirection={"row-reverse"}>
        <Grid item xs={12} md={3} sx={{ visibility: data?.total === 0 ? 'hidden' : 'visible' }}>
          <Paper sx={{display: 'flex', flexDirection: 'column', background: "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)", height: '100%', padding: "12px 24px", overflow: 'hidden' }} elevation={0}>
            <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
              <Typography variant="h5">Results found</Typography>
              <Typography variant="h5">{data?.total?.toLocaleString()}</Typography>
            </div>
            <div className="flex flex-col text-lg">
              {Object.keys(data?.aggregations ?? {}).length > 0 && <Button
                sx={{textTransform: "uppercase"}}
                color="primary"
                variant="contained"
                disabled={!searchParams.has('facet')}
                onClick={evt => {router.push(create_url({...params, facet: null}), { scroll: false })}}
              >Reset filters</Button>}
              <CollapseFilters>
                {Object.keys(data?.aggregations ?? {}).map(facet => {
                  if (aggregations[facet].buckets.length === 0) return null
                  return <div key={facet} className="mb-2">
                    <div className="font-bold">{facetLabel(facet)}</div>
                    <div className="flex flex-col">
                      <CollapseFilter>
                        {aggregations[facet].buckets.map(filter => 
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
        <Grid item xs={12} md={data?.total === undefined ? 9 : data.total === 0 ? 12 : 9}>
          {props.children}
        </Grid>
      </Grid>
      {props.footer && <Grid item xs={12}>
        {props.footer}
      </Grid>}
    </Grid>
  )
}
