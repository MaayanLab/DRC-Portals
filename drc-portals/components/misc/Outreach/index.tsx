import React from "react"
import Link from "@/utils/link"
import Image from "next/image"
import Divider from '@mui/material/Divider'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import FormGroup from '@mui/material/FormGroup';

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
import Markdown from "../MarkdownComponent"
import ExportCalendar from "./ExportCalendar"
import { parseAsJson } from 'next-usequerystate';
import { Prisma } from "@prisma/client"
import { Tooltip, IconButton, Avatar, CardActions } from "@mui/material"
import { ClientCheckbox } from "./ClientCheckBox"
import dynamic from "next/dynamic"
const ClientExpander = dynamic(()=>(import('./ClientExpander')), {ssr: false})
export type OutreachWithDCC = Prisma.OutreachGetPayload<{
  include: {
      dccs: {
        include: {
          dcc: true
        }
      }
  }
}>

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
  type: Array<string>,
  tags: Array<string>,
  expand_filter?: boolean,
  status: Array<string>,
  cfde_specific?: boolean,
  past_limit?: number
}

const same_date = (start_date:Date|null, end_date:Date|null) => {
  if (!start_date || ! end_date) return false
  return start_date.getFullYear() === end_date.getFullYear() &&
    start_date.getMonth() === end_date.getMonth() &&
    start_date.getDate() === end_date.getDate();
}

const OutreachComponent = ({outreach, filter, now, expand_filter=false, past_count, past_limit}: {
  outreach: OutreachWithDCC[], 
  featured: Boolean,
  orientation?: 'horizontal' | 'vertical',
  now: Date,
  past_count?: number,
  past_limit?: number,
  filter?: OutreachParams,
  expand_filter: boolean,
}) =>(
  <Box sx={{ minHeight: 100, textAlign: "center" }}>
    <MasonryClient defaultHeight={1500} columns={expand_filter ? 2: 3}>
      {outreach.map((e,i)=>{
        let tags:JsonArray = []
        if (Array.isArray(e.tags)) {
          tags = e.tags
        }
        return (
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <div className="flex items-center gap-1">
                  {e.start_date  &&
                    <Paper elevation={0} sx={{backgroundColor: "#EDF0F8", color: "secondary.main",  minWidth: 65, padding: 1}}>
                      <Typography variant="caption">{e.start_date.toLocaleString('default', { month: 'short' })}</Typography>
                      <Typography variant="h4">{e.start_date.toLocaleString('default', { day: '2-digit' })}</Typography>
                      <Typography variant="caption">{e.start_date.toLocaleString('default', { year: 'numeric' })}</Typography>
                    </Paper>
                  }
                  {(e.end_date && !same_date(e.start_date, e.end_date))  && 
                    <Paper elevation={0} sx={{backgroundColor: "secondary.main", color: "#EDF0F8", minWidth: 65, padding: 1}}>
                      <Typography variant="caption">{e.end_date.toLocaleString('default', { month: 'short' })}</Typography>
                      <Typography variant="h4">{e.end_date.toLocaleString('default', { day: '2-digit' })}</Typography>
                      <Typography variant="caption">{e.end_date.toLocaleString('default', { year: 'numeric' })}</Typography>
                    </Paper>
                  }
                  {(e.start_date && e.end_date && same_date(e.start_date, e.end_date))  && 
                    <Paper elevation={0} sx={{backgroundColor: "secondary.main", color: "#EDF0F8", minWidth: 65, padding: 1}}>
                      <Typography variant="h5">{e.start_date.toLocaleString('default', { hour: 'numeric', hour12: true, minute: 'numeric', timeZone: "America/New_York"})}</Typography>
                      <Typography variant="body1">to</Typography>
                      <Typography variant="h5">{e.end_date.toLocaleString('default', { hour: 'numeric', hour12: true, minute: 'numeric', timeZone: "America/New_York"})} ET</Typography>
                    </Paper>
                  }
                </div>
                { (e.image) && 
                    <div className="flex flex-row justify-center"
                      style={{
                        overflow: "hidden",  
                        // height: "100%",
                        minHeight: 150,
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
                    const new_filter = {tags: [], ...filter }
                    new_filter.tags = [`${tag}`]
                    return (
                      <Link href={`/info/training_and_outreach?filter=${JSON.stringify(new_filter)}`}>
                        <Chip variant="filled" sx={{ textTransform: "capitalize", backgroundColor: tag === "internship"? "tertiary.main": "primary.main", color: tag === "internship"?"#FFF":"secondary.main", minWidth: 150, borderRadius: 2}} key={i} label={tag?.toString()}/>
                      </Link>
                    )
                  })}
                </div>
                <Typography color="secondary" variant="h5">{e.title}</Typography>
                <Markdown markdown={e.short_description}/>
                {e.dccs.length > 0 && 
                    <div className="flex items-center gap-1">
                      <div><Typography variant="body2" color="secondary"><b>Hosted by:</b></Typography></div>
                      
                              {e.dccs.map(({dcc})=>(
                                  <div key={dcc.short_label} className="flex items-center justify-center relative">
                                      <Link href={`/info/dcc/${dcc.short_label}`}>
                                          <Tooltip title={dcc.short_label}>
                                              <IconButton sx={{minHeight: ["Metabolomics", "GTEx", "LINCS"].indexOf(dcc.short_label || '') === -1 ? 70: 40, minWidth: ["Metabolomics", "GTex"].indexOf(dcc.short_label || '') === -1 ? 60: 40}}>
                                                  {dcc.icon ? 
                                                      <Image src={dcc.icon || ''} alt={dcc.id} fill={true} style={{objectFit: "contain"}}/>:
                                                      <Avatar>{dcc.label[0]}</Avatar>
                                                  }
                                              </IconButton>
                                          </Tooltip>
                                      </Link>
                                  </div>
                              ))}
                    </div>
                  }
                
                  {(e.application_start && e.application_start  > now)&& <Typography variant="body2" color="secondary"><b>Application opens:</b> {`${e.application_start.toLocaleDateString("en-US", {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}`}
                    </Typography>}
                    {(e.application_end && e.application_end > now) && <Typography variant="body2" color="secondary"><b>Application deadline:</b> {
                    `${ e.application_end > now ? e.application_end.toLocaleDateString("en-US", {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      }): "Passed"}`
                    }
                    </Typography>}
              </Stack>
            </CardContent>
            <CardActions>
                <ExportCalendar event={e} />
                {(e.link || '' ).indexOf('https') > -1 ?
                <Link href={e.link || ''} target="_blank" rel="noopener noreferrer">
                  <Button  color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />}>VISIT PAGE</Button>
                </Link>:
                <Link href={e.link || ''}>
                  <Button  color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />}>VISIT PAGE</Button>
                </Link>
                }
            </CardActions>
          </Card>
        )
      })}
      </MasonryClient>
      {(past_limit && past_count && past_limit < past_count) && <Button variant="outlined" color="secondary">
          <Link href={`/info/training_and_outreach?filter=${JSON.stringify({...filter, past_limit: past_limit + 5})}`}>
            <Typography variant="body1">See More</Typography>
          </Link>
        </Button>}
    </Box>
)

