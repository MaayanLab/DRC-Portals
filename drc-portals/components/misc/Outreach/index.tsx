import React from "react"
import Link from "next/link"
import Image from "next/image"
import Divider from '@mui/material/Divider'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

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
import { parseAsJson } from 'next-usequerystate';

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


export interface OutreachParams {
  type?: Array<'outreach'|'training'>,
  tags?: Array<string>,
  expand_filter?: boolean,
  events?: Array<'past'| 'active' | 'recurring'>
}

const OutreachComponent = ({outreach, past=false, filter={}, now, expand_filter}: {
  outreach: OutreachType[], 
  featured: Boolean,
  orientation?: 'horizontal' | 'vertical',
  now: Date,
  past?: Boolean,
  filter?: OutreachParams,
  expand_filter: boolean,
}) =>(
  <Box sx={{ minHeight: 100 }}>
    <MasonryClient defaultHeight={1500} columns={expand_filter ? 2: 3}>
      {outreach.map((e,i)=>{
        let tags:JsonArray = []
        if (Array.isArray(e.tags)) {
          tags = e.tags
        }
        return (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                { (e.image) && 
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
                <div className="flex flex-row mb-5">
                  {tags.map((tag, i)=> {
                    const new_filter = filter
                    new_filter.tags = [`${tag}`]
                    return (
                      <Link href={`/info/training_and_outreach?filter=${JSON.stringify(new_filter)}`}>
                        <Chip variant="filled" sx={{ textTransform: "capitalize", background: tag === "internship"? "#7187C3": "#EDF0F8", color: tag === "internship"?"#FFF":"#29527A", minWidth: 150, borderRadius: 2}} key={i} label={tag?.toString()}/>
                      </Link>
                    )
                  })}
                </div>
                <Typography color="secondary" variant="h5">{e.title}</Typography>
                <Box sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '5',
                                        WebkitBoxOrient: 'vertical',
                }}>
                  <Markdown markdown={e.short_description}/>
                </Box>
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
                <Grid container justifyContent={"space-between"}>
                  <ExportCalendar event={e} />
                  <Grid item>
                    <Link href={e.link || ''} target="_blank" rel="noopener noreferrer">
                      <Button  color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />}>VISIT PAGE</Button>
                    </Link>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        )
      })}
      </MasonryClient>
    </Box>
)

const type_tags = {
  training: ["fellowship", "workshop", "internship", "course"],
  outreach: ["webinar", "office hours", "face to face meeting", "competition", "conference", "use-a-thon"]
}


