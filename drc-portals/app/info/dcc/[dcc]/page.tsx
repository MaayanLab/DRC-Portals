import prisma from "@/lib/prisma";
import Link from "@/utils/link";
import Image from "@/utils/image";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import { notFound } from 'next/navigation'
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Icon from "@mdi/react";
import { Box } from "@mui/material";
import { mdiArrowRight } from "@mdi/js";
import SimplePublicationComponent from "@/components/misc/Publication/SimplePublicationComponent";
import { DCCAccordion } from '@/components/misc/DCCAccordion';
import { getDccDataObj } from '@/utils/dcc-assets';
import { ReadMore } from "@/components/misc/ReadMore";
import {OutreachComponent} from "@/components/misc/Outreach/featured";
export default async function DccDataPage({ params }: { params: { dcc: string } }) {
    const dcc = await prisma.dCC.findFirst({
        where: {
            short_label: decodeURI(params.dcc),
            active: true
        },
        include: {
            publications: {
                select: {
                    publication: true
                },
                where: {
                    publication: {
                        landmark: true
                    }
                },
                orderBy: {
                    publication: {
                        year: { sort: 'desc', nulls: 'last' },
                    }
                },
                take: 10
            },
            outreach: {
                select: {
                    outreach: true
                },
                orderBy: {
                    outreach: {
                        start_date: { sort: 'desc', nulls: 'last' },
                    }
                },
                take: 2
            },
        }
    })
    const now = new Date()
    const outreach = dcc?.outreach || []
    const publications = dcc?.publications.map(i=>i.publication) || []
    if (!dcc) return notFound()
    const assets = await getDccDataObj(prisma, dcc.id, params.dcc)
    return (
    <Paper sx={{
        boxShadow: "none", 
        background: '#EDF0F8',
        padding: 5, 
        borderRadius: 0, 
        minHeight: "50vh",
        width: "100vw", 
        marginLeft: "calc((-100vw + 100%) / 2)", 
        marginRight: "calc((-100vw + 100%) / 2)"
    }}>
        <Container maxWidth="lg">
            <Grid container spacing={2} alignItems={"flex-start"} justifyContent={"flex-start"}>
                <Grid item xs={12}>
                    <Card elevation={0} sx={{background: "#EDF0F8"}}>
                        {dcc.icon &&
                            <CardHeader
                                avatar={<Image alt={dcc.id} width={200} height={200} src={dcc.icon} />}
                            />
                        }
                        <CardContent>
                            <Stack spacing={2}>
                                <Typography variant="h2" color="secondary">
                                    {dcc.label}{dcc.short_label && dcc.short_label !== dcc.label && ` (${dcc.short_label})`}
                                </Typography>
                                {/* <ReadMore text={dcc.description?.replace(/["]+/g, '')}
                                    link={dcc.cf_site}
                                /> */}
                                <Typography variant="body1" color="secondary">
                                    {dcc.description} {dcc.cf_site && <>(Retrieved from the <Link href={dcc.cf_site} target="_blank" className="underline">NIH Common Fund site</Link>)</>}
                                </Typography>
                            </Stack>
                        </CardContent>
                        <CardActions>
                            <Stack sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
                                <Link href={dcc.homepage} target="_blank">
                                    <Button color="secondary"  sx={{textAlign: "left"}} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                                        {dcc.short_label} DCC Portal
                                    </Button>
                                </Link>
                                {dcc.cf_site && <Link href={dcc.cf_site} target="_blank">
                                    <Button color="secondary" sx={{textAlign: "left"}} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                                        {dcc.short_label} Program on the NIH Common Fund Website
                                    </Button>
                                </Link>
                                }
                            </Stack>
                            <Box sx={{display: {xs: "none", sm: "none", md: "block", lg: "block", xl: "block"}}}>
                                <Link href={dcc.homepage} target="_blank">
                                    <Button color="secondary"  sx={{textAlign: "left"}} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                                        {dcc.short_label} DCC Portal
                                    </Button>
                                </Link>
                                {dcc.cf_site && <Link href={dcc.cf_site} target="_blank">
                                    <Button color="secondary" sx={{textAlign: "left"}} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                                        {dcc.short_label} Program on the NIH Common Fund Website
                                    </Button>
                                </Link>
                                }
                            </Box>
                        </CardActions>
                    </Card>
                </Grid>
                {(outreach.length > 0) && 
                    <Grid item xs={12} md={(publications.length > 0 || Object.keys(assets).length > 0) ? 3:12}>
                        <Paper sx={{padding: 2}}>
                            <Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", maxWidth: 300, textAlign: "center"}}variant="subtitle1">TRAINING & OUTREACH</Typography>
                            { (outreach === undefined || outreach.length === 0) ?
                                <Typography color="inherit" variant="subtitle1" sx={{textTransform: "uppercase"}}>
                                    No events at the moment
                                </Typography>:
                                <OutreachComponent size="small" outreach={dcc.outreach.map(({outreach})=>outreach)} now={now}/>
                            }
                        </Paper>
                    </Grid>
                }
                { (publications.length > 0 || Object.keys(assets).length > 0) && 
                    <Grid item xs={12} md={outreach.length > 0 ? 9: 12}>
                        <Grid container spacing={2}>
                            {publications.length > 0 && <Grid item xs={12}>
                                <Paper sx={{padding: 2, height: "100%"}}>
                                    <Typography variant="h4" sx={{marginBottom: 3}} color="secondary">Landmark Publication{publications.length > 1 && "s"}</Typography>
                                    <SimplePublicationComponent publications={publications}/>
                                </Paper>
                            </Grid>}
                            <Grid item xs={12}>
                                <Paper sx={{padding: 2, height: "100%"}}>
                                    <DCCAccordion dcc={params.dcc} fulldata={assets} />
                                    <Link href="/data/matrix">
                                        <Button sx={{marginLeft: 2}}>
                                            <Typography variant={'subtitle1'} color="secondary">Go to data matrix</Typography>
                                        </Button>
                                    </Link>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                }
            </Grid>
        </Container>
    </Paper>
    )
}
