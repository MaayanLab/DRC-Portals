import React from 'react';
import { Container, Typography, Link, Grid, Box } from '@mui/material';
import prisma from '@/lib/prisma'
import { DCCAccordion } from '@/components/misc/DCCAccordion';
import { getDccDataObj } from '@/utils/dcc-assets';
import { ReadMore } from '@/components/misc/ReadMore';

export default async function DccDataPage({ params }: { params: { dcc: string } }) {
  const nameMap = {
    ERCC: "ExRNA",
    GlyGen: "Glycoscience",
    KidsFirst: "Kids First"
  }
  let dcc_db_label = (params.dcc in nameMap) ? (
    nameMap[params.dcc as keyof typeof nameMap]
  ) : (params.dcc)
  const dcc_dbinfo = await prisma.dCC.findFirst({
    where: {
      short_label: dcc_db_label
    },
    select: {
      id: true,
      description: true,
      icon: true,
      homepage: true,
    }
  })
  if (dcc_dbinfo) {
    const assets = await getDccDataObj(prisma, dcc_dbinfo.id, params.dcc)
    const logo = dcc_dbinfo.icon ? (dcc_dbinfo.icon) : ('')
    const description_text = dcc_dbinfo.description?.replace(/["]+/g, '')
    return (
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={3}>
          <Typography sx={{ml:3, mt:2, color: "secondary.dark"}} variant="h2">
            {params.dcc}
          </Typography>
          <Link href={dcc_dbinfo.homepage} target="_blank" style={{textDecoration: 'none'}}>
            <Typography sx={{ml:3}} fontSize="12pt" color="#3470e5">
              Visit the {params.dcc} Portal
            </Typography>
          </Link>
        </Grid>
        <Grid item xs={6}></Grid>
        <Grid item xs={3}>
          <img className="object-scale-down h-16 self-center mx-auto" 
            src={dcc_dbinfo.icon ? dcc_dbinfo.icon: ''} alt={params.dcc} />
        </Grid>
        <Grid item xs={12}>
            <ReadMore text={description_text} />
        </Grid>
        <DCCAccordion dcc={params.dcc} fulldata={assets} />
        <Link sx={{mt:2}} href="/data/matrix">
          <Typography fontSize="16pt" color="secondary.light">Back to all files</Typography>
        </Link>
      </Grid>    
      )
  } else {
    return (
      <Container>
        <Typography sx={{mt:2}} variant="h2" color="secondary" gutterBottom>{params.dcc}</Typography>
        Page unavailable
        <Link sx={{mt:2}} href="/data/matrix">
          <Typography fontSize="12pt" color="secondary.light">Back to all files</Typography>
        </Link>
      </Container>
    )
  }
  
}
