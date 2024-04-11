import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/CardActions'
import IconButton from '@mui/material/IconButton'
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { Prisma } from "@prisma/client";
import MasonryClient from "@/components/misc/MasonryClient";
type PartnershipsWithDCC = Prisma.PartnershipsGetPayload<{
    include: {
        dccs: {
          include: {
            dcc: true
          }
        },
        publications: {
            include: {
                publication: true
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

const PartnershipCard = ({partnership}:{partnership: PartnershipsWithDCC}) => (
    <Card sx={{paddingLeft: 2, paddingRight: 2}}>
        <CardHeader
            avatar={partnership.image ? 
                        <Image alt={partnership.id} width={80} height={80} src={partnership.image} />:
                        <Avatar>{partnership.title[0]}</Avatar>
                    }
            title={<Typography variant="h3" color="secondary">{partnership.title}</Typography>}
        />
        <CardContent>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Chip label={partnership.status} 
                        variant="filled"
                        sx={{borderRadius: 2, textTransform: "uppercase", background: partnership.status === "active"? "#7187C3": "#EDF0F8", color: partnership.status === "active"?"#FFF":"#29527A",}}/>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant={'body2'} color="secondary">
                        {partnership.description}
                    </Typography>
                </Grid>
                { partnership.publications.length > 0 && 
                    <Grid item xs={12} className="flex items-center">
                        <Typography variant="body2" color="secondary"><b>Publication{partnership.publications.length > 1 && 's'}:</b></Typography>
                        {partnership.publications.map(({publication})=>(
                            <Link key={publication.id} target="_blank" rel="noopener noreferrer" href={`https://www.doi.org/${publication.doi}`}>
                                <Button color="secondary"><Typography variant="body2" color="secondary">{publication.doi}</Typography></Button>
                            </Link>
                        ))}
                    </Grid>
                }
                <Grid item xs={12}>
                    <Grid container spacing={1} alignItems={"center"}>
                        <Grid item xs={12}>
                            <Typography variant="body2" color="secondary"><b>Participating DCCs:</b></Typography>
                        </Grid>
                        {partnership.dccs && 
                            partnership.dccs.map(({dcc})=>(
                                <Grid item key={dcc.short_label} className="flex items-center justify-center relative">
                                    <Link href={`/info/dcc/${dcc.short_label}`}>
                                        <Tooltip title={dcc.short_label}>
                                            <IconButton sx={{minHeight: ["Metabolomics", "GTEx"].indexOf(dcc.short_label || '') === -1 ? 70: 40, minWidth: ["Metabolomics", "GTex"].indexOf(dcc.short_label || '') === -1 ? 60: 40}}>
                                                {dcc.icon ? 
                                                    <Image src={dcc.icon || ''} alt={dcc.id} fill={true} style={{objectFit: "contain"}}/>:
                                                    <Avatar>{dcc.label[0]}</Avatar>
                                                }
                                            </IconButton>
                                        </Tooltip>
                                    </Link>
                                </Grid>
                            ))
                        }
                    </Grid>
                </Grid>
                {partnership.website &&
                    <Grid item xs={12}>
                        <Link href={partnership.website}>
                            <Button color="secondary">
                                <Typography variant="body2" color="secondary">GO TO WEBSITE</Typography>
                            </Button>
                        </Link>
                    </Grid>
                }  
            </Grid>
        </CardContent>
    </Card>
)


export default async function PartnershipPage() {
    const active_partnerships = await prisma.partnerships.findMany({
        where: {
            status: 'active'
        },
        include: {
            dccs: {
                include: {
                    dcc: true
                }
            },
            publications: {
                include: {
                    publication: true
                }
            }
        },
        orderBy: [{publications: {_count: 'desc'}}, {title: 'asc'}],
    })

    const completed_partnerships = await prisma.partnerships.findMany({
        where: {
            status: 'completed'
        },
        include: {
            dccs: {
                include: {
                    dcc: true
                }
            },
            publications: {
                include: {
                    publication: true
                }
            }
        },
        orderBy: [{publications: {_count: 'desc'}}, {title: 'asc'}, {id: 'asc'}],
    })

    return (
        <Grid container spacing={1} sx={{marginTop: 2}}>
            <Grid item xs={12}>
                <Typography variant="h3" color="secondary">Active CFDE Partnerships</Typography>
            </Grid>
            <Grid item xs={12}>
                <MasonryClient defaultHeight={1500}>
                    {active_partnerships.map(partnership=>(
                        <PartnershipCard partnership={partnership}/>   
                    ))}
                </MasonryClient>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h3" color="secondary">Past CFDE Partnerships</Typography>
            </Grid>
            <Grid item xs={12}>
                <MasonryClient defaultHeight={1500}>
                    {completed_partnerships.map(partnership=>(
                        <PartnershipCard partnership={partnership}/>   
                    ))}
                </MasonryClient>
            </Grid>
        </Grid>
    )
}