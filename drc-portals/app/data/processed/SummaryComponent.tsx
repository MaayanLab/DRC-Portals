import React from 'react'
import { Button, Container, Grid, Typography } from "@mui/material"
import { categoryLabel, create_url, EntityType, pluralize, TermAggType } from "@/app/data/processed/utils"
import { safeAsync } from '@/utils/safe'
import trpc from '@/lib/trpc/server'
import Image from '@/utils/image'
import Icon from '@mdi/react'
import { mdiExpandAll } from '@mdi/js'

export const dynamic = 'force-dynamic'

export default async function Summary({ include }: { include?: string[] }) {
  const { data: summaryRes, error } = await safeAsync(() => trpc.types({ include }))
  if (error) console.error(error)
  if (!summaryRes) return null
  return <Container maxWidth="lg" className="m-auto">
      <Grid container spacing={6} justifyContent={"center"} alignItems={"flex-start"}>
        {summaryRes.types?.map((result) => (
        <Grid key={result.key} item xs={6} sm={4} md={3} lg={2}>
          <a href={create_url({ type: result.key })}>
            <div className="flex flex-col items-center text-center">
              <Typography variant="h2" color="secondary">{BigInt(result.doc_count).toLocaleString()}</Typography>
              <Typography variant="subtitle1" color="secondary">{pluralize(categoryLabel(result.key))}</Typography>
            </div>
          </a>
        </Grid>
      ))}
      {include !== undefined && <Grid item xs={6} sm={4} md={3} lg={2}>
        <a href={create_url({})}>
          <div className="flex flex-col items-center">
            <Typography variant="h2" color="secondary">Click</Typography>
            <Typography variant="subtitle1" color="secondary">To see more</Typography>
          </div>
        </a>
      </Grid>}
    </Grid>
  </Container>
}


export async function SummaryVertical({ include }: { include?: {key: string, icon: string}[] }) {
  const { data: summaryRes, error } = await safeAsync(() => trpc.types({ include: (include || []).map(i=>i.key)}))
  const icon_mapper: {[key:string]: string} = include?.reduce((acc, i)=>({...acc, [i.key]: i.icon}), {}) || {}
  if (error) console.error(error)
  if (!summaryRes) return null
  return <Container maxWidth="lg" className="m-auto">
      <Grid container spacing={2} justifyContent={"center"} alignItems={"flex-start"}>
        {summaryRes.types?.map((result) => (
        <Grid key={result.key} item xs={6}>
          <Button sx={{width: "100%"}} href={create_url({ type: result.key })} className='flex flex-col items-center' color="secondary">
            {icon_mapper[result.key] && <Icon path={icon_mapper[result.key]} size={2}/>}
              <Typography variant="body1" color="secondary">{pluralize(categoryLabel(result.key))}</Typography>
              <Typography variant="h3" color="secondary">{BigInt(result.doc_count).toLocaleString()}</Typography>
          </Button>
        </Grid>
      ))}
      {include !== undefined && <Grid item xs={6}>
        <Button sx={{width: "100%"}} className='flex flex-col items-center' color="secondary" href={create_url({})}>
            <Icon path={mdiExpandAll} size={2}/>
            <Typography variant="subtitle1" color="secondary">See more</Typography>
        </Button>
      </Grid>}
    </Grid>
  </Container>
}

export async function SummaryHorizontal({ include }: { include?: {key: string, icon: string}[] }) {
  const { data: summaryRes, error } = await safeAsync(() => trpc.types({ include: (include || []).map(i=>i.key)}))
  const icon_mapper: {[key:string]: string} = include?.reduce((acc, i)=>({...acc, [i.key]: i.icon}), {}) || {}
  if (error) console.error(error)
  if (!summaryRes) return null
  return <Container maxWidth="lg" className="m-auto">
      <Grid container spacing={6} justifyContent={"center"} alignItems={"flex-start"}>
        {summaryRes.types?.map((result) => (
        <Grid key={result.key} item>
          <Button className='flex flex-col items-center' color="secondary">
            {icon_mapper[result.key] && <Icon path={icon_mapper[result.key]} size={2}/>}
              <Typography variant="body1" color="secondary">{pluralize(categoryLabel(result.key))}</Typography>
              <Typography variant="h3" color="secondary">{BigInt(result.doc_count).toLocaleString()}</Typography>
          </Button>
        </Grid>
      ))}
      {include !== undefined && <Grid item>
        <a href={create_url({})}>
          <div className="flex flex-col items-center">
            <Typography variant="h2" color="secondary">Click</Typography>
            <Typography variant="subtitle1" color="secondary">To see more</Typography>
          </div>
        </a>
      </Grid>}
    </Grid>
  </Container>
}
