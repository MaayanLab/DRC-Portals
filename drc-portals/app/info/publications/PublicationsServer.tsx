
import Typography from '@mui/material/Typography'
import { Prisma } from "@prisma/client"
import prisma from '@/lib/prisma'
import PublicationsClient from "./PublicationsClient"
import PublicationComponent from "@/components/misc/Publication/PublicationComponent"
import { Button, Card, CardContent, Container, Grid, Paper, Stack } from '@mui/material'
import Image from '@/utils/image'
import Link from 'next/link'
import ClientCarousel from '@/app/data/usecases/ClientCarousel'
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

type PublicationType = Prisma.PublicationGetPayload<{
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
  }
}>


const PublicationCard = ({ publication }: { publication: PublicationType }) => (
    <Paper sx={{ height: "100%", position: "relative" }} elevation={0}>
      {publication.image ? <Image src={publication.image} alt={publication.title} fill={true}
                              style={{ objectFit: "contain" }} /> :
        <Image src={'/img/favicon.png'} alt={publication.title} fill={true}
                                  style={{ objectFit: "contain" }} />
      }
    </Paper>
)

const ServerCarousel = ({ publications }: { publications: Array<PublicationType> }) => {
  return publications.map((publication, i) => (
    <Container key={i} maxWidth="lg">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={7} sx={{ display: { xs: "block", sm: "block", md: "none", lg: "none", xl: "none" } }}>
          <PublicationCard publication={publication} />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Stack direction="column"
            alignItems="flex-start"
            spacing={2}
            sx={{ height: "90%" }}
          >
            <Typography sx={{ color: "#FFF", backgroundColor: "tertiary.main", textAlign: "center", paddingLeft: 3, paddingRight: 3 }} variant="subtitle1">FEATURED</Typography>
            <Typography variant="h3" color="secondary.dark">{publication.title}</Typography>
            <Typography variant={'caption'} color="secondary">
              {publication.authors.split(",")[0]} et al.
            </Typography>
            <div className="flex space-x-1 items-center justify-end">
                  { publication.pmid ? 
                      <Link target="_blank" rel="noopener noreferrer" href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}/`}>
                          <Button variant="outlined" color="secondary">Go to article</Button>
                      </Link>:
                      publication.pmcid ? 
                      <Link target="_blank" rel="noopener noreferrer" href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${publication.pmcid}/`}>
                          <Button variant="outlined" color="secondary">Go to article</Button>
                      </Link>: publication.doi ? 
                      <Link target="_blank" rel="noopener noreferrer" href={`https://www.doi.org/${publication.doi}`}>
                          <Button variant="outlined" color="secondary">Go to article</Button>
                      </Link>: null

                  }
              </div>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={7} sx={{ display: { xs: "none", sm: "none", md: "block", lg: "block", xl: "block" } }}>
          <PublicationCard publication={publication} />
        </Grid>
      </Grid>
    </Container>
  ))
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

    const featured_publications = await prisma.publication.findMany({
      where: {
        featured: true
      },
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
          <Grid item xs={12}>
            <ClientCarousel title="" height={300}>
              <ServerCarousel publications={featured_publications} />
            </ClientCarousel>
          </Grid>
          <Grid item xs={12} sx={{marginBottom:4}}>
            {/* <Typography variant="h2" color="secondary">CFDE Associated and Common Fund Programs’ Landmark Publications</Typography> */}
            <Typography sx={{ textAlign: "center" }} variant="h2" color="secondary">CFDE Associated and Common Fund Programs’ Landmark Publications</Typography>
          </Grid> 
          <Grid item xs={12}>
              <PublicationComponent publications={publications}/>
            </Grid>
        </Grid>
    )
  }

