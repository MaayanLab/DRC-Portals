import React from 'react'
import { Container, Grid, Typography } from "@mui/material"
import elasticsearch from "@/lib/elasticsearch"
import { categoryLabel, pluralize } from "@/app/data/search2/utils"

export default async function Page({ include }: { include?: string[] }) {
  const summaryRes = await elasticsearch.search({
    index: 'entity',
    size: 0,
    aggs: {
      keys: {
        terms: {
          field: "type.keyword", 
          size: 1000,
          include,
        },
      },
    },
  })
  return <Container maxWidth="lg" className="m-auto">
      <Grid container spacing={6} justifyContent={"center"} alignItems={"flex-start"}>
        {summaryRes.aggregations?.keys.buckets.map((result: any) => (
        <Grid key={result.key} item xs={6} sm={4} md={3} lg={2}>
          <a href={`/data/search2/${result.key}`}>
            <div className="flex flex-col items-center">
              <Typography variant="h2" color="secondary">{BigInt(result.doc_count).toLocaleString()}</Typography>
              <Typography variant="subtitle1" color="secondary">{pluralize(categoryLabel(result.key))}</Typography>
            </div>
          </a>
        </Grid>
      ))}
      {include !== undefined && <Grid item xs={6} sm={4} md={3} lg={2}>
        <a href={`/data/search2/summary`}>
          <div className="flex flex-col items-center">
            <Typography variant="h2" color="secondary">Click</Typography>
            <Typography variant="subtitle1" color="secondary">To see more</Typography>
          </div>
        </a>
      </Grid>}
    </Grid>
  </Container>
}
