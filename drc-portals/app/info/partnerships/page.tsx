import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import Avatar from "@mui/material/Avatar";
import { Prisma } from "@prisma/client";
import MasonryClient from "@/components/misc/MasonryClient";
type PartnershipsWithDCC = Prisma.PartnershipsGetPayload<{
    include: {
        dccs: {
          include: {
            dcc: true
          }
        }
    }
  }>
const shuffle = (array: PartnershipsWithDCC[]) => { 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  }; 


export default async function PartnershipPage() {
    const partnerships = shuffle(await prisma.partnerships.findMany({
        include: {
            dccs: {
                include: {
                    dcc: true
                }
            }
        }
    }))

    return (
        <MasonryClient defaultHeight={1500}>
            {partnerships.map(partnership=>(
                <Card sx={{paddingLeft: 2, paddingRight: 2}}>
                    <CardHeader
                        avatar={partnership.image ? 
                                    <Image alt={partnership.id} width={80} height={80} src={partnership.image} />:
                                    <Avatar>{partnership.title[0]}</Avatar>
                                }
                        title={<Typography variant="h3" color="secondary">{partnership.title}</Typography>}
                    />
                    <CardContent>
                        <Typography variant={'body2'} color="secondary">
                            {partnership.description}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Grid container>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="secondary">Participating DCCs:</Typography>
                            </Grid>
                            {partnership.dccs && 
                                partnership.dccs.map(({dcc})=>(
                                    <Grid item key={dcc.short_label}>
                                        <Link href={`/info/dcc/${dcc.short_label}`}>
                                            <Button color="secondary" variant="outlined">
                                                <Typography variant="body2">{dcc.short_label}</Typography>  
                                            </Button>
                                        </Link>
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </CardActions>
                </Card>
            ))}
        </MasonryClient>
    )
}