import Link from "next/link";
import Image from "next/image";
import MasonryClient from "@/components/misc/MasonryClient";
import prisma from "@/lib/prisma";
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import { DCC } from "@prisma/client";

const shuffle = (array: DCC[]) => { 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  }; 


export default async function DCCLanding() {
    const dccs = shuffle(await prisma.dCC.findMany({
        where: {
            cfde_partner: true
        }
    }))

    return (
        <MasonryClient defaultHeight={1500}>
            {dccs.map(dcc=>(
                <Card sx={{paddingLeft: 2, paddingRight: 2}}>
                    {dcc.icon &&
                        <CardHeader
                            avatar={<Image alt={dcc.id} width={80} height={80} src={dcc.icon} />}
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
                        <Link href={dcc.homepage}>
                            <Button color="secondary">
                                <Typography variant="body1">Go to DCC portal</Typography>
                            </Button>
                        </Link>
                    </CardActions>
                </Card>
            ))}
        </MasonryClient>
    )
}