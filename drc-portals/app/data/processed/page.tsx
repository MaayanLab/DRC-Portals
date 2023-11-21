import prisma from "@/lib/prisma";
import { Container, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { capitalize, pluralize } from "@/app/data/processed/utils"
import SearchField from "@/app/data/processed/SearchField";

export default async function Page() {
  const counts = await prisma.xIdentity.groupBy({
    by: ['type'],
    _count: true,
    orderBy: {
      type: 'desc',
    },
  })
  return (
    <Container component="form" action="/data/processed/search" method="GET" className="text-center">
      <SearchField q={''} />
      <Grid item xs={12} className="grid grid-cols-3 justify-center gap-4">
        {counts.map(count => {
          const type_split = count.type.split('/')
          let name = count.type
          if (type_split.length === 1) {
            name = pluralize(capitalize(count.type))
          } else if (type_split.length === 3) {
            name = pluralize(capitalize(`${type_split[2]} ${type_split[0]} ${type_split[1]}`))
          }
          return (
            <Link key={count.type} href={`/data/processed/${count.type}`}>
              <div className="flex flex-col">
                <Typography variant="stats_h3">{count._count}</Typography>
                <Typography variant="stats_sub">{name}</Typography>
              </div>
            </Link>
          )
        })}
      </Grid>
    </Container>
  )
}
