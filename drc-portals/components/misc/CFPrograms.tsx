import Link from "next/link"
import Image from "next/image"

import Grid from '@mui/material/Grid'
import Tooltip from '@mui/material/Tooltip'
import { GridSize } from "@mui/material/Grid"

import prisma from '@/lib/prisma'

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
              <Link href={dcc.homepage} target="_blank" rel="noopener noreferrer">
                { (dcc.icon || "").indexOf(".svg") > -1 ?
                  <Image src={dcc.icon || ''} alt={dcc.id} width={120} height={120}/> :
                  <Image src={dcc.icon || ''} alt={dcc.id} fill={true} style={{objectFit: "contain"}}/>
                }
                </Link>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    )
  }

export default CFPrograms