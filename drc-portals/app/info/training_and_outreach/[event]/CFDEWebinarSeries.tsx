import Image from "next/image";
import { Grid,
	Typography,
	Tooltip,
	Stack,
	List,
	ListItem,
	Avatar,
	IconButton,
	Button,
	Accordion,
	AccordionSummary,
	AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import prisma from "@/lib/prisma";
import { OutreachWithDCC } from "@/components/misc/Outreach";
import Link from "next/link";
import ExportCalendar from "@/components/misc/Outreach/ExportCalendar";

import Icon from '@mdi/react';
import { mdiArrowRight, mdiYoutube } from "@mdi/js"


type AgendaType = {
	agenda: string,
	subtitle: string,
	summary: string,
	presenter: string,
	affiliation: string,
}

const UpcomingWebinar = ({webinar}: {webinar: OutreachWithDCC}) => {
	const presenters: Array<AgendaType> = []
	if (Array.isArray(webinar.agenda)) {
		for (const item of webinar.agenda as Array<AgendaType>) {
			presenters.push(item)
		}
	}
	return (
		<Grid container spacing={2} alignItems={'center'} justifyContent={"center"} sx={{marginBottom: 2}}>
			<Grid item xs={12} sm={6} className="relative" sx={{height: 200}}>
				<Image src={webinar.image || '/img/favicon.png'} alt={webinar.title} fill={true} style={{objectFit: "contain"}}/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						{(webinar.start_date && webinar.end_date) && <Typography variant="h5">{webinar.start_date.toLocaleDateString('default', {month: 'short', year: 'numeric', day: '2-digit', weekday: 'long'})}, {webinar.start_date.toLocaleTimeString('default', {hour: 'numeric', hour12: true}).replace(" PM","")}-{webinar.end_date.toLocaleTimeString('default', {hour: 'numeric', hour12: true, timeZoneName: 'short'})}</Typography>}
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h5">Agenda</Typography>
						{presenters.length > 0 && 
						<List dense>
							{presenters.map((presenter)=>(
								<ListItem key={presenter.agenda}>
									<Stack spacing={1}>
										<Typography variant="body1">
											<b>{presenter.agenda}</b> &nbsp;
											<i>{presenter.presenter}</i>
										</Typography>
										{presenter.summary && <Typography variant="body1">
												<b>Summary:</b> {presenter.summary}
										</Typography>}
									</Stack>
								</ListItem>
							))}
						</List>
						}
					</Grid>
					<Grid item xs={12}>
						<div className="flex items-center space-x-1">
							<Typography variant="body1">Will be presented by:</Typography>
							{webinar.dccs.map(({dcc})=>(
                                <div key={dcc.short_label} className="flex items-center justify-center relative">
                                    <Link href={`/info/dcc/${dcc.short_label}`}>
                                        <Tooltip title={dcc.short_label}>
                                            <IconButton sx={{minHeight: ["Metabolomics", "GTEx", "LINCS"].indexOf(dcc.short_label || '') === -1 ? 70: 40, minWidth: ["Metabolomics", "GTex"].indexOf(dcc.short_label || '') === -1 ? 60: 40}}>
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
					</Grid>
					<Grid item xs={12} className="flex justify-end">
						<ExportCalendar event={webinar}/>
						<Link href={'https://hugeamp.org/research.html?pageid=CFDE_webinars'} target="_blank" rel="noopener noreferrer">
							<Button  color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />}>VISIT PAGE</Button>
						</Link>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	)
}

const PastWebinar = ({webinar}: {webinar: OutreachWithDCC}) => {
	const presenters: Array<AgendaType> = []
	if (Array.isArray(webinar.agenda)) {
		for (const item of webinar.agenda as Array<AgendaType>) {
			presenters.push(item)
		}
	}
	return (
		<Grid container spacing={2} alignItems={'center'} justifyContent={"center"} sx={{marginBottom: 2}}>
			<Grid item xs={12} sm={6} className="relative" sx={{height: 200}}>
				<Image src={webinar.image || '/img/favicon.png'} alt={webinar.title} fill={true} style={{objectFit: "contain"}}/>
			</Grid>
			<Grid item xs={12} sm={6}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Typography variant="h5">Agenda</Typography>
						{presenters.length > 0 && 
						<List dense>
							{presenters.map((presenter)=>(
								<ListItem key={presenter.agenda}>
									{presenter.summary ?
										<Accordion elevation={0} sx={{background: "inherit", marginLeft: -2}}>
											<AccordionSummary
												expandIcon={<ExpandMoreIcon />}
												aria-controls="panel1-content"
												id="panel1-header"
												>
												<Typography variant="body1">
													<b>{presenter.agenda}</b> &nbsp;
													<i>{presenter.presenter}</i>
												</Typography>
											</AccordionSummary>
											<AccordionDetails>
												{presenter.summary && 
												<Typography variant="body1">
														<b>Summary:</b> {presenter.summary}
												</Typography>}
											</AccordionDetails>
										</Accordion>:
										<Typography variant="body1">
											<b>{presenter.agenda}</b> &nbsp;
											<i>{presenter.presenter}</i>
										</Typography>}
								</ListItem>
							))}
						</List>
						}
					</Grid>
					{webinar.dccs.length > 0 && <Grid item xs={12}>
						<div className="flex items-center space-x-1">
							<Typography variant="body1">Presented by:</Typography>
							{webinar.dccs.map(({dcc})=>(
                                <div key={dcc.short_label} className="flex items-center justify-center relative">
                                    <Link href={`/info/dcc/${dcc.short_label}`}>
                                        <Tooltip title={dcc.short_label}>
                                            <IconButton sx={{minHeight: ["Metabolomics", "GTEx", "LINCS"].indexOf(dcc.short_label || '') === -1 ? 70: 40, minWidth: ["Metabolomics", "GTex"].indexOf(dcc.short_label || '') === -1 ? 60: 40}}>
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
					</Grid>}
					<Grid item xs={12}>
						{(webinar.start_date && webinar.end_date) && <Typography variant="h5">Held on {webinar.start_date.toLocaleDateString('default', {month: 'short', year: 'numeric', day: '2-digit', weekday: 'long'})}</Typography>}
					</Grid>
					<Grid item xs={12} className="flex justify-end">
						{webinar.recording && <Link href={webinar.recording} target="_blank" rel="noopener noreferrer">
							<Button  color="secondary" endIcon={<Icon path={mdiYoutube} size={1} />}>
								WATCH VIDEO ON
							</Button>
						</Link>}
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	)
}

const CFDEWebinarSeries = async () => {
	const now = new Date()
	const upcoming_webinars = await prisma.outreach.findMany({
		where: {
			title: "CFDE Webinar Series",
			end_date: {
				gte: now
			}
		},
		include: {
			dccs: {
				include: {
					dcc: true
				}
			}
		},
	})
	const past_webinars = await prisma.outreach.findMany({
		where: {
			title: "CFDE Webinar Series",
			end_date: {
				lt: now
			}
		},
		include: {
			dccs: {
				include: {
					dcc: true
				}
			}
		},
	})
	return (
		<Grid container spacing={2} justifyContent={"flex-start"}>
			<Grid item xs={12}>
				<Typography variant="h2" color="secondary">
					CFDE Webinar Series
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="body1">
					The CFDE Webinar Series is established to highlight NIH Common Fund (CF) Data Coordination Centers (DCCs). Join us on the last Friday of each month at 1-2 PM ET to learn about the data, tools and research conducted by the  CFDE and the DCCs.
				</Typography>
			</Grid>
			<Grid item xs={12} sx={{marginBottom: 2}}>
				<Typography variant="h3" color="secondary">
					Upcoming Webinars
				</Typography>
			</Grid>
			<Grid item xs={12}>
				{upcoming_webinars.length === 0 ?
					<Typography variant="body1" color="secondary">
						More details will be added soon
					</Typography>: upcoming_webinars.map((webinar)=><UpcomingWebinar key={webinar.title} webinar={webinar}/>)
				}
			</Grid>
			<Grid item xs={12} sx={{marginBottom: 2}}>
				<Typography variant="h3" color="secondary">
					Past Webinars
				</Typography>
			</Grid>
			<Grid item xs={12}>
				{past_webinars.length === 0 ?
					<Typography variant="body1" color="secondary">
						More details will be added soon
					</Typography>: past_webinars.map((webinar)=><PastWebinar key={webinar.title} webinar={webinar}/>)
				}
			</Grid>
		</Grid>
	)
}

export default CFDEWebinarSeries