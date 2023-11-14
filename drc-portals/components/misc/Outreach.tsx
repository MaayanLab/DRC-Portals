import Link from "next/link"
import Image from "next/image"
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'

import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CardActions from '@mui/material/CardActions';

import { PrismaClient } from "@prisma/client"

import Grid from '@mui/material/Grid'
import { JsonArray } from "next-auth/adapters"
const prisma = new PrismaClient()

async function Outreach({featured=true}:{
  featured?: Boolean,
  active?: Boolean
}) {
    let outreach
    if (featured) {
      outreach = await prisma.outreach.findMany({
        where: {
          active: true,
          featured: true
        },
        orderBy: {
          start_date: "desc"
        }
      })
    } else {
      outreach = await prisma.outreach.findMany({
        where: {
          active: true,
        },
        orderBy: {
          start_date: "desc"
        }
      })
    }
    return (
      <Grid container direction="row" spacing={2}>
        {outreach.map((e,i)=>{
          let tags:JsonArray = []
          if (Array.isArray(e.tags)) {
            tags = e.tags
          }
          return (
            <Grid item xs={12} md={6} key={i}>
              <Card sx={{ minHeight: "100%", padding: 5 }} className="flex flex-col space-y-5">
                <Typography variant="h3">{e.title}</Typography>
                { e.image && 
                    <div className="flex flex-row justify-center"><Image src={e.image} alt={e.title} width={400} height={300}/></div>
                } 
                <CardContent className="flex flex-col grow space-y-5">
                  <div className="flex flex-row mb-5">
                    {tags.map((tag, i)=><Chip color="secondary" sx={{textTransform: "uppercase", width: 150}} key={i} label={tag?.toString()}/>)}
                  </div>
                  <Typography variant="subtitle1">{e.short_description}</Typography>
                  <Typography variant="subtitle1"><b>Date:</b> {`${e.start_date?.getFullYear()}/${e.start_date?.getMonth()}/${e.start_date?.getDate()}`}</Typography>
                </CardContent>
                <CardActions>
                  <Link href={e.link || ''} target="_blank" rel="noopener noreferrer"><Button variant="outlined" color="secondary">Visit event page</Button></Link>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
        <Grid item xs={12} sx={{textAlign: "center"}}>
          <Button variant={"contained"} color={"secondary"}>See More outreach events</Button>
        </Grid>
      </Grid>
    )
  }

export default Outreach