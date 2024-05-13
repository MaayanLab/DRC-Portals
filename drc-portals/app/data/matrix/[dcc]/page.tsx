import React from 'react';
import { Typography, Link, Grid } from '@mui/material';
import prisma from '@/lib/prisma'
import { DCCAccordion } from '@/components/misc/DCCAccordion';
import { getDccDataObj } from '@/utils/dcc-assets';
import { ReadMore } from '@/components/misc/ReadMore';
import { notFound } from 'next/navigation';

export default async function DccDataPage({ params }: { params: { dcc: string } }) {
  const dcc = decodeURI(params.dcc)
  const dcc_dbinfo = await prisma.dCC.findFirst({
    where: {
      short_label: dcc,
      active: true
    },
    select: {
      id: true,
      description: true,
      icon: true,
      homepage: true,
      cf_site: true
    }
  })
  if (dcc_dbinfo) {
    const assets = await getDccDataObj(prisma, dcc_dbinfo.id, dcc)
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
            {dcc}
          </Typography>
          <Link href={dcc_dbinfo.homepage} target="_blank" style={{textDecoration: 'none'}}>
            <Typography sx={{ml:3}} fontSize="12pt" color="#3470e5">
              Visit the {dcc} Portal
            </Typography>
          </Link>
        </Grid>
        <Grid item xs={6}></Grid>
        <Grid item xs={3}>
          <img className="object-scale-down h-16 self-center mx-auto" 
            src={dcc_dbinfo.icon ? dcc_dbinfo.icon: ''} alt={dcc} />
        </Grid>
        <Grid item xs={12}>
          <ReadMore text={description_text} link={dcc_dbinfo.cf_site}/>
        </Grid>
        <DCCAccordion dcc={dcc} fulldata={assets} />
        <Link sx={{mt:2, mb:5}} href="/data/matrix">
          <Typography fontSize="14pt" color="#3470e5">Back to all files</Typography>
        </Link>
      </Grid>    
      )
  } else {
    return notFound()
  }
  
}
