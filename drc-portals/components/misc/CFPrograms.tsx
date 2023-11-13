import Link from "next/link"
import Image from "next/image"
import { PrismaClient } from "@prisma/client"

import Grid from '@mui/material/Grid'
import Tooltip from '@mui/material/Tooltip'
import { GridSize } from "@mui/material/Grid"

const prisma = new PrismaClient()



async function CFPrograms({spacing=4}:{spacing: GridSize}) {
    const dccs = await prisma.dCC.findMany({
      where: {
        cfde_partner: true
      }
    })
    return (
      <Grid container direction="row" spacing={2}>
        {dccs.map(dcc=>(
          <Grid item xs={6} md={spacing} key={dcc.short_label} className="flex items-center justify-center relative" sx={{height: 50, padding: 5, marginTop: 5}}>
            <Tooltip title={dcc.short_label}>
              <Link href={dcc.homepage} target="_blank" rel="noopener noreferrer"><Image src={dcc.icon || ''} alt={dcc.id} fill={true} style={{objectFit: "contain"}}/></Link>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    )
  }

export default CFPrograms