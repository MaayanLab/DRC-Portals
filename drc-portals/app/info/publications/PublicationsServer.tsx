
import Typography from '@mui/material/Typography'
import { Prisma } from "@prisma/client"
import prisma from '@/lib/prisma'
import PublicationsClient from "./PublicationsClient"
import PublicationComponent from "@/components/misc/Publication/PublicationComponent"
import { Grid } from '@mui/material'
export interface queryJson {
  order?: {
      field: Prisma.PublicationScalarFieldEnum, 
      ordering: 'asc'|'desc'
  },
  where?: Prisma.PublicationWhereInput,
  include?: Prisma.PublicationInclude,
  take?:number,
  skip?: number,
}

export default async function PublicationsServer({
  searchParams,
}: 
{
  searchParams?: {
    q?: string
  }
}) {
  const q:queryJson = JSON.parse((searchParams || {}).q || '{}')
    const { 
      where, 
      include,
      order={
        field: "year",
        ordering: "desc",
      },
      // take=10,
      skip
    } = q


    const count = await prisma.publication.count()
    const dccs = await prisma.dCC.findMany()
    const publications = await prisma.publication.findMany({
      where,
      orderBy: [
        {
          [order.field]: order.ordering
        }
      ],
      take: count,
      skip: skip || 0,
      include: {
        dccs: {
          include: {
            dcc: true
          }
        },
        r03s: {
          include: {
            r03: true
          }
        },
        centers: {
          include: {
            center: true
          }
        },
      },
    })
    return (
        <Grid container spacing={2} sx={{mt: 2}}>
          <Grid item xs={12} sx={{marginBottom:4}}>
            <Typography variant="h2" color="secondary">CFDE Associated and Common Fund Programs’ Landmark Publications</Typography>
          </Grid> 
          <Grid item xs={12}>
              <PublicationComponent publications={publications}/>
            </Grid>
        </Grid>
    )
  }

