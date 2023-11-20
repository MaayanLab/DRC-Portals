import React from 'react';
import { Container, Typography, Link } from '@mui/material';
import singleton from '@/lib/prisma'
import { DCCAccordion } from '@/components/misc/DCCAccordion';
import { getDccDataObj } from '@/utils/dcc-assets';

const prisma = singleton

export default async function DccDataPage({ params }: { params: { dcc: string } }) {
  const nameMap = {
    ERCC: "ExRNA",
    GlyGen: "Glycosciences",
    KidsFirst: "Kids First"
  }
  let dcc_db_label = (params.dcc in nameMap) ? (
    nameMap[params.dcc as keyof typeof nameMap]
  ) : (params.dcc)
  const dcc_id = await prisma.dCC.findFirst({
    where: {
      short_label: dcc_db_label
    },
    select: {
      id: true
    }
  })
  if (dcc_id) {
    const assets = await getDccDataObj(prisma, dcc_id.id, params.dcc)
    return (
    <Container>
      <Typography sx={{mt:2}} variant="h2" color="secondary" gutterBottom>{params.dcc}</Typography>
      <DCCAccordion dcc={params.dcc} fulldata={assets} />
      <Link sx={{mt: 2}} href="/data/matrix"><br/>Back to all files</Link>
    </Container>
    )
  } else {
    return (
      <Container>
        <Typography sx={{mt:2}} variant="h2" color="secondary" gutterBottom>{params.dcc}</Typography>
        <Link sx={{mt: 2}} href="/data/matrix"><br/>Back to all files</Link>
      </Container>
    )
  }
  
}
