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

import MasonryClient from "../MasonryClient"
import Icon from '@mdi/react';
import { mdiArrowRight } from "@mdi/js"
import { Outreach as OutreachType } from "@prisma/client"
import DeleteIcon from '@mui/icons-material/Delete';
import Markdown from "../MarkdownComponent"
import ExportCalendar from "./ExportCalendar"
export const shuffle = (array: OutreachType[]) => { 
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
        <Card elevation={0}>
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
      <Grid container>
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


const OutreachComponent = ({outreach, featured, orientation, now, past=false}: {
  outreach: OutreachType[], 
  featured: Boolean,
  orientation?: 'horizontal' | 'vertical',
  now: Date,
  past?: Boolean
}) =>(
  <Box sx={{ minHeight: 100 }}>
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
                      // height: "100%",
                      minHeight: 200,
                      position: "relative",
                      zIndex: 2
                    }}
                  >
                    <Image src={e.image} alt={e.title} fill={true} style={{objectFit: "contain"}}/>
                    {/* <Image src={e.image} alt={e.title} width={400} height={300}/> */}
                  </div>
              }
              {orientation !== 'vertical' && <div className="flex flex-row mb-5">
                {tags.map((tag, i)=>
                  <Link href={`/info/outreach?tag=${tag}`}>
                    <Chip variant="filled" sx={{ textTransform: "capitalize", background: tag === "internship"? "#7187C3": "#EDF0F8", color: tag === "internship"?"#FFF":"#29527A", minWidth: 150, borderRadius: 2}} key={i} label={tag?.toString()}/>
                  </Link>
                )}
              </div>}
              <Typography color="secondary" variant="h5">{e.title}</Typography>
              <Markdown markdown={e.short_description}/>
              {orientation === 'vertical' ?
                (e.application_end && e.application_end > now) ? 
                  <Typography variant="body2" color="secondary"><b>Application deadline</b>: {`${ e.application_end > now ? e.application_end.toLocaleDateString("en-US", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }): "Passed"}`}
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
                    {(e.application_end && e.application_end > now) && <Typography variant="body2" color="secondary"><b>Application deadline:</b> {
                    `${ e.application_end > now ? e.application_end.toLocaleDateString("en-US", {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      }): "Passed"}`
                    }
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
              <Grid container justifyContent={"space-between"}>
                <Grid item>
                  {(!featured && !past && (e.start_date || e.application_start)) && <ExportCalendar event={e} />}
                </Grid>
                <Grid item>
                  <Link href={e.link || ''} target="_blank" rel="noopener noreferrer">
                    <Button sx={featured && {marginLeft: -2}} color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />}>VISIT PAGE</Button>
                  </Link>
                </Grid>
              </Grid>
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


async function Outreach({featured=true, orientation='horizontal', size=2, searchParams}:{
  featured?: Boolean,
  active?: Boolean,
  orientation?: 'horizontal' | 'vertical',
  size?: number,
  searchParams?: {tag: string}
}) {
    const now = new Date()
    if (featured) {
      let outreach = await prisma.outreach.findMany({
        where: {
          active: true,
          featured: true,
          OR: [
            {
              end_date: {
                gte: now
              }
            },
            {
              end_date: null
            }
          ],
        },
        orderBy: {
          start_date: { sort: 'desc', nulls: 'last' },
        }
      })
      outreach = shuffle(outreach).slice(0,size)
      return <OutreachComponent now={now} outreach={outreach} featured={featured} orientation={orientation}/>
    } else {
      const now = new Date()
      const tag_filter:{tags?: {
        path: [],
        array_contains: string
      }} = {}
      if (searchParams && searchParams.tag) {
        tag_filter.tags =  {
            path: [],
            array_contains: searchParams.tag
        }
      }
      const featured_events = await prisma.outreach.findMany({
        where: {
          active: true,
          featured: true,
          OR: [
            {
              end_date: {
                gte: now
              }
            },
            {
              end_date: null,
              start_date: {
                gte: now
              }
            }
          ],
          ...tag_filter
        },
        orderBy: {
          start_date: { sort: 'asc', nulls: 'last' }
        }
      })
      const current = await prisma.outreach.findMany({
        where: {
          active: true,
          OR: [
            {
              end_date: {
                gte: now
              }
            },
            {
              end_date: null,
              start_date: {
                gte: now
              }
            },
            {
              end_date: null,
              start_date: null,
              application_start: null
            },
            {
              application_start: {
                gte: now
              },
              end_date: null,
              start_date: null,
            }
          ],
          ...tag_filter
        },
        orderBy: {
          start_date: { sort: 'desc', nulls: 'last' }
        }
      })
      
      const past = await prisma.outreach.findMany({
        where: {
          OR: [
            {
              end_date: {
                lt: now
              }
            },
            {
              end_date: null,
              start_date: {
                lt: now
              }
            },
            {
              start_date: null,
              application_start: {
                lte: now
              }
            }
          ],
          ...tag_filter
        },
        orderBy: {
          start_date: { sort: 'desc', nulls: 'last' }
        }
      })
      return (
        <Grid container spacing={1} sx={{marginTop: 2}}>
          {(searchParams && searchParams.tag) && 
            <Grid item xs={12} sx={{textAlign: 'right'}}>
              <Link href={'/info/outreach'}>
                <Chip variant="filled" 
                  sx={{ background: searchParams.tag === "internship"? "#7187C3": "#EDF0F8", 
                    color: searchParams.tag === "internship"?"#FFF":"#29527A", 
                    minWidth: 150, borderRadius: 2, textTransform: 'capitalize'}} 
                    label={searchParams.tag?.toString()}
                    icon={<DeleteIcon color={searchParams.tag === "internship" ? "primary": "secondary"}/>}
                  />
              </Link>
            </Grid>
          }
          {(current.length + featured_events.length) > 0 && 
            <>
              <Grid item xs={12}>
                <Typography variant="h3" color="secondary">
                  Active Outreach Events
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <OutreachComponent now={now} outreach={[...featured_events, ...current]} featured={featured} orientation={orientation}/>
              </Grid>
            </>
          }
          {past.length > 0 && 
            <>
              <Grid item xs={12}>
                <Typography variant="h3" color="secondary">
                  Past Outreach Events
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <OutreachComponent now={now} outreach={past} featured={featured} orientation={orientation} past={true}/>
              </Grid>
            </>
        }
        {(past.length === 0 && current.length === 0 && featured_events.length === 0)  &&
          <Grid item xs={12} sx={{marginTop: 10}}>
            <Typography variant="body1" color="secondary" sx={{textAlign: "center"}}>
              No events found
            </Typography>
          </Grid>

        }
        </Grid>
      )
    }

  }

export default Outreach