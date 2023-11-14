import Link from "next/link"
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import { PrismaClient } from "@prisma/client"
import Button from "@mui/material/Button"

const prisma = new PrismaClient()


async function Publications({all=false}: {all:boolean}) {
    let publications = []
    if (all) {
        publications = await prisma.publication.findMany({
            orderBy: [
              {
                year: 'desc'
              }
            ]
          })
    } else {
        publications = await prisma.publication.findMany({
            orderBy: [
              {
                year: 'desc'
              }
            ],
            take: 5,
          })
    }
    return (
        <Paper sx={{boxShadow: "none", height: "100%"}}>
            <Typography variant="h2" className="mb-5">Publications</Typography>
            {publications.map((pub, i)=>(
            <div key={i} style={{marginBottom: 10}}>
                <Link href={pub.doi || ''}>
                <Typography variant="caption">
                    {pub.authors}. {pub.year}. <b>{pub.title}.</b> {pub.journal}. {pub.volume}. {pub.page}
                </Typography>
                </Link>
            </div>
            ))}
            {!all && <Link href="/info/publications"><Button color="secondary" variant="outlined">Show More</Button></Link>}
        </Paper>
    )
  }

export default Publications