const type_tags = (type: string) => {
  if (type === "training") return ["fellowship", "workshop", "internship", "course", "training program"]
  else if (type === "outreach") return ["webinar", "office hours", "face to face meeting", "competition", "conference", "use-a-thon", "hackathon", "symposium"]
  else return []
}


async function Outreach({featured=true, orientation='horizontal', searchParams}:{
  featured?: Boolean,
  active?: Boolean,
  orientation?: 'horizontal' | 'vertical',
  searchParams?: {
    filter?: string
  },
  type?: 'outreach' | 'training'
}) {
    const now = new Date()
    
    const query_parser = parseAsJson<OutreachParams>().withDefault({type: ['outreach', 'training'], tags:[], expand_filter: false, status: ['active', 'recurring', 'past'], cfde_specific: false, past_limit: 5})
    const parsedParams: OutreachParams = query_parser.parseServerSide(searchParams?.filter)
    const {tags, type, expand_filter, status=['active', 'recurring', 'past'], cfde_specific, past_limit=5} = parsedParams
    let distinct_tags =(type && type.length > 0 ) ? type.reduce((acc:Array<string>, i:string)=>([...acc, ...type_tags(i)]),[]): [...type_tags('outreach'), ...type_tags('training')]
    const type_filter = type ? type.reduce((acc:Array<string>, i:string)=>([...acc, ...type_tags(i)]),[]).map(tag=>({tags: {
      path: [],
      array_contains: tag
    }})): []
    const tag_filter = tags? tags.map(tag=>({tags: {
      path: [],
      array_contains: tag
    }})): []

    const where_tags = []
    if (cfde_specific) where_tags.push({cfde_specific: true})
    if (type_filter.length) where_tags.push({OR: type_filter})
    if (tag_filter.length) where_tags.push({OR: tag_filter})
    const current = (status && (status.length === 0 || status.indexOf('active') > -1)) ? await prisma.outreach.findMany({
      include: {
        dccs: {
            include: {
                dcc: true
            }
        }
      },
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
      orderBy: [
        {
          end_date: { sort: 'asc', nulls: 'last' }
        },
        {
          start_date: { sort: 'asc', nulls: 'last' }
        }
      ] 
    }): []

    const recurring = (status && (status.length === 0 || status.indexOf('recurring') > -1)) ?  await prisma.outreach.findMany({
      where: {
        active: true,
        end_date: null,
        start_date: null,
        application_start: null,
        AND: where_tags.length ? where_tags: undefined,
      },
      orderBy: {
        start_date: { sort: 'desc', nulls: 'last' }
      },
      include: {
        dccs: {
            include: {
                dcc: true
            }
        }
      },
    }): []
    const r = await prisma.outreach.findMany({
      where: {
        active: true,
        end_date: null,
        start_date: null,
        application_start: null,
        AND: where_tags.length ? where_tags: undefined,
      },
      orderBy: {
        start_date: { sort: 'desc', nulls: 'last' }
      },
      include: {
        dccs: {
            include: {
                dcc: true
            }
        }
      },
    })

    const past_count = await prisma.outreach.count({
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
      }
    })
    
    const past = (status && (status.length === 0 || status.indexOf('past') > -1)) ? await prisma.outreach.findMany({
      take: past_limit,
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
      },
      include: {
        dccs: {
            include: {
                dcc: true
            }
        }
      },
    }): []
    return (
      <ClientExpander>
        <Grid container spacing={1} sx={{marginTop: 2}}>
          {expand_filter && <Grid item xs={12} sm={3}>
            <Link href={`/info/training_and_outreach?filter=${JSON.stringify({...parsedParams, expand_filter: !(expand_filter)})}`}>
              <Button variant="outlined" color="secondary">
                Collapse Filter
              </Button>
            </Link>
            <Paper sx={{background: "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)", height: '100%', padding: "12px 24px", marginTop: 1 }} elevation={0}>
              <Stack spacing={1}>
                <Typography variant={'body1'}><b>Type</b></Typography>
                <FormGroup>
                  <ClientCheckbox query_key="type" value='outreach' label="Outreach"/>
                  <ClientCheckbox query_key="type" value='training' label="Training"/>
                  <ClientCheckbox query_key="cfde_specific" value={'cfde_specific'} label="CFDE specific activity"/>
                </FormGroup>
                <Typography variant={'body1'}><b>Status</b></Typography>
                  <FormGroup>
                    <ClientCheckbox query_key="status" value='active' label="Active"/>
                    <ClientCheckbox query_key="status" value='recurring' label="Recurring"/>
                    <ClientCheckbox query_key="status" value='past' label="Past"/>
                  </FormGroup>
                <Typography variant={'body1'}><b>Tag</b></Typography>
                  <FormGroup>
                    {distinct_tags.map((tag)=>(
                      <ClientCheckbox key={tag} query_key="tags" value={tag} label={tag}/>
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
                    { !expand_filter && <Link href={`/info/training_and_outreach?filter=${JSON.stringify({...parsedParams, expand_filter: !(expand_filter)})}`}>
                      <Button variant="outlined" color="secondary">
                        Expand Filter
                      </Button>
                    </Link>
                    }
                  </Grid>
                  <Grid item>
                    <Typography>Showing {current.length + recurring.length + past.length} results.</Typography>
                  </Grid>
                </Grid>
              </Grid>
            {(current.length) > 0 && 
              <>
                <Grid item xs={12}>
                  <Typography variant="h3" color="secondary" sx={{marginBottom: 1}}>
                    Active
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
                    Recurring
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
                    Past
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <OutreachComponent now={now} outreach={past} featured={featured} orientation={orientation} filter={parsedParams} expand_filter={expand_filter || false} past_count={past_count} past_limit={past_limit}/>
                </Grid>
              </>
          }
          {(past.length === 0 && current.length === 0 && recurring.length === 0)  &&
            <Grid item xs={12} sx={{marginTop: 10}}>
              <Typography variant="body1" color="secondary" sx={{textAlign: "center"}}>
                No records found
              </Typography>
            </Grid>
          }
            </Grid>
          </Grid>
        </Grid>
      </ClientExpander>
    )
  }

export default Outreach