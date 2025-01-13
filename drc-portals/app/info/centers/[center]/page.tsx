import prisma from "@/lib/prisma";
import Link from "@/utils/link";
import Image from "next/image";
import { 
    Typography,
    Container,
    Grid, 
    Paper,
    Card, 
    CardHeader, 
    CardContent,
    CardActions,
    Stack,
    Button,
    Box 
  } from '@mui/material';
import { notFound } from 'next/navigation'
import Icon from "@mdi/react";
import { mdiArrowRight } from "@mdi/js";
import React from "react";
import { ExpandableDescription } from "@/components/misc/Center/ExpandableDescription";


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
            <Container maxWidth="lg" >

                <Grid container spacing={2} alignItems={"flex-start"} justifyContent={"flex-start"} >
                    <Grid item xs={12}>
                        <Card elevation={0} sx={{ background: "#EDF0F8" }}>
                            {center.icon &&
                                <CardHeader
                                    avatar={<Image alt={center.id} width={200} height={200} src={center.icon} />}
                                />
                            }
                            <CardContent>
                                <Stack spacing={2}>
                                    <Typography variant="h5" color="secondary">
                                        Abstract (from RePORTER)
                                    </Typography>
                                        <ExpandableDescription text={center.description || ''} />
                                </Stack>
                            </CardContent>
                            <CardActions>
                                <Box sx={{ display: { xs: "none", sm: "none", md: "block", lg: "block", xl: "block" } }}>
                                    {center.homepage &&
                                        <Link href={center.homepage}>
                                            <Button color="secondary" sx={{ textAlign: "left" }} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                                                {center.short_label} Center Portal
                                            </Button>
                                        </Link>
                                    }
                                </Box>
                                <Box sx={{ display: { xs: "none", sm: "none", md: "block", lg: "block", xl: "block" } }}>
                                    {center.grant_num &&
                                        <Link href={`https://reporter.nih.gov/project-details/${center.grant_num}`}>
                                            <Button color="secondary" sx={{ textAlign: "left" }} endIcon={<Icon path={mdiArrowRight} size={1} />}>
                                                {center.grant_num}
                                            </Button>
                                        </Link>
                                    }
                                </Box>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Paper>
    )
}
