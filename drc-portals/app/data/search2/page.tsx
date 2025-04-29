import { db } from "@/lib/kysely"
import { Grid, Typography } from "@mui/material"

export default async function Page() {
  const results = await db
    .selectFrom('pdp.entity as e')
    .select('e.type')
    .select(s => s.fn.countAll().as('count'))
    .groupBy('e.type')
    .orderBy('count desc')
    .execute()
  return <div className="flex flex-row gap-4 flex-wrap place-items-center justify-center">{results.map((result) => (
    <Grid key={result.type} item xs={6} sm={4} md={3} lg={2}>
      <a href={`/data/search2/entity/${result.type}`}>
        <div className="flex flex-col items-center">
          <Typography variant="h2" color="secondary">{BigInt(result.count).toLocaleString()}</Typography>
          <Typography variant="subtitle1" color="secondary">{result.type}</Typography>
        </div>
      </a>
    </Grid>
  ))}</div>
}