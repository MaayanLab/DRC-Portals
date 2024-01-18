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
import Icon from '@mdi/react';
import { mdiArrowRight } from "@mdi/js"
import { Outreach } from "@prisma/client"
export const shuffle = (array: Outreach[]) => { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  return array; 
}; 

export const Wrapper = ({featured, children, orientation}: {featured: Boolean, children: React.ReactNode, orientation: 'horizontal'| 'vertical'}) => {
  if (featured) {
    if (orientation === 'vertical') {
      return (
        <Card elevation={0} sx={{borderBottom: 1, borderColor: "#B7C3E2"}}>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      )
    }
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



async function Outreach({featured=true, orientation='horizontal', size=2}:{
  featured?: Boolean,
  active?: Boolean,
  orientation?: 'horizontal' | 'vertical',
  size?: number
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
      outreach = shuffle(outreach).slice(0,size)
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
              <Wrapper key={i} featured={featured} orientation={orientation || 'horizontal'}>
                <Stack spacing={orientation === 'vertical' ? 1: 2}>
                  { (e.image && orientation == "horizontal") && 
                      <div className="flex flex-row justify-center"
                        style={{
                          background: "linear-gradient(diagonal, #336699, #006666)",
                          overflow: "hidden",
                          height: "100%",
                          zIndex: 2
                        }}
                      >
                        <Image src={e.image} alt={e.title} width={400} height={300}/>
                      </div>
                  }
                  {orientation !== 'vertical' && <div className="flex flex-row mb-5">
                    {tags.map((tag, i)=><Chip variant="filled" sx={{textTransform: "uppercase", background: tag === "internship"? "#7187C3": "#EDF0F8", color: tag === "internship"?"#FFF":"#29527A", minWidth: 150, borderRadius: 2}} key={i} label={tag?.toString()}/>)}
                  </div>}
                  <Typography color="secondary" variant="subtitle1" sx={{textTransform: "uppercase"}}>{e.title}</Typography>
                  <Typography variant="body2" color="secondary">{e.short_description}</Typography>
                  {orientation === 'vertical' ?
                    e.application_end ? 
                      <Typography variant="body2" color="secondary"><b>Application deadline</b>: {`${e.application_end.toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}`}
                      </Typography> :
                      e.start_date &&
                        <Typography variant="body2" color="secondary"><b>Starts</b>: {`${e.start_date.toLocaleDateString("en-US", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}`}
                        </Typography>
                    : <>
                      {e.application_start && <Typography variant="body2" color="secondary"><b>Application opens:</b> {`${e.application_start.toLocaleDateString("en-US", {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}`}
                        </Typography>}
                        {e.application_end && <Typography variant="body2" color="secondary"><b>Application ends:</b> {`${e.application_end.toLocaleDateString("en-US", {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                          })}`}
                        </Typography>}
                        {e.start_date && <Typography variant="body2" color="secondary"><b>Start date:</b> {`${e.start_date.toLocaleDateString("en-US", {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                          })}`}
                        </Typography>}
                        {e.end_date && <Typography variant="body2" color="secondary"><b>End date:</b> {`${e.end_date.toLocaleDateString("en-US", {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                          })}`}
                        </Typography>}
                    </>
                    
                  }
                  
                  <Link href={e.link || ''} target="_blank" rel="noopener noreferrer">
                    <Button sx={{marginLeft: -2}} color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />}>VISIT EVENT PAGE</Button>
                  </Link>
                </Stack>
              </Wrapper>
            )
          })}
          {(featured && orientation !== 'vertical') && 
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