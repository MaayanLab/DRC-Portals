import React from 'react';
import { Container, Typography, Link } from '@mui/material';
import singleton from '@/lib/prisma'
import { DCCAccordion } from '@/components/misc/DCCAccordion';
import { getDccDataObj } from '@/utils/dcc-assets';

const prisma = singleton

export default async function LINCS() {
  const assets = await getDccDataObj(prisma, "f3f490cf-fd69-579c-8ea3-472c7cf3fb59", 'LINCS')
  return (
    <Container>
      <Typography sx={{mt:2}} variant="h2" color="primary" gutterBottom>LINCS</Typography>
      <DCCAccordion dcc="LINCS" fulldata={assets} />
      <Link sx={{mt: 2}} href="/data/matrix"><br/>Back to all files</Link>
    </Container>
  )
  // return (
  //   <DCCView dcc="LINCS" data={data.data} code={data.code}/>
  // )
}

// prisma.$disconnect