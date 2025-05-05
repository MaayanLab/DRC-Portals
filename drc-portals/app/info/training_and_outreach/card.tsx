'use client'
import { Avatar, Typography, Card, CardContent, CardActions, Stack, Tooltip, IconButton, Chip, Container } from "@mui/material";
import Image from "next/image";
import Icon from '@mdi/react';
import { mdiPageNextOutline, mdiRepeat } from '@mdi/js';
import { MarkdownPlain } from "@/components/misc/MarkdownComponent";
import ExportCalendar from "@/components/misc/Outreach/ExportCalendar";
import Link from "next/link";
import { OutreachWithDCCAndCenter } from "@/components/misc/Outreach";
import { OutreachParams } from "./page";
import { ExpandButton } from "./modal";
export const OutreachCard = ({e, expanded=false, parsedParams}: {e: OutreachWithDCCAndCenter, expanded?: boolean, parsedParams: OutreachParams}) => {
    let tags:string[] = []
    if (Array.isArray(e.tags)) {
        tags = e.tags as string[]
    }
    const now = new Date()
    const start_date = e.start_date?.toLocaleString('default', {  weekday: 'short', month: 'short',  day: '2-digit', year: 'numeric'})
    const end_date = e.end_date?.toLocaleString('default', {  weekday: 'short', month: 'short',  day: '2-digit', year: 'numeric'})
    const start_month = e.start_date?.toLocaleString('default', { month: 'short', year: 'numeric'})
    const end_month = e.end_date?.toLocaleString('default', { month: 'short', year: 'numeric'})
    const start_app = e.application_start?.toLocaleString('default', { month: 'short', year: 'numeric'})
    const end_app = e.application_end?.toLocaleString('default', { month: 'short', year: 'numeric'})
    const hosts = [...e.dccs, ...e.centers]
    console.log(e.centers)
    return (
        <Card sx={{height: "100%", display: "flex", flexDirection: "column"}}>
            {tags.length > 0 && <Stack
                direction={"row"}
                spacing={1}
                sx={{padding: 1}}
                alignItems={"center"}
            >
                {tags.map((tag, i)=> {
                    const {tags = [], ...rest } = parsedParams
                    const new_tags = [...tags]
                    if (tags.indexOf(tag) === -1) new_tags.push(tag)
                    const query = {
                        ...rest,
                        tags: new_tags
                    }
                    return (
                        <Link key={tag} href={`/info/training_and_outreach?filter=${JSON.stringify(query)}`}>
                            <Chip variant="filled" sx={{ textTransform: "capitalize", backgroundColor: tag === "internship"? "tertiary.main": "primary.main", color: tag === "internship"?"#FFF":"secondary.main", borderRadius: 2}} size="small" key={i} label={tag?.toString()}/>
                        </Link>
                    )
                })}
                {e.centers.map(({center})=>(
                    <div key={center.short_label} className="flex items-center justify-center relative">
                        <Link href={`/info/center/${center.short_label}`}>
                            <Tooltip title={center.short_label}>
                                <IconButton sx={{minHeight: 60, minWidth: 60}}>
                                    {center.icon ? 
                                        <Image src={center.icon || ''} alt={center.id} fill={true} style={{objectFit: "contain"}}/>:
                                        <Avatar>{center.label[0]}</Avatar>
                                    }
                                </IconButton>
                            </Tooltip>
                        </Link>
                    </div>
                ))}
                {e.dccs.map(({dcc})=>(
                    <div key={dcc.short_label} className="flex items-center justify-center relative">
                        <Link href={`/info/dcc/${dcc.short_label}`}>
                            <Tooltip title={dcc.short_label}>
                                <IconButton sx={{minHeight: ["Metabolomics", "GTEx", "LINCS"].indexOf(dcc.short_label || '') === -1 ? 50: 40, minWidth: ["Metabolomics", "GTEx", "SPARC"].indexOf(dcc.short_label || '') === -1 ? 60: 40}}>
                                    {dcc.icon ? 
                                        <Image src={dcc.icon || ''} alt={dcc.id} fill={true} style={{objectFit: "contain"}}/>:
                                        <Avatar>{dcc.label[0]}</Avatar>
                                    }
                                </IconButton>
                            </Tooltip>
                        </Link>
                    </div>
                ))}
                {/* <Image src={e.image} alt={e.title} width={400} height={300}/> */}
            </Stack>}
            <div className="flex flex-grow flex-row justify-center"
                style={{
                overflow: "hidden",  
                minHeight: 100,
                position: "relative",
                zIndex: 2, 
                }}
            >
                <Image src={e.image || ''} alt={e.title} fill={true} style={{objectFit: "contain"}}/>
                {/* <Image src={e.image} alt={e.title} width={400} height={300}/> */}
            </div>
            <CardContent sx={{flexGrow: 1, paddingBottom: 0}}>
                <Typography variant={"h5"} color="secondary">{e.title}</Typography>
                <Stack>
                {(e.start_date && e.end_date && start_date === end_date)  ?
                    <Typography variant="caption">{e.start_date.toLocaleString('default', {  weekday: 'short', month: 'short',  day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} to {e.end_date.toLocaleString('default', {hour: '2-digit', minute: '2-digit' })}{e.recurring &&  <i>, Recurring activity</i>}</Typography>:
                    (e.start_date && e.end_date && start_month === end_month) ?
                    <Typography variant="caption">{e.start_date.toLocaleString('default', { month: 'short',  day: '2-digit'})} - {e.end_date.getDate()}, {e.end_date.getFullYear()}{e.recurring &&  <i>, Recurring activity</i>}</Typography>:
                    (e.start_date && e.end_date && start_month !== end_month) ?
                    <Typography variant="caption">{e.start_date.toLocaleString('default', { month: 'short',  day: '2-digit', year: 'numeric'})} - {e.end_date.toLocaleString('default', { month: 'short',  day: '2-digit', year: 'numeric'})}{e.recurring &&  <i>, Recurring activity</i>}</Typography>:
                    (e.start_date && !e.end_date) ? <Typography variant="caption">{e.start_date.toLocaleString('default', {  weekday: 'short', month: 'short',  day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}{e.recurring &&  <i>, Recurring activity</i>}</Typography>:
                    (!e.start_date && e.end_date) ? <Typography variant="caption">Through {e.end_date.toLocaleString('default', {  month: 'short',  day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}{e.recurring &&  <i>, Recurring activity</i>}</Typography>: null
                }
                {(e.application_start && e.application_end && e.application_end < now) ? <Typography variant="caption">Application period has ended</Typography> :
                (e.application_start && e.application_end && start_app === end_app) ? <Typography variant="caption">Application period: {e.application_start.toLocaleString('default', { month: 'short',  day: '2-digit'})} - {e.application_end.getDate()}, {e.application_end.getFullYear()}</Typography>:
                (e.application_start && e.application_end && start_app !== end_app) ?
                    <Typography variant="caption">Application period: {e.application_start.toLocaleString('default', { month: 'short',  day: '2-digit'})} - {e.application_end.toLocaleString('default', { month: 'short',  day: '2-digit', year: 'numeric'})}</Typography>        
                :null}
                {e.schedule &&  <Typography variant="caption">{e.schedule}{e.recurring &&  <i>, Recurring activity</i>}</Typography>}
                {/* {e.recurring &&  <Typography variant="caption"><i>Recurring activity</i></Typography>} */}
            </Stack>
            {/* {hosts.length > 0 && 
            <div className="flex items-center gap-1">
                <div><Typography variant="body2" color="secondary"><b>Hosted by:</b></Typography></div>
                        {e.centers.map(({center})=>(
                            <div key={center.short_label} className="flex items-center justify-center relative">
                                <Link href={`/info/center/${center.short_label}`}>
                                    <Tooltip title={center.short_label}>
                                        <IconButton sx={{minHeight: 60, minWidth: 60}}>
                                            {center.icon ? 
                                                <Image src={center.icon || ''} alt={center.id} fill={true} style={{objectFit: "contain"}}/>:
                                                <Avatar>{center.label[0]}</Avatar>
                                            }
                                        </IconButton>
                                    </Tooltip>
                                </Link>
                            </div>
                        ))}
                        {e.dccs.map(({dcc})=>(
                            <div key={dcc.short_label} className="flex items-center justify-center relative">
                                <Link href={`/info/dcc/${dcc.short_label}`}>
                                    <Tooltip title={dcc.short_label}>
                                        <IconButton sx={{minHeight: ["Metabolomics", "GTEx", "LINCS"].indexOf(dcc.short_label || '') === -1 ? 50: 40, minWidth: ["Metabolomics", "GTEx", "SPARC"].indexOf(dcc.short_label || '') === -1 ? 60: 40}}>
                                            {dcc.icon ? 
                                                <Image src={dcc.icon || ''} alt={dcc.id} fill={true} style={{objectFit: "contain"}}/>:
                                                <Avatar>{dcc.label[0]}</Avatar>
                                            }
                                        </IconButton>
                                    </Tooltip>
                                </Link>
                            </div>
                        ))}
                        
            </div>
            } */}
            {expanded && <MarkdownPlain markdown={e.description}/>}
            </CardContent>
            <CardActions sx={{justifyContent: "flex-end", paddingTop: 0, marginTop: -1}}>
                {/* {e.recurring && <Tooltip title={"Recurring Activity"}><Icon style={{color: }} path={mdiRepeat} size={1} /></Tooltip>} */}
                <ExportCalendar event={e} />
                {!expanded && <ExpandButton e={e} parsedParams={parsedParams}/>}
                {e.link && <Tooltip title={"Go to event's page"}><Link href={e.link} target="_blank" rel="noopener noreferrer"><IconButton color="secondary"><Icon path={mdiPageNextOutline} size={1} /></IconButton></Link></Tooltip>}
            </CardActions>
            </Card>
    )
}
