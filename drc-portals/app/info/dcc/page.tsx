import Link from "@/utils/link";
import Image from "@/utils/image";
import prisma from "@/lib/prisma";
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import Box from "@mui/material/Box";
import MasonryClient from "@/components/misc/MasonryClient";
import { DCC } from "@prisma/client";

const shuffle = (array: DCC[]) => { 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  }; 


export default async function DCCLanding() {
    const dccs = await prisma.dCC.findMany({
        where: {
            cfde_partner: true,
            active: true
        },
        orderBy: {
            short_label: 'asc'
        }
    })

    return (
        <Grid container spacing={2} sx={{marginTop: 2}}>
            <Grid item xs={12}>
                <Typography variant="h2" sx={{mb: 2}} color="secondary">Common Fund Programs Partnered with the CFDE</Typography>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{ minHeight: 253 }}>
                    <MasonryClient defaultHeight={1500}>
                    {dccs.map(dcc=>(
                            <Card sx={{paddingLeft: 2, paddingRight: 2}}>
                                {dcc.icon &&
                                    <CardHeader
                                        avatar={
                                            <div className="flex relative" style={{height: 50, width:100}}>
                                                <Image alt={dcc.id} src={dcc.icon} fill={true} style={{objectFit: "contain"}}/>
                                            </div>
                                        }
                                        title={<Typography variant="h3" color="secondary">{dcc.short_label}</Typography>}
                                    />
                                }
                                <CardContent>
                                    <Typography sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '5',
                                        WebkitBoxOrient: 'vertical',
                                    }} variant={'body2'} color="secondary">
                                        {dcc.description}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Link href={`/info/dcc/${dcc.short_label}`}>
                                        <Button color="secondary">
                                            <Typography variant="body1">Expand</Typography>
                                        </Button>
                                    </Link>
                                    <Link href={dcc.homepage} target="_blank" rel="noopener noreferrer">
                                        <Button color="secondary">
                                            <Typography variant="body1">Go to DCC portal</Typography>
                                        </Button>
                                    </Link>
                                </CardActions>
                            </Card>
                    ))}
                    </MasonryClient>
                </Box>
            </Grid>
        </Grid>
    )
}