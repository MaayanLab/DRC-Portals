import Link from "@/utils/link";
import Image from "@/utils/image";
import prisma from "@/lib/prisma";
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { Prisma } from "@prisma/client";
import { mdiPageNextOutline } from '@mdi/js';
import Icon from '@mdi/react';

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

const PartnershipCard = ({ partnership }: { partnership: PartnershipsWithDCC }) => {
    const lead_dccs = []
    const dccs = []
    for (const { dcc, lead } of partnership.dccs) {
        const comp = <Grid item key={dcc.short_label} className="flex items-center justify-center relative">
            <Link href={`/info/dcc/${dcc.short_label}`}>
                <Tooltip title={dcc.short_label}>
                    <IconButton sx={{ minHeight: ["Metabolomics", "GTEx", "LINCS"].indexOf(dcc.short_label || '') === -1 ? 50 : 30, minWidth: ["Metabolomics", "GTex"].indexOf(dcc.short_label || '') === -1 ? 50 : 30 }}>
                        {dcc.icon ?
                            <Image src={dcc.icon || ''} alt={dcc.id} fill={true} style={{ objectFit: "contain" }} /> :
                            <Avatar>{dcc.label[0]}</Avatar>
                        }
                    </IconButton>
                </Tooltip>
            </Link>
        </Grid>
        if (lead) lead_dccs.push(comp)
        else dccs.push(comp)
    }
    return (
        <Card sx={{ paddingLeft: 2, paddingRight: 2, height: "100%" }}>
            <CardHeader
                avatar={partnership.image ?
                    <Image alt={partnership.id} width={80} height={80} src={partnership.image} /> :
                    <Avatar>{partnership.title[0]}</Avatar>
                }
                title={<Typography variant="h3" color="secondary">{partnership.title}</Typography>}
            />
            <CardContent>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Chip label={partnership.status}
                            variant="filled"
                            sx={{ borderRadius: 2, textTransform: "uppercase", backgroundColor: partnership.status === "active" ? "tertiary.main" : "primary.light", color: partnership.status === "active" ? "#FFF" : "secondary.main", }} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant={'body2'} color="secondary">
                            {partnership.description}
                        </Typography>
                    </Grid>
                    {partnership.grant_num &&
                        <Grid item xs={12}>
                            <Link
                                href={`https://reporter.nih.gov/project-details/${partnership.grant_num}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                            >
                                <Typography variant="body2" color="secondary">Grant: {partnership.grant_num}</Typography>
                            </Link>
                        </Grid>
                    }
                    {partnership.publications.length > 0 &&
                        <Grid item xs={12} className="flex items-center ">
                            <Typography variant="body2" color="secondary"><b>Publication{partnership.publications.length > 1 && 's'}:</b></Typography>
                            {partnership.publications.map(({ publication }) => (
                                <Link key={publication.id} target="_blank" rel="noopener noreferrer" href={`https://www.doi.org/${publication.doi}`}>
                                    <Button color="secondary" ><Icon path={mdiPageNextOutline} size={1} /></Button>
                                </Link>
                            ))}
                        </Grid>
                    }
                    {(lead_dccs.length > 0 || dccs.length > 0) && (
                        <Grid item xs={12}>
                            <Grid container spacing={1} alignItems={"center"}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="secondary">
                                        <b>Participating DCCs:</b>
                                    </Typography>
                                </Grid>
                                {[...lead_dccs, ...dccs]}
                            </Grid>
                        </Grid>
                    )}
                    {partnership.website &&
                        <Grid item xs={12}>
                            <Link href={partnership.website}>
                                <Button color="secondary" endIcon={<Icon path={mdiPageNextOutline} size={1} />} sx={{ml: -2}}>
                                    <Typography variant="body2" color="secondary">GO TO WEBSITE</Typography>
                                </Button>
                            </Link>
                        </Grid>
                    }
                </Grid>
            </CardContent>
        </Card>
    )
}


export default async function PartnershipPage() {
    const active_partnerships = await prisma.partnerships.findMany({
        where: {
            status: 'active'
        },
        include: {
            dccs: {
                include: {
                    dcc: true,
                }
            },
            publications: {
                include: {
                    publication: true
                }
            },
        },
        orderBy: [
            { priority: 'asc' },
            { dccs: { _count: 'desc' } }, { title: 'asc' }
        ],
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
        orderBy: [{ dccs: { _count: 'desc' } }, { title: 'asc' }, { id: 'asc' }],
    })
    return (
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={12}>
                <Typography variant="h2" color="secondary">CFDE Partnerships</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="body2">
                    The CFDE has funded collaborative DCC partnership projects that will develop approaches and tools to harmonize data and workflows from multiple Common Fund programs enabling cross-dataset analysis. These partnerships are meant to enhance DCC-DCC interactions. In addition, these partnerships aim to demonstrate the utility of their data integration tools and approaches for CF datasets to the broader scientific community.
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h4" color="secondary">Active CFDE Partnerships</Typography>
            </Grid>
            {active_partnerships.map(partnership => (
                <Grid item xs={12} md={4} key={partnership.id} >
                    <PartnershipCard partnership={partnership} />
                </Grid>
            ))}
            <Grid item xs={12}>
                <Typography variant="h4" color="secondary">Past CFDE Partnerships</Typography>
            </Grid>
            {completed_partnerships.map(partnership => (
                <Grid item xs={12} md={4} key={partnership.id} >
                    <PartnershipCard partnership={partnership} />
                </Grid>
            ))}
        </Grid>
    )
}