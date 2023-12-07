import Link from "next/link"
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import { Prisma } from "@prisma/client"

import prisma from '@/lib/prisma'
import PublicationsClient from "./PublicationsClient"
import PublicationComponent from "@/components/misc/PublicationComponent"
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
      take=10,
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
      take: take,
      skip: skip || 0,
      include: {
        dccs: {
          include: {
            dcc: true
          }
        },
        ...include
      },
    })
    return (
        <Paper sx={{boxShadow: "none", height: "100%"}}>
            <Typography variant="h2" color="secondary">CFDE Associated Publications</Typography>
            <div className="mb-5">
              <Typography variant="subtitle1" color="secondary">
                The publications listed here are automatically extracted from PubMed based on grants awarded to the Common Fund Data Ecosystem (CFDE) Participating Common Fund programs’ DCCs and CFDE awarded R03s.
              </Typography>
            </div>
            <PublicationsClient count={count} q={q} dccs={dccs.map(i=>i.short_label || '')}>
              <PublicationComponent publications={publications} chipped={true}/>
            </PublicationsClient>
        </Paper>
    )
  }

