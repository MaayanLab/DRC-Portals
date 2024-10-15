import prisma from "@/lib/prisma";
import Link from "@/utils/link";
import Image from "next/image";
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
import { OutreachComponent } from "../../../../components/misc/Outreach/featured";
import React from "react";

export default async function CenterDataPage({ params }: { params: { center: string } }) {

    const center = await prisma.center.findFirst({
        where: {
            short_label: decodeURI(params.center),
            active: true
        },
        include: {
          outreach: {
            include: {
              outreach: true
            },
            orderBy: {
              outreach: {
                start_date: 'desc'
              }
            },
            take: 2
          }
        }
      })
    
    const now = new Date()
    const outreach = center?.outreach || []
    if (!center) return notFound()
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
                        {center.icon &&
                            <CardHeader
                                avatar={<Image alt={center.id} width={200} height={200} src={center.icon} />}
                            />
                        }
                        <CardContent>
                            <Stack spacing={2}>
                                <Typography variant="h2" color="secondary">
                                    {center.label}{center.short_label && center.short_label !== center.label && ` (${center.short_label})`}
                                </Typography>
                                <Typography variant="body1" color="secondary">
                                    {center.description}
                                </Typography>
                            </Stack>
                        </CardContent>
                        <CardActions>
                            <Stack sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
                            {center.homepage &&
                                <Link href={center.homepage}>
                                    <Button color="secondary"  sx={{textAlign: "left"}} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                                        {center.short_label} Center Portal
                                    </Button>
                                </Link>
                                }
                            </Stack>
                            <Box sx={{display: {xs: "none", sm: "none", md: "block", lg: "block", xl: "block"}}}>
                              {center.homepage &&
                                <Link href={center.homepage}>
                                    <Button color="secondary"  sx={{textAlign: "left"}} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                                        {center.short_label} Center Portal
                                    </Button>
                                </Link>
                                }
                            </Box>
                        </CardActions>
                    </Card>
                </Grid>
                {(outreach.length > 0) && 
                    <Grid item xs={12} md={12}>
                        <Paper sx={{padding: 2}}>
                            <Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", maxWidth: 300, textAlign: "center"}}variant="subtitle1">TRAINING & OUTREACH</Typography>
                            { (outreach === undefined || outreach.length === 0) ?
                                <Typography color="inherit" variant="subtitle1" sx={{textTransform: "uppercase"}}>
                                    No events at the moment
                                </Typography>:
                                <OutreachComponent size="small" outreach={center.outreach.map(({outreach})=>outreach)} now={now}/>
                            }
                        </Paper>
                    </Grid>
                }
            </Grid>
        </Container>
    </Paper>
    )
}
