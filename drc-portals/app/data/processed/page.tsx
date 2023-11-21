import prisma from "@/lib/prisma";
import { Container, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { pluralize, type_to_string } from "@/app/data/processed/utils"
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
        {counts.map(count => (
          <Link key={count.type} href={`/data/processed/${count.type}`}>
            <div className="flex flex-col">
              <Typography variant="stats_h3">{count._count}</Typography>
              <Typography variant="stats_sub">{pluralize(type_to_string(count.type))}</Typography>
            </div>
          </Link>
        ))}
      </Grid>
    </Container>
  )
}
