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
import { parseAsJson } from 'next-usequerystate';

export const shuffle = (array: OutreachType[]) => { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  return array; 
}; 


const OutreachComponent = ({outreach, now}: {
  outreach: OutreachType[], 
  now: Date,
}) =>(
  <Box sx={{ minHeight: 100 }}>
    <Grid container>
      {outreach.map((e,i)=>{
        let tags:JsonArray = []
        if (Array.isArray(e.tags)) {
          tags = e.tags
        }
        return (
			<Card elevation={0}>
				<CardContent>
					<Stack spacing={1}>
						<Typography color="secondary" variant="h5">{e.title}</Typography>
						<Markdown markdown={e.short_description}/>
					{ (e.application_end && e.application_end > now) ? 
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
					}
					<Link href={e.link || ''} target="_blank" rel="noopener noreferrer">
						<Button sx={{marginLeft: -2}} color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />}>VISIT PAGE</Button>
					</Link>
				</Stack>
			</CardContent>
		</Card>
          
        )
      })}
      </Grid>
    </Box>
)

const type_tags = {
  training: ["fellowship", "workshop", "internship", "course"],
  outreach: ["webinar", "office hours", "face to face meeting", "competition", "conference", "use-a-thon"]
}


async function Outreach({ orientation='horizontal', size=2, searchParams}:{
  active?: Boolean,
  orientation?: 'horizontal' | 'vertical',
  size?: number,
  searchParams?: {
    filter?: string
  },
  type?: 'outreach' | 'training'
}) {
    const now = new Date()
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
      return <OutreachComponent now={now} outreach={outreach}/>

  }

export default Outreach