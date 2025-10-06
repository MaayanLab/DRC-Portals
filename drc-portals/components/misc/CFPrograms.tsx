import Link from "@/utils/link"
import Image from "@/utils/image"

import Grid from '@mui/material/Grid'
import Tooltip from '@mui/material/Tooltip'
import { GridSize } from "@mui/material/Grid"
import prisma from '@/lib/prisma'



async function CFPrograms({spacing=4, className, baseEndpoint}:{spacing: GridSize, className?: string | null, baseEndpoint: string}) {
    const dccs = await prisma.dCC.findMany({
      where: {
        cfde_partner: true,
        active: true,
        short_label: {
          in: [ "Kids First", "A2CPS", "HuBMAP", "4DN", "LINCS", "IDG", 
            "GlyGen", "Bridge2AI", "MoTrPAC", "Metabolomics", "SPARC", "HMP", "GTEx", "SenNet", "ExRNA", 'SCGE', 'SMaHT']
          
        }
      }
    })
    const additional = [
      {
        short_label: "NPH",
        icon: "/img/interactive/nph.png",
        homepage: "https://commonfund.nih.gov/nutritionforprecisionhealth"
      }
    ]
    const additional_label = ['NPH']
    return (
      <Grid container direction="row" spacing={2} justifyContent={"center"} sx={{marginTop: 5}}>
        {[...dccs, ...additional].map(dcc=>(
          <Tooltip title={dcc.short_label} placement="top">
            <Grid item xs={spacing} key={dcc.short_label} className="flex items-center justify-center relative" sx={{height: 50, padding: 5, margin: 1}}>
              { additional_label.indexOf(dcc.short_label || '') > -1 ?
								<Link href={dcc.homepage} target="_blank" rel="noopener noreferrer">
									<Image className={className || ''}  src={dcc.icon || ''} alt={dcc.short_label || ''} fill={true} style={{objectFit: "contain"}}/>
								</Link>:
								<Link href={`${baseEndpoint}/${dcc.short_label}`}>
                  <Image className={className || ''}  src={dcc.icon || ''} alt={dcc.short_label || ''} fill={true} style={{objectFit: "contain"}}/>
                </Link>
								}
              
            </Grid>
          </Tooltip>
        ))}
      </Grid>
    )
  }

export default CFPrograms