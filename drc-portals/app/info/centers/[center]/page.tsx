import prisma from "@/lib/prisma";
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
    Box,
    Link
  } from '@mui/material';
import { notFound } from 'next/navigation'
import React from "react";
import SimplePublicationComponent from "@/components/misc/Publication/SimplePublicationComponent";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReactMarkdown from 'react-markdown'
import remarkGfm from "remark-gfm"
import {  PRenderer } from '@/components/misc/ReactMarkdownRenderers'
import YoutubeEmbed from "@/components/misc/YoutubeEmbed";

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
            },
            publication: {
                include: {
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
            }
        }
    })
    const principal_investigators = center?.principal_investigators as {name: string, url?: string }[]
    const institution = center?.institution as {name: string, url?: string }[]
    const press_release = center?.press_release as {title: string, url?: string }[]
    const publications = center?.publication.map(i=>i.publication) || []
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
                    {/* <Grid item xs={12}>
                        <Typography variant="h3">{center.label}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                    <Typography sx={{textAlign: "justify"}} variant="caption">{center.short_description}
                        {center.homepage && <>&nbsp;<Link color="secondary" variant="caption" href={center.homepage || ''} target="_blank" rel="noopener noreferrer">{center.homepage}</Link></>}                    
                    </Typography>
                    </Grid> */}
                    <Grid item xs={12} md={3}>
                        <Card elevation={0} sx={{ background: "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)", height: '100%', padding: "0px 24px" }}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Image alt={center.id} width={150} height={150} src={center.icon || "https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/favicon.png"} />
                            </Box>
                            <CardContent>
                                <Stack spacing={2} justifyContent={"center"}>
                                    <Stack>
                                        <Typography variant="caption">Grant Number: <Link color="secondary" variant="caption" href={`https://reporter.nih.gov/project-details/${center.grant_num}`} target="_blank" rel="noopener noreferrer">{center.grant_num}</Link></Typography>
                                    </Stack>
                                    <Stack>
                                        <Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", maxWidth: 300, textAlign: "center"}} variant="caption">PRINCIPAL INVESTIGATORS</Typography>
                                        {principal_investigators?.map((pi: {name: string, url?: string})=>(
                                            pi.url ? <Link key={pi.name} color="secondary" variant="caption" href={pi.url} target="_blank" rel="noopener noreferrer">{pi.name}</Link>:
                                            <Typography color="black" variant="caption">{pi.name}</Typography>
                                        ))}
                                    </Stack>
                                    <Stack>
                                        <Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", maxWidth: 300, textAlign: "center"}} variant="caption">AWARDEE INSTITUTIONS</Typography>
                                        {institution?.map((inst: {name: string, url?: string})=>(
                                            inst.url ? <Link key={inst.name} color="secondary" variant="caption" href={inst.url} target="_blank" rel="noopener noreferrer">{inst.name}</Link>:
                                            <Typography color="black" variant="caption">{inst.name}</Typography>
                                        ))}
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={9}>
                        <Stack spacing={2}>
                        <Typography variant="h2" color="secondary">{center.label}</Typography>
                        <Typography sx={{textAlign: "justify"}} variant="caption">{center.short_description}
                            {center.homepage && <>&nbsp;<Link color="secondary" variant="caption" href={center.homepage || ''} target="_blank" rel="noopener noreferrer">{center.homepage}</Link></>}                    
                        </Typography>
                        {publications.length > 0 &&
                            <>
                                <Typography variant="h4" sx={{marginBottom: 3}} color="secondary">Publication</Typography>
                                <SimplePublicationComponent publications={publications}/>
                            </>
                        }
                        {press_release &&
                            <Stack spacing={1}>
                                <Typography variant="h4" sx={{marginBottom: 3}} color="secondary">Press Release</Typography>
                                {press_release.map(({title, url})=>(
                                    <Link key={title} color="secondary" variant="caption" href={url} target="_blank" rel="noopener noreferrer">{title}<OpenInNewIcon /></Link>
                                ))}
                            </Stack>
                        }
                            <Typography variant="h4" sx={{marginBottom: 3}} color="secondary">About</Typography>
                            <ReactMarkdown 
                                skipHtml
                                remarkPlugins={[remarkGfm]}
                                components={{ 
                                    p: PRenderer,
                                }}
                                className="prose max-w-none">
                                    {center.description?.replace("<br/>", "&nbsp;\n\n")}
                            </ReactMarkdown>
                            {center.video_tutorial && <>
                                <Typography variant="h4" sx={{marginBottom: 3}} color="secondary">Video Tutorial</Typography>
                                <Box className="mt-4">
                                    <YoutubeEmbed embedId="TAnKcNp2kdY" />
                                </Box>
                            </>}
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Paper>
    )
}
