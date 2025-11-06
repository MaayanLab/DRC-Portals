'use client'

import React from "react"
import SearchFilter, { CollapseFilters } from "@/app/data/processed/SearchFilter"
import { categoryLabel, EntityType, facetLabel, itemLabel, TermAggType } from "@/app/data/processed/utils"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"

// reload facets when they change to get updated counts
function useFacets(params: Record<string, string | undefined>) {
  const searchParams = useSearchParams()
  return useSWR(searchParams.getAll('facet'), async (facets) => {
    const reqParams = new URLSearchParams([
      ...Object.entries(params).filter((param): param is [string,string] => param[1] !== undefined),
      ...facets.map(item => ['facet', item]),
    ])
    const req = await fetch(`/data/processed/api/facet?${reqParams.toString()}`)
    return await req.json() as { total: number, aggregations: TermAggType<string>, entityLookup: Record<string, EntityType> }
  })
}

// render recomputed aggregations in the original aggregation structure
export default function ClientSideFacets(props: { aggregations: TermAggType<string>, entityLookup: Record<string, EntityType>, params: Record<string, string | undefined> }) {
  const newAgg = useFacets(props.params)
  const { aggregations, entityLookup } = React.useMemo(() => {
    if (newAgg.data) return { aggregations: newAgg.data.aggregations, entityLookup: {...props.entityLookup, ...newAgg.data.entityLookup} }
    else return props
  }, [newAgg, props.aggregations, props.entityLookup])
  return (
    <CollapseFilters>
      {Object.keys(aggregations).map(facet => {
        // if (props.aggregations[facet].buckets.length === 0 || props.aggregations[facet].buckets.length === 1) return null
        const keyedBucket = facet in props.aggregations ? Object.fromEntries(props.aggregations[facet].buckets.map(filter => [filter.key, filter])) : {}
        const newKeyedBucket = facet in aggregations ? Object.fromEntries(aggregations[facet].buckets.map(filter => [filter.key, filter])) : {}
        return <div key={facet} className="mb-2">
          <div className="font-bold">{facetLabel(facet)}</div>
          <div className="flex flex-col">
            {aggregations[facet].buckets.length === 1 ? props.aggregations[facet].buckets.map(filter => 
              <SearchFilter
                key={`${filter.key}`}
                id={`${facet}:"${filter.key}"`}
                label={filter.key in entityLookup ? itemLabel(entityLookup[filter.key]) : facet === 'type' ? categoryLabel(filter.key) : filter.key}
                filter_count={filter.key in newKeyedBucket ? newKeyedBucket[filter.key].doc_count : undefined}
                count={filter.key in keyedBucket ? keyedBucket[filter.key].doc_count : 0}
              />
            ) : aggregations[facet].buckets.map(filter => 
              <SearchFilter
                key={`${filter.key}`}
                id={`${facet}:"${filter.key}"`}
                label={filter.key in entityLookup ? itemLabel(entityLookup[filter.key]) : facet === 'type' ? categoryLabel(filter.key) : filter.key}
                filter_count={filter.key in newKeyedBucket ? newKeyedBucket[filter.key].doc_count : 0}
                count={filter.key in keyedBucket ? keyedBucket[filter.key].doc_count : undefined}
              />
            )}
          </div>
        </div>
      })}
    </CollapseFilters>
  )
}