async function Outreach({featured=true, orientation='horizontal', size=2, searchParams}:{
  featured?: Boolean,
  active?: Boolean,
  orientation?: 'horizontal' | 'vertical',
  size?: number,
  searchParams?: {
    filter?: string
  },
  type?: 'outreach' | 'training'
}) {
    const now = new Date()
    
    const query_parser = parseAsJson<OutreachParams>().withDefault({type: ['outreach', 'training'], expand_filter: true, events: ['active', 'recurring']})
    const parsedParams: OutreachParams = query_parser.parseServerSide(searchParams?.filter)
    const {tags, type, expand_filter, events=[]} = parsedParams

    let distinct_tags =(type && type.length > 0 ) ? type.reduce((acc:Array<string>, i:'outreach'|'training')=>([...acc, ...type_tags[i]]),[]): [...type_tags.outreach, ...type_tags.training]
    const type_filter = type ? type.reduce((acc:Array<string>, i:'outreach'|'training')=>([...acc, ...type_tags[i]]),[]).map(tag=>({tags: {
      path: [],
      array_contains: tag
    }})): []
    const tag_filter = tags? tags.map(tag=>({tags: {
      path: [],
      array_contains: tag
    }})): []

    const where_tags = []
    if (type_filter.length) where_tags.push({OR: type_filter})
    if (tag_filter.length) where_tags.push({OR: tag_filter})
    const current = (events && (events.length === 0 || events.indexOf('active') > -1)) ? await prisma.outreach.findMany({
      where: {
        active: true,
        AND: [
          // date filters
          {
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
                application_start: {
                  gte: now
                },
                end_date: null,
                start_date: null,
              },
            ]
          },
          ...where_tags,
        ],
        
      },
      orderBy: {
        start_date: { sort: 'desc', nulls: 'last' }
      }
    }): []

    const recurring = (events && (events.length === 0 || events.indexOf('recurring') > -1)) ?  await prisma.outreach.findMany({
      where: {
        active: true,
        end_date: null,
        start_date: null,
        application_start: null,
        AND: where_tags.length ? where_tags: undefined,
      },
      orderBy: {
        start_date: { sort: 'desc', nulls: 'last' }
      }
    }): []
    
    const past = (events && (events.length === 0 || events.indexOf('past') > -1)) ? await prisma.outreach.findMany({
      where: {
        AND: [
          {
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
                end_date: null,
                application_start: {
                  lte: now
                }
              },
            ],
          },
          ...where_tags
        ],
      },
      orderBy: {
        start_date: { sort: 'desc', nulls: 'last' }
      }
    }): []
    return (
      <Grid container spacing={1} sx={{marginTop: 2}}>
        {expand_filter && <Grid item xs={12} sm={3}>
          <Link href={`/info/training_and_outreach?filter=${JSON.stringify({type, tags, expand_filter: !(expand_filter)})}`}>
            <Button variant="outlined" color="secondary">
              Collapse Filter
            </Button>
          </Link>
          <Paper sx={{background: "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)", height: '100%', padding: "12px 24px", marginTop: 1 }} elevation={0}>
            <Stack spacing={1}>
              <Typography variant={'body1'}><b>Event Type</b></Typography>
              <FormGroup>
                <FormControlLabel control={
                  <Link href={`/info/training_and_outreach?filter={"expand_filter": ${expand_filter}, "events": ${JSON.stringify(events)}, "type": ${JSON.stringify( (type && type.indexOf('outreach') > -1) ? type.filter(t=>t!=='outreach'): [...(type || []), 'outreach'])}}`}>
                    <Checkbox checked={(type && (type).indexOf('outreach') > -1)}/>
                  </Link>} label="Outreach" />
                <FormControlLabel control={
                  <Link href={`/info/training_and_outreach?filter={"expand_filter": ${expand_filter}, "events": ${JSON.stringify(events)},"type": ${JSON.stringify( (type && type.indexOf('training') > -1) ? type.filter(t=>t!=='training'): [...(type || []), 'training'])}}`}>
                    <Checkbox checked={(type && (type).indexOf('training') > -1)}/>
                  </Link>} label="Training" />
              </FormGroup>
              <Typography variant={'body1'}><b>Event Status</b></Typography>
                <FormGroup>
                  <FormControlLabel control={
                    <Link href={`/info/training_and_outreach?filter=${JSON.stringify({expand_filter, type, tags, events: (events && events.indexOf('active') > -1) ? events.filter(i=>i!== 'active'): [...(events || []), 'active']})}`}>
                      <Checkbox checked={(events && (events).indexOf('active') > -1)}/>
                    </Link>} label="Active" />
                    <FormControlLabel control={
                    <Link href={`/info/training_and_outreach?filter=${JSON.stringify({expand_filter, type, tags, events: (events && events.indexOf('recurring') > -1) ? events.filter(i=>i!== 'recurring'): [...(events || []), 'recurring']})}`}>
                      <Checkbox checked={(events && (events).indexOf('recurring') > -1)}/>
                    </Link>} label="Recurring" />
                    <FormControlLabel control={
                    <Link href={`/info/training_and_outreach?filter=${JSON.stringify({expand_filter, type, tags, events: (events && events.indexOf('past') > -1) ? events.filter(i=>i!== 'past'): [...(events || []), 'past']})}`}>
                      <Checkbox checked={(events && (events).indexOf('past') > -1)}/>
                    </Link>} label="Past" />
                </FormGroup>
              <Typography variant={'body1'}><b>Event Tag</b></Typography>
                <FormGroup>
                  {distinct_tags.map((tag)=>(
                    <FormControlLabel key={`${tag}`} control={
                      <Link href={`/info/training_and_outreach?filter={"expand_filter": ${expand_filter}, "events": ${JSON.stringify(events)}, "type": ${JSON.stringify(type)}, "tags": ${JSON.stringify((tags && tags.indexOf(String(tag)) > -1) ? tags.filter(t=>t!==tag): [...(tags || []), String(tag)])}}`}>
                        <Checkbox checked={(tags && (tags).indexOf(String(tag)) > -1)}/>
                      </Link>} label={`${tag}`} />
                  ))}
                </FormGroup>
            </Stack>
          </Paper>
        </Grid>
        }
        <Grid item xs={12} sm={expand_filter ? 9:12}>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justifyContent={"space-between"}>
                <Grid item sx={{height: 50}}>
                  { !expand_filter && <Link href={`/info/training_and_outreach?filter=${JSON.stringify({type, tags, expand_filter: !(expand_filter)})}`}>
                    <Button variant="outlined" color="secondary">
                      Expand Filter
                    </Button>
                  </Link>
                  }
                </Grid>
                <Grid item>
                  {tags && tags.map(tag=>(
                    <Link key={tag} href={'/info/training_and_outreach'}>
                      <Chip variant="filled" 
                        sx={{ background: tag === "internship"? "#7187C3": "#EDF0F8", 
                          color: tag === "internship"?"#FFF":"#29527A", 
                          minWidth: 150, borderRadius: 2, textTransform: 'capitalize', marginLeft: 1}} 
                          label={tag?.toString()}
                          icon={<DeleteIcon color={tag === "internship" ? "primary": "secondary"}/>}
                        />
                    </Link>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          {(current.length) > 0 && 
            <>
              <Grid item xs={12}>
                <Typography variant="h3" color="secondary" sx={{marginBottom: 1}}>
                  Active Events
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <OutreachComponent now={now} outreach={current} featured={featured} orientation={orientation} filter={parsedParams} expand_filter={expand_filter || false}/>
              </Grid>
            </>
          }
          {(recurring.length) > 0 && 
            <>
              <Grid item xs={12}>
                <Typography variant="h3" color="secondary" sx={{marginBottom: 1}}>
                  Recurring Events
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <OutreachComponent now={now} outreach={recurring} featured={featured} orientation={orientation} filter={parsedParams} expand_filter={expand_filter || false}/>
              </Grid>
            </>
          }
          {past.length > 0 && 
            <>
              <Grid item xs={12}>
                <Typography variant="h3" color="secondary" sx={{marginBottom: 1}}>
                  Past Events
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <OutreachComponent now={now} outreach={past} featured={featured} orientation={orientation} past={true} filter={parsedParams} expand_filter={expand_filter || false}/>
              </Grid>
            </>
        }
        {(past.length === 0 && current.length === 0 && recurring.length === 0)  &&
          <Grid item xs={12} sx={{marginTop: 10}}>
            <Typography variant="body1" color="secondary" sx={{textAlign: "center"}}>
              No events found
            </Typography>
          </Grid>
        }
          </Grid>
        </Grid>
      </Grid>
    )
  }

export default Outreach