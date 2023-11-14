import React from 'react';
import { Container, Typography, Link } from '@mui/material';
import singleton from '@/lib/prisma'
import { DCCAccordion } from '@/components/misc/DCCAccordion';
import { getDccDataObj } from '@/utils/dcc-assets';

const prisma = singleton

export default async function LINCS() {
  const dcc_id = await prisma.dCC.findFirst({
    where: {
      short_label: 'LINCS'
    },
    select: {
      id: true
    }
  })
  if (dcc_id) {
    const assets = await getDccDataObj(prisma, dcc_id.id, 'LINCS')
    return (
    <Container>
      <Typography sx={{mt:2}} variant="h2" color="primary" gutterBottom>LINCS</Typography>
      <DCCAccordion dcc="LINCS" fulldata={assets} />
      <Link sx={{mt: 2}} href="/data/matrix"><br/>Back to all files</Link>
    </Container>
    )
  } else {
    return (
      <Container>
        <Typography sx={{mt:2}} variant="h2" color="primary" gutterBottom>LINCS</Typography>
        <Link sx={{mt: 2}} href="/data/matrix"><br/>Back to all files</Link>
      </Container>
    )
  }
  
}
