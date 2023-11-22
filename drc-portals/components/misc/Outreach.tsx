import React from "react"
import Link from "next/link"
import Image from "next/image"
import Divider from '@mui/material/Divider'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'

import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

import { JsonArray } from "next-auth/adapters"
import prisma from '@/lib/prisma'
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"

import MasonryClient from "./MasonryClient"


const Wrapper = ({featured, children}: {featured: Boolean, children: React.ReactNode}) => {
  if (featured) {
    return <><Grid item xs={12} md={4}>{children}</Grid><Divider variant="middle" orientation="vertical" sx={{borderColor: "#EDF0F8", opacity: 0.2, marginLeft: 2, marginRight: 2}} flexItem/></>
  } else {
    return (
      <Card>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    )
  }
}

const GridView = ({featured, children}: {featured: Boolean, children: React.ReactNode[]}) => {
  if (featured) {
    return (
      <Grid container spacing="2">
        {children}
      </Grid>
    )
  } else {
    return (
      <MasonryClient defaultHeight={1500}>
        {children}
      </MasonryClient>
    )
  }
}

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
          start_date: { sort: 'desc', nulls: 'last' },
        }
      })
    } else {
      outreach = await prisma.outreach.findMany({
        where: {
          active: true,
        },
        orderBy: {
          start_date: { sort: 'desc', nulls: 'last' }
        }
      })
    }
    return (
      <Box sx={{ minHeight: 253 }}>
        <GridView featured={featured}>
          {outreach.map((e,i)=>{
            let tags:JsonArray = []
            if (Array.isArray(e.tags)) {
              tags = e.tags
            }
            return (
              <Wrapper key={i} featured={featured}>
                <Stack spacing={2}>
                  <div className="flex flex-row mb-5">
                    {tags.map((tag, i)=><Chip variant="outlined" sx={{textTransform: "uppercase", width: 150, color: "inherit"}} key={i} label={tag?.toString()}/>)}
                  </div>
                  <Typography color="inherit" variant="h3">{e.title}</Typography>
                  { e.image && 
                      <div className="flex flex-row justify-center"
                        style={{
                          background: "linear-gradient(diagonal, #336699, #006666)",
                          overflow: "hidden",
                          height: "100%",
                          zIndex: 2
                        }}
                      >
                        <Image className="grayscale" src={e.image} alt={e.title} width={400} height={300}/>
                      </div>
                  }
                  <Typography variant="subtitle1">{e.short_description}</Typography>
                  {e.application_start && <Typography variant="subtitle1"><b>Application starts:</b> {`${e.application_start.toLocaleDateString("en-US", {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}`}
                  </Typography>}
                  {e.application_end && <Typography variant="subtitle1"><b>Application ends:</b> {`${e.application_end.toLocaleDateString("en-US", {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}`}
                  </Typography>}
                  {e.start_date && <Typography variant="subtitle1"><b>Start date:</b> {`${e.start_date.toLocaleDateString("en-US", {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}`}
                  </Typography>}
                  {e.end_date && <Typography variant="subtitle1"><b>End date:</b> {`${e.end_date.toLocaleDateString("en-US", {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}`}
                  </Typography>}
                  <Link href={e.link || ''} target="_blank" rel="noopener noreferrer"><Button variant="contained" color="primary">Visit event page</Button></Link>
                </Stack>
              </Wrapper>
            )
          })}
          {featured && 
            <Paper key="box" sx={{height: 300, width: 300, position: "relative"}}>
              <Box sx={{position: "absolute", bottom: 50, left: 30}}>
                <Typography variant="h2" color="secondary">
                  Training & Outreach
                </Typography>
                <Link href="/info/outreach">
                  <Button variant="outlined" color="secondary">
                    SEE MORE
                  </Button>
                </Link>
              </Box>
            </Paper>}
          </GridView>
        </Box>
    )
  }

export default Outreach