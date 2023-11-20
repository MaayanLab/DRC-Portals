import React from 'react';
import { Container, Typography, Link, Grid, Box } from '@mui/material';
import singleton from '@/lib/prisma'
import { DCCAccordion } from '@/components/misc/DCCAccordion';
import { getDccDataObj } from '@/utils/dcc-assets';
import { ReadMore } from '@/components/misc/ReadMore';

const prisma = singleton

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
    const description_text = dcc_dbinfo.description?.replace(/["]+/g, '') + 
      " (Retrieved from the NIH Common Fund site at https://commonfund.nih.gov/)"
    return (
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={3}>
          <Box component="img"
            sx={{display:'inline', height:'auto'}}
            src={logo} alt={dcc_dbinfo.id}
          />
        </Grid>
        <Grid item xs={12} style={{textAlign: "center"}}>
          <Link href={dcc_dbinfo.homepage}>
            <Typography fontSize="12pt" color="secondary.light">
              Visit the {params.dcc} Portal
            </Typography>
          </Link>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" sx={{mt:2, ml:3, mb:2}}>
            <ReadMore text={description_text} expanded={false} />
          </Typography>
        </Grid>
        <DCCAccordion dcc={params.dcc} fulldata={assets} />
        <Link sx={{ml: 3}} href="/data/matrix"><br/>Back to all files</Link>
      </Grid>    
      )
  } else {
    return (
      <Container>
        <Typography sx={{mt:2}} variant="h2" color="secondary" gutterBottom>{params.dcc}</Typography>
        Page unavailable
        <Link sx={{mt: 2}} href="/data/matrix"><br/>Back to all files</Link>
      </Container>
    )
  }
  
}
