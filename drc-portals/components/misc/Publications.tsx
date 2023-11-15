import Link from "next/link"
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"

import prisma from '@/lib/prisma'


async function Publications({all=false}: {all:boolean}) {
    let publications = []
    if (all) {
        publications = await prisma.publication.findMany({
            orderBy: [
              {
                year: 'desc'
              }
            ],
            include: {
              dccs: {
                include: {
                  dcc: true
                }
              }
            },
          })
    } else {
        publications = await prisma.publication.findMany({
            orderBy: [
              {
                year: 'desc'
              }
            ],
            include: {
              dccs: {
                include: {
                  dcc: true
                }
              }
            },
            take: 5,
          })
    }
    return (
        <Paper sx={{boxShadow: "none", height: "100%"}}>
            <Typography variant="h2">Publications</Typography>
            {all &&
              <div className="mb-5">
                <Typography variant="subtitle1">
                  Discover and cite publications from the Common Fund Data Ecosystem Programs, Data Coordination Centers and community.
                </Typography>
              </div>
            }
            {publications.map((pub, i)=>(
            <div key={i} className="mb-2 space-x-1">
                <Typography variant="caption">
                    {pub.authors}. {pub.year}. <b>{pub.title}.</b> {pub.journal}. {pub.volume}. {pub.page}
                </Typography>
                { all &&
                <>
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
                </>
                }
            </div>
            ))}
            {!all && <Link href="/info/publications"><Button color="secondary" variant="outlined">Show More</Button></Link>}
        </Paper>
    )
  }

export default Publications