import prisma from "@/lib/prisma";
import { Container, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { capitalize, pluralize } from "@/app/data/processed/utils"
import SearchField from "@/app/data/processed/SearchField";

export default async function Page() {
  const [{ datasets, entities, sets }] = await prisma.$queryRaw<{
    datasets: number,
    entities: Record<string, number>,
    sets: Record<string, number>,
  }[]>`
    with "entityTypes" as (
      select distinct "entityType" as value
      from "xdataset"
    ), "entityTypeCounts" as (
        select "entityTypes".value as "entityType", count(*) as count
        from "entityTypes"
        left join "xentity" on "xentity".id like "entityTypes".value || '/%'
        group by "entityTypes".value
    ), "entityTermTypes" as (
      select distinct "entityType" || '/set/' || "termType" as value
      from "xdataset"
    ), "entityTermTypeCounts" as (
      select "entityTermTypes".value as "entityTermType", count(*) as count
      from "entityTermTypes"
      left join "xset" on "xset".id like "entityTermTypes".value || '/%'
      group by "entityTermTypes".value
    ) select
      (select count(*)::int from "xdataset") as "datasets",
      (select jsonb_object_agg("entityType", "count") from "entityTypeCounts") as "entities",
      (select jsonb_object_agg("entityTermType", "count") from "entityTermTypeCounts") as "sets"
    ;
  `
  return (
    <Container component="form" action="/data/processed/search" method="GET" className="text-center">
      <SearchField q={''} />
      <Grid item xs={12} className="grid grid-cols-3 justify-center gap-4">
        <Link href="/data/processed/dataset">
          <div className="flex flex-col">
            <Typography variant="stats_h3">{datasets}</Typography>
            <Typography variant="stats_sub">Datasets</Typography>
          </div>
        </Link>
        {Object.entries(entities).map(([type, count]) => (
          <Link href={`/data/processed/${type}`}>
            <div key={type} className="flex flex-col">
              <Typography variant="stats_h3">{count}</Typography>
              <Typography variant="stats_sub">{pluralize(capitalize(type))}</Typography>
            </div>
          </Link>
        ))}
        {Object.entries(sets).map(([type, count]) => {
          const [entityType, _, termType] = type.split('/')
          return (
            <Link href={`/data/processed/${type}`}>
              <div key={type} className="flex flex-col">
                <Typography variant="stats_h3">{count}</Typography>
                <Typography variant="stats_sub">{pluralize(capitalize(`${termType} ${entityType} set`))}</Typography>
              </div>
            </Link>
          )
        })}
      </Grid>
    </Container>
  )
}
