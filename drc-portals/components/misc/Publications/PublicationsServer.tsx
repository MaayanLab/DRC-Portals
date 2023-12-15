import Link from "next/link"
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import { Prisma } from "@prisma/client"

import prisma from '@/lib/prisma'
import PublicationsClient from "./PublicationsClient"

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
  all,
  searchParams,
}: 
{
  all: boolean,
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
      take=all?10:5,
      skip
    } = q
    const count = await prisma.publication.count()
    const dccs = await prisma.dCC.findMany()
    // const dccs = await prisma.dCC.findMany({
    //   where: {
    //     publications: {
    //       some: {}
    //     }
    //   }
    // })
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
            <Typography variant="h2" color="secondary">Publications</Typography>
            {all &&
              <div className="mb-5">
                <Typography variant="subtitle1" color="secondary">
                  The publications listed here are automatically extracted from PubMed based on grants awarded to the Common Fund Data Ecosystem (CFDE) Participating Common Fund programs’ DCCs and CFDE awarded R03s.
                </Typography>
              </div>
            }
            <PublicationsClient count={count} all={all} q={q} dccs={dccs.map(i=>i.short_label || '')}>
              {publications.map((pub, i)=>(
              <div key={i} className="mb-2 space-x-1">
                  <Typography color="secondary" variant="caption">
                      {pub.authors}. {pub.year}. <b>{pub.title}.</b> {pub.journal}. {pub.volume}. {pub.page}
                  </Typography>
                  { all &&
                  <div className="flex space-x-2">
                    { pub.pmid && 
                      <Link target="_blank" rel="noopener noreferrer" href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}>
                        <Chip color="secondary" variant="outlined" label={"PubMed"} sx={{minWidth: 100}}/>
                      </Link>
                    }
                    { pub.pmcid && 
                      <Link target="_blank" rel="noopener noreferrer" href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${pub.pmcid}/`}>
                        <Chip color="secondary" variant="outlined"  label={"PMC"} sx={{minWidth: 100}}/>
                      </Link>
                    }
                    { pub.doi && 
                      <Link target="_blank" rel="noopener noreferrer" href={`https://www.doi.org/${pub.doi}`}>
                        <Chip color="secondary" variant="outlined" label={"DOI"} sx={{minWidth: 100}}/>
                      </Link>
                    }
                  </div>
                  }
              </div>
              ))}
            </PublicationsClient>
            {!all && <Link href="/info/publications"><Button color="secondary" variant="outlined">Show More</Button></Link>}
        </Paper>
    )
  }

