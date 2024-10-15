import Link from "@/utils/link";
import Image from "next/image";
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
import { Center } from "@prisma/client";

const shuffle = (array: Center[]) => { 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  }; 


export default async function CenterLanding() {
    const centers = shuffle(await prisma.center.findMany({
        where: {
            active: true
        }
    }))

    return (
        <Grid container spacing={1} sx={{marginTop: 2}}>
            <Grid item xs={12}>
                <Typography variant="h3" color="secondary">Common Fund Data Ecosystem Centers</Typography>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{ minHeight: 253 }}>
                    <MasonryClient defaultHeight={1500}>
                    {centers.map(center=>(
                            <Card sx={{paddingLeft: 2, paddingRight: 2}}>
                             {center.icon ? (
                                    <CardHeader
                                        avatar={
                                            <div className="flex relative" style={{height: 50, width:100}}>
                                                <Image alt={center.id} src={center.icon} fill={true} style={{objectFit: "contain"}}/>
                                            </div>
                                        }
                                        title={<Typography variant="h3" color="secondary">{center.short_label}</Typography>}
                                    />
                                ):(
                                   <CardHeader
                                        avatar={
                                            <div className="flex relative" style={{height: 50, width:100}}>
                                                <Image alt={center.id} src="https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/favicon.png" fill={true} style={{objectFit: "contain"}}/>
                                            </div>
                                        }
                                        title={<Typography variant="h3" color="secondary">{center.short_label}</Typography>}
                                        />
                                    )}
                                <CardContent>
                                <Typography sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '5',
                                        WebkitBoxOrient: 'vertical',
                                        marginBottom:'1rem'
                                    }} variant={'h6'} color="secondary">
                                        {center.label}
                                    </Typography>
                                    <Typography sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '5',
                                        WebkitBoxOrient: 'vertical',
                                    }} variant={'body2'} color="secondary">
                                        {center.short_description}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Link href={`/info/center/${center.short_label}`}>
                                        <Button color="secondary">
                                            <Typography variant="body1">Expand</Typography>
                                        </Button>
                                    </Link>
                                    {center.homepage &&
                                    <Link href={center.homepage} target="_blank" rel="noopener noreferrer">
                                        <Button color="secondary">
                                            <Typography variant="body1">Go to Center portal</Typography>
                                        </Button>
                                    </Link>
                                    }
                                </CardActions>
                            </Card>
                    ))}
                    </MasonryClient>
                </Box>
            </Grid>
        </Grid>
    )
}