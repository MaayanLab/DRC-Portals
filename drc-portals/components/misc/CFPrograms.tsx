import Link from "@/utils/link"
import Image from "next/image"

import Grid from '@mui/material/Grid'
import Tooltip from '@mui/material/Tooltip'
import { GridSize } from "@mui/material/Grid"
import prisma from '@/lib/prisma'



async function CFPrograms({spacing=4, className, baseEndpoint}:{spacing: GridSize, className?: string | null, baseEndpoint: string}) {
    const dccs = await prisma.dCC.findMany({
      where: {
        cfde_partner: true,
        active: true,
      }
    })
    return (
      <Grid container direction="row" spacing={2} justifyContent={"center"} sx={{marginTop: 5}}>
        {dccs.map(dcc=>(
          <Tooltip title={dcc.short_label} placement="top">
            <Grid item xs={spacing} key={dcc.short_label} className="flex items-center justify-center relative" sx={{height: 50, padding: 5, margin: 1}}>
              <Link href={`${baseEndpoint}/${dcc.short_label}`}>
                <Image className={className || ''}  src={dcc.icon || ''} alt={dcc.id} fill={true} style={{objectFit: "contain"}}/>
              </Link>
            </Grid>
          </Tooltip>
        ))}
      </Grid>
    )
  }

export default CFPrograms