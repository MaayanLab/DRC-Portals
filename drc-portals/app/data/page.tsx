import Link from "next/link"
import Image from "next/image"
import { PrismaClient } from "@prisma/client"

import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Icon from '@mdi/react';
import { mdiMagnify, mdiArrowRight } from '@mdi/js';

import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Carousel from '@/components/misc/ServerCarousel'
import Twitter from '@/components/misc/Twitter'
import CFPrograms from "@/components/misc/CFPrograms"
import Outreach from "@/components/misc/Outreach"
import Publications from "@/components/misc/Publications"
const prisma = new PrismaClient()

export default async function Home() {
  return (
    <main className="mt-24">
      <Grid container spacing={2} alignItems={"flex-start"} justifyContent={"center"}>
        <Grid item xs={12} className="flex align-center justify-center">
          <Typography variant="h2">Common Fund Data Resource Portal</Typography>
        </Grid>
        <Grid item xs={12} className="flex align-center justify-center">
          <TextField sx={{width: 704}} 
            placeholder='Try MCF7, STAT3, blood, enrichment analysis' 
            InputProps={{
              sx: {borderRadius: 1, height: 50},
              endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>
            }}
          />
        </Grid>
        <Grid item xs={12} className="flex align-center justify-center space-x-5">
          <Button variant="outlined" color="secondary">Learn More</Button>
          <Button variant="contained" color="secondary">Search <Icon path={mdiArrowRight} size={1} className="ml-2" /></Button>
        </Grid>
        <Grid item xs={12} className="flex align-center justify-center space-x-5">
          
        </Grid>
      </Grid>
    </main>
  )
}
