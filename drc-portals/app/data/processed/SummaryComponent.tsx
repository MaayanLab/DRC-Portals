import React from 'react'
import { Container, Grid, Typography } from "@mui/material"
import { categoryLabel, create_url, EntityType, pluralize, TermAggType } from "@/app/data/processed/utils"
import { safeAsync } from '@/utils/safe'
import trpc from '@/lib/trpc/server'

export const dynamic = 'force-dynamic'

export default async function Summary({ include }: { include?: string[] }) {
  const { data: summaryRes, error } = await safeAsync(() => trpc.types({ include }))
  if (error) console.error(error)
  if (!summaryRes) return null
  return <Container maxWidth="lg" className="m-auto">
      <Grid container spacing={6} justifyContent={"center"} alignItems={"flex-start"}>
        {summaryRes.types?.map((result) => (
        <Grid key={result.key} item xs={6} sm={4} md={3} lg={2}>
          <a href={create_url({ type: result.key })}>
            <div className="flex flex-col items-center text-center">
              <Typography variant="h2" color="secondary">{BigInt(result.doc_count).toLocaleString()}</Typography>
              <Typography variant="subtitle1" color="secondary">{pluralize(categoryLabel(result.key))}</Typography>
            </div>
          </a>
        </Grid>
      ))}
      {include !== undefined && <Grid item xs={6} sm={4} md={3} lg={2}>
        <a href={create_url({})}>
          <div className="flex flex-col items-center">
            <Typography variant="h2" color="secondary">Click</Typography>
            <Typography variant="subtitle1" color="secondary">To see more</Typography>
          </div>
        </a>
      </Grid>}
    </Grid>
  </Container>
}
