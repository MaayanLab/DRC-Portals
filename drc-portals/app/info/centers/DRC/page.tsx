import prisma from "@/lib/prisma";
import Link from "@/utils/link";
import Image from "next/image";
import {
    Typography,
    Container,
    Grid,
    Paper,
    Card,
    CardContent,
    Stack,
    Box,
    Tooltip
} from '@mui/material';
import { notFound } from 'next/navigation'

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import React from "react";
import YoutubeEmbed from "@/components/misc/YoutubeEmbed";
import SimplePublicationComponent from "@/components/misc/Publication/SimplePublicationComponent";


export default async function CenterDataPage() {
    const center = await prisma.center.findFirst({
        where: {
            short_label: "DRC",
            active: true
        },
        include: {
            outreach: {
                select: {
                    outreach: true
                },
                orderBy: {
                    outreach: {
                        start_date: { sort: 'desc', nulls: 'last' }
                    }
                },
                take: 2
            },
            publication: {
                select: {
                    outreach: true
                },
                orderBy: {
                    outreach: {
                        year: { sort: 'desc', nulls: 'last' }
                    }
                },
            }
        }
    })
    console.log("center", center)
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
                            
                            <Grid container spacing={4} className="flex px-4 ">
                                {/* Left side */}
                                <Grid item xs={9} sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignContent:'centercenter'
                                    
                                }}
                                className="h-full my-auto">
                                    <Box className="mb-4">
                                        <Typography variant="h2" color="secondary">
                                            Data Resource Center ({center.short_label})
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" color="secondary" >
                                            {center.short_description}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Right side */}
                                <Grid item xs={2}>
                                    {center.icon && (
                                        <Image
                                            alt={center.id}
                                            width={150}
                                            height={150}
                                            src={center.icon}
                                            style={{ float: 'right' }}
                                        />
                                    )}
                                </Grid>
                            </Grid>
                          
                            <CardContent>
                                <Box className="pt-0">
                                    <Stack spacing={2}>
                                        <Typography variant="body2" color="secondary">
                                            • <b>Project Title</b>:  <Link href={`https://reporter.nih.gov/project-details/${center.grant_num}`} style={{ textDecoration: 'underline' }}>The CFDE Workbench ({center.grant_num})</Link>
                                        </Typography>
                                        <Typography variant="body2" color="secondary">
                                            • <b>Principal Investigators</b>:  <Link href="https://profiles.icahn.mssm.edu/avi-maayan" style={{ textDecoration: 'underline' }}>Avi Ma’ayan PhD</Link> and <Link href="https://jacobsschool.ucsd.edu/faculty/profile?id=19" style={{ textDecoration: 'underline' }}>Shankar Subramaniam PhD</Link>
                                        </Typography>
                                        <Typography variant="body2" color="secondary">
                                            • <b>Awardee Institutions</b>: <Link href="https://icahn.mssm.edu/" style={{ textDecoration: 'underline' }}>Icahn School of Medicine at Mount Sinai</Link> and <Link href="https://ucsd.edu/" style={{ textDecoration: 'underline' }}>University of California San Diego</Link>
                                        </Typography>
                                        <Typography variant="body2" color="secondary">
                                            • <b>Press Releases</b>
                                            <Link href="https://www.mountsinai.org/about/newsroom/2023/icahn-school-of-medicine-at-mount-sinai-and-the-university-of-california-san-diego-receive-eight-million-award-to-establish-a-data-integration-hub-for-nih-common-fund-supported-programs?pk_vid=38ebfcefb8e0f9051738603978be88d2" style={{ textDecoration: 'underline' }}>
                                                <Tooltip title="Icahn School of Medicine at Mount Sinai and the University of California San Diego Receive $8.5 Million Award to Establish a Data Integration Hub for NIH Common Fund Supported Programs" placement="right">
                                                    <OpenInNewIcon />
                                                </Tooltip>
                                            </Link>
                                            <Link href="https://www.genengnews.com/topics/artificial-intelligence/icahn-mount-sinai-and-uc-san-diego-to-establish-a-data-integration-hub/" style={{ textDecoration: 'underline' }}>
                                                <Tooltip title="Icahn Mount Sinai and UC San Diego to Establish a Data Integration Hub" placement="right">
                                                    <OpenInNewIcon />
                                                </Tooltip>
                                            </Link>
                                        </Typography>
                                        <Typography variant="body2" color="secondary">
                                            • <b>Center Website</b>: <Link href='cfde.info/' style={{ textDecoration: 'underline' }}>cfde.info</Link>
                                        </Typography>
                                        <Typography variant="body2" color="secondary">
                                            • <b>Publication</b>: <Link href='https://www.biorxiv.org/content/10.1101/2025.02.04.636535v1' >
                                            Evangelista JE, et al. 2025. <b>The CFDE Workbench: Integrating Metadata and Processed Data from Common Fund Programs.</b> bioRxiv. https://doi.org/10.1101/2025.02.04.636535
                                            </Link>
                                        </Typography>
                                    </Stack>
                                </Box>
                              
                                <Stack spacing={2} className="mt-8">
                                    <Typography variant="h5" color="secondary">
                                        About  
                                    </Typography>
                                    {/* <ExpandableDescription text={center.description || ''} /> */}
                                    <Box className="p-2">
                                    <Typography variant="body1" color="secondary">
                                    The CFDE Data Resource Center (DRC) was tasked with developing two web-based portals: an <b>Information Portal</b> to serve information about the CFDE and a <b>
                                        Data Portal</b> to host harmonized metadata and processed data contributed by participating CF Data Coordination Centers (DCCs) and other sources. By combining the data and information portals, the <b>
                                        CFDE Workbench</b> is a comprehensive resource where users can collect both information and data from CFDE and CF resources, as well as query disease, gene, drug, and other biological entities across standardized data formats from each CF DCC. 
                                        The CFDE Workbench consolidates efforts toward making CF programs funded resources harmonized, FAIR, and AI-ready.
                                        <br/><br/>
                                        To achieve these goals, the DRC team works collaboratively with the other CFDE newly established centers, the participating CFDE DCCs, the CFDE NIH team, and relevant external entities and potential consumers of these three software products. These interactions will be achieved via face-to-face meetings, virtual working groups meeting, one-on-one meetings, Slack, GitHub, project management software, and e-mail exchange. Via these interactions, we will establish standards, workstreams, feedback and mini projects towards accomplishing the goal of developing a lively and productive Common Fund Data Ecosystem. <br/><br/>
                                    </Typography>
                                 
                                    <Typography variant="body1" color="secondary">
                                        The <b>Data Portal</b> of the CFDE Workbench catalogs several types of uniformly processed data and metadata filesand other digital objects from each participating DCC.
                                        The <b>Information Portal</b> provides relevant information about each DCC and on overarching consortium activities that include training and outreach events, brief descriptions of CFDE partnership projects, and detailed community-established protocols.
                                    </Typography>
                                    </Box>
                                </Stack>
                                {center.publication.length >0 && (
                                    <Stack spacing={2} className="mt-8">
                                        <Typography variant="h5" color="secondary">
                                            Publications
                                        </Typography>
                                        <Box className="p-2">
                                            <SimplePublicationComponent publications={center.publication.map(p => p.outreach)}/>
                                        </Box>
                                    </Stack>
                                )}
                                <Stack className="mt-8">
                                    <Typography variant = "h5" color="secondary">
                                        Video Tutorial about the CFDE Workbench
                                    </Typography>
                                    <Box className="mt-4">
                                    <YoutubeEmbed embedId="TAnKcNp2kdY" />
                                    </Box>
                                </Stack>
                            </CardContent>
                           
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Paper>
    )
}
