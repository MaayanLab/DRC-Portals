import { OutreachWithDCCAndCenter } from "@/components/misc/Outreach";
import prisma from "@/lib/prisma";
import { PrismaPromise } from "@prisma/client";
import { parseAsJson } from "next-usequerystate";
import React from "react";
import { Grid, Typography } from "@mui/material";
import { JsonArray } from "next-auth/adapters"
import FilterBox from "./filter";
import { OutreachCard } from "./card";
import {PaginationComponent} from "./pagination";
export interface OutreachParams {
    search?: string,
    tags?: Array<string>,
    limit?: number,
    date?: number,
    page?: number
}



const OutreachComponent = ({outreach=[], parsedParams, now}: {
    outreach: OutreachWithDCCAndCenter[], 
    now: Date,
    parsedParams: OutreachParams,
  }) =>(
    <Grid container spacing={2}>
        {outreach.map((e,i)=>{
            let tags:JsonArray = []
            if (Array.isArray(e.tags)) {
                tags = e.tags
            }
          return (
                <Grid item xs={6} md={4} key={i}>
                    <OutreachCard e={e} parsedParams={parsedParams}/>
                </Grid>
            )
        })}
        
    </Grid>
  )
  
export default async function OutreachPage ({ searchParams }: {
    searchParams?: {
        filter?: string
    }
}) {
    
    const query_parser = parseAsJson<OutreachParams>().withDefault({tags:[], limit: 15, page: 0})
    const parsedParams = query_parser.parseServerSide(searchParams?.filter)
    const {tags=[], page} = parsedParams
    const past_limit = 6
    const cfde_specific = tags.indexOf('cfde-specific') > -1
    const now = new Date()
    const tag_filter = []
    for (const tag of tags) {
        if (tag !== 'recurring' && tag !== 'cfde-specific') {
            tag_filter.push({tags: {
                path: [],
                array_contains: tag
            }})
        }
    }

    const where_tags = []
    if (cfde_specific) where_tags.push({cfde_specific: true})
    if (tag_filter.length) where_tags.push({OR: tag_filter})
    const transactions:PrismaPromise<OutreachWithDCCAndCenter[] | number>[] = []
    transactions.push(
        prisma.outreach.findMany({
            // take: limit,
            include: {
                dccs: {
                    include: {
                        dcc: true
                    }
                },
                centers: {
                  include: {
                      center: true
                  }
                }
            },
            where: {
                active: true,
                recurring: false,
                AND: [
                // date filters
                {
                    OR: [
                    {
                        application_end: {
                        gte: now
                        }
                    },
                    {
                        application_start: {
                        gte: now
                        },
                        application_end: null
                    },
                    {
                        end_date: {
                        gte: now
                        },
                        application_end: null
                    },
                    {
                        end_date: null,
                        start_date: {
                        gte: now
                        }
                    }
                    ]
                },
                ...where_tags,
                ],
                
            },
            orderBy: [
                {
                start_date: { sort: 'asc', nulls: 'last' }
                },
                {
                end_date: { sort: 'asc', nulls: 'last' }
                },
                {
                application_end: { sort: 'asc', nulls: 'last' }
                },
            ] 
            })
    )
    transactions.push(prisma.outreach.count({
        where: {
          recurring: false,
            active: true,
            AND: [
            // date filters
            {
                OR: [
                {
                    application_end: {
                    gte: now
                    }
                },
                {
                    application_start: {
                    gte: now
                    },
                    application_end: null
                },
                {
                    end_date: {
                    gte: now
                    },
                    application_end: null
                },
                {
                    end_date: null,
                    start_date: {
                    gte: now
                    }
                }
                ]
            },
            ...where_tags,
            ], 
        }
        }))
    
    transactions.push(prisma.outreach.findMany({
          where: {
            recurring: true,
            active: true,
            AND: where_tags.length ? where_tags: undefined,
          },
          include: {
            dccs: {
                include: {
                    dcc: true
                }
            },
            centers: {
              include: {
                  center: true
              }
            }
          },
        }))
    transactions.push(prisma.outreach.count({
        where: {
            active: true,
            recurring: true,
            AND: where_tags.length ? where_tags: undefined,
        },
    }))

    transactions.push(prisma.outreach.findMany({
          take: past_limit,
          skip: ((page || 1) - 1) * (past_limit || 6),
          where: {
            recurring: false,
            active: true,
            AND: [
              {
                OR: [
                  {
                    application_end: {
                      lt: now
                    }
                  },
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
                  }
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
            },
            centers: {
              include: {
                  center: true
              }
            }
          },
        }))

    transactions.push(prisma.outreach.count({
          where: {
            recurring: false,
            active: true,
            AND: [
              {
                OR: [
                  {
                    application_end: {
                      lt: now
                    }
                  },
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
                  }
                ],
              },
              ...where_tags
            ],
          }
    }))

    const [current, current_count, recurring, recurring_count, past, past_count] = await prisma.$transaction(transactions)

    let current_outreach:OutreachWithDCCAndCenter[]
    if (tags.indexOf("recurring") > -1) {
        current_outreach = recurring as OutreachWithDCCAndCenter[]
    } else {
        current_outreach = [...current as OutreachWithDCCAndCenter[], ...recurring as OutreachWithDCCAndCenter[]]
    }
    
    return <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid item xs={12} md={6}>
            <Typography variant={"h2"} color="secondary">Training and Outreach Activities</Typography>
        </Grid>
        <Grid item xs={12} md={6} sx={{justifyContent: "flex-end"}}>
            <FilterBox parsedParams={parsedParams}/>
        </Grid>
        <Grid item xs={12}>
            <OutreachComponent parsedParams={parsedParams} now={now} outreach={current_outreach}/>    
        </Grid>
        {((past as OutreachWithDCCAndCenter[]).length > 0 && tags.indexOf('recurring') === -1) &&
        <>
            <Grid item xs={12}>
                <Typography variant={"h3"}>Past Activities</Typography>
            </Grid>
            <Grid item xs={12}>
                <OutreachComponent parsedParams={parsedParams} now={now} outreach={past as OutreachWithDCCAndCenter[]}/>
                
            </Grid>
            <Grid item xs={12}>
              <div className="flex justify-center">
              <div><PaginationComponent parsedParams={parsedParams} count={past_count as number} limit={past_limit || 6}/></div>
              </div>
            </Grid>
        </>
        }
    </Grid>
}