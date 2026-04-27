import React from 'react'
import { Container, Grid, Typography } from "@mui/material"
import { categoryLabel, create_url, EntityType, pluralize, TermAggType } from "@/app/data/processed/utils"
import { safeAsync } from '@/utils/safe'
import elasticsearch from '@/lib/elasticsearch'
import { Stack } from '@mui/system'

export const dynamic = 'force-dynamic'

export default async function Summary({ include }: { include?: string[] }) {
  const { data: summaryRes, error } = await safeAsync(() => elasticsearch.search<EntityType, TermAggType<'types'>>({
    index: 'entity_expanded',
    size: 0,
    aggs: {
      types: {
        terms: {
          field: "type", 
          size: 1000,
          include,
        },
      },
    },
  }))
  if (error) console.error(error)
  if (!summaryRes) return null
  return (
    <Stack spacing={2}>
      {summaryRes?.aggregations?.types.buckets.map((result) => (
        <a key={result.key} href={create_url({ type: result.key })}>
            <div className="flex flex-col items-center text-center">
              <Typography variant="h2" color="secondary">{BigInt(result.doc_count).toLocaleString()}</Typography>
              <Typography variant="subtitle1" color="secondary">{pluralize(categoryLabel(result.key))}</Typography>
            </div>
        </a>
      ))}
    </Stack>
  )
}
