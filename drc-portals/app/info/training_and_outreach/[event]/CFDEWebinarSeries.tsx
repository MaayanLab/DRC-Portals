import Image from "@/utils/image";
import { Grid,
	Typography,
	Stack,
	List,
	ListItem,
	Button,
	Paper,
	Box,
	Divider
} from "@mui/material";
import prisma from "@/lib/prisma";
import { OutreachWithDCCAndCenter } from "@/components/misc/Outreach";
import Link from "@/utils/link";

import Icon from '@mdi/react';
import { mdiYoutube, mdiClipboardEditOutline } from "@mdi/js"
import YoutubeEmbed from "@/components/misc/YoutubeEmbed";
import { ExpandableDescription } from "@/components/misc/Outreach/ExpandableDescription";
type AgendaType = {
	label: string,
	summary?: string,
	presenters: Array<{
		presenter: string,
		affiliation: string
	}>,
	video_link?: string
}


const Summary = ({section}: {section: AgendaType}) => (
	<Stack>
		<div className="flex flex-col space-y-2">
			{/* <Typography variant="body1">
				<b>{section.label}</b>
			</Typography> */}
		{(section.presenters || []).map(({presenter, affiliation})=>(
			<div className="flex flex-col">
				<Typography variant="body1">
					{presenter}
				</Typography>
				<Typography variant="body1">
					<i>{affiliation}</i>
				</Typography>
			</div>
		))}
		</div>
		{section.summary &&
		<ExpandableDescription text={section.summary} previewLines={4}/>
		}
	</Stack>

)

const UpcomingWebinar = ({webinar}: {webinar: OutreachWithDCCAndCenter}) => {
	const presenters: Array<AgendaType> = []
	if (Array.isArray(webinar.agenda)) {
		for (const item of webinar.agenda as Array<AgendaType>) {
			presenters.push(item)
		}
	}
	return (
		<Grid container sx={{marginBottom: 2}}>
			<Grid item xs={12} sm={6}>
				<Stack>
					{presenters.length > 0 && 
						<List sx={{marginLeft: -2}}>
							{presenters.map((section)=>(
								<ListItem key={section.label}>
									<Summary section={section}/>
								</ListItem>
							))}
						</List>
					}
					{(webinar.start_date && webinar.end_date) && <Typography sx={{marginBottom: 2}} variant="body1">{webinar.start_date.toLocaleDateString('default', {month: 'short', year: 'numeric', day: '2-digit', weekday: 'long'})}, {webinar.start_date.toLocaleTimeString('default', {hour: 'numeric', hour12: true, timeZone: 'America/New_York'}).replace(" PM","")}-{webinar.end_date.toLocaleTimeString('default', {hour: 'numeric', hour12: true, timeZone: 'America/New_York'})} ET</Typography>}
					<Link href="https://broadinstitute.zoom.us/webinar/register/WN_x0bGLLt4TbqFGlxlMM-T2A#/registration" target="_blank" rel="noopener noreferrer">
						<Button variant="contained" color="secondary" endIcon={<Icon path={mdiClipboardEditOutline} size={1}/>}>
							REGISTER FOR WEBINAR
						</Button>
					</Link>
					<Typography  sx={{marginTop: 2}}>
						{webinar.short_description}
					</Typography>
				</Stack>
			</Grid>
			<Grid item xs={12} sm={6}>
					{webinar.image && 
						<Paper elevation={0} className="flex flex-row relative" sx={{height: 250, backgroundColor: "transparent"}}>
							<Image src={webinar.image} alt={webinar.title} fill={true} style={{objectFit: "contain"}}/>
						</Paper>
					}	
					{webinar.flyer &&
					<div className="flex flext-col justify-center">
						<Link href={webinar.flyer}  target="_blank" rel="noopener noreferrer">
							<Button color="secondary">Download flyer as PDF</Button>
						</Link>
					</div>
					}	
			</Grid>
		</Grid>
	)
}

const PastWebinar = ({webinar}: {webinar: OutreachWithDCCAndCenter}) => {
	const presenters: Array<AgendaType> = []
	if (Array.isArray(webinar.agenda)) {
		for (const item of webinar.agenda as Array<AgendaType>) {
			presenters.push(item)
		}
	}
	return (
		<Stack sx={{marginBottom: 1}}>
			{(webinar.start_date && webinar.end_date) && 
				<Box sx = {{marginTop: 3}}>
					<Typography variant="h6" >
						<b>{webinar.start_date.toLocaleDateString('default', {month: 'short', year: 'numeric', day: '2-digit', weekday: 'long'})}</b>
					</Typography>
				</Box>
			}
			{presenters.length > 0 ? (
				<List sx={{marginLeft: -2}}>
					{presenters.map((section)=>(
						<ListItem key={section.label}>
							<Grid container sx={{marginBottom: 3}}>
								<Grid item  xs={12} sx={{marginBottom:2}} >
									<Typography variant="h6" color="secondary" >
										{section.label}
									</Typography>
									
								</Grid>
								<Grid item xs={12} sm={7}>
									<Stack>
										<Summary section={section}/>
										{section.video_link && <Link href={section.video_link} target="_blank" rel="noopener noreferrer">
											<Button  color="secondary" endIcon={<Icon path={mdiYoutube} size={1} />} sx={{marginLeft: -2}}>
												WATCH VIDEO ON YOUTUBE
											</Button>
										</Link>}
									</Stack>
								</Grid>
					
								<Grid item xs={12} sm={5}>
									{section.video_link && 
										<YoutubeEmbed embedId={section.video_link.split("?v=")[1]}/>
									}
								</Grid>
							</Grid>
						</ListItem>
					))}
				</List>
			):(
				<Grid sx={{marginTop:2, marginBottom: 4}}>
				<Typography variant="body1" color="secondary">
					The summary and video for the webinar will be added shortly.
				</Typography>
				</Grid>
			)}
			<Divider />
		</Stack>
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
			},
			centers: {
				include: {
					center: true
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
			},
			centers: {
				include: {
					center: true
				}
			}
		},
		orderBy: {
			start_date: 'desc'
		}
	})
	return (
		<Grid container spacing={1} justifyContent={"flex-start"} sx={{marginLeft:2}}>
			<Grid item xs={12}>
				<Typography variant="h2" color="secondary">
					CFDE Webinar Series
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="body1">
				Join us on the last Friday of each month from 1-2 PM Eastern Time to learn more about how the CFDE is harmonizing and discovering new knowledge by integrating datasets, tools and other resources from a collection of NIH Common Fund programs.
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="h3" color="secondary">
					Upcoming Webinars
				</Typography>
			</Grid>
			<Grid item xs={12} sx={{ marginbottom: 4}}>
				{upcoming_webinars.length === 0 ?
					<Typography variant="body1" color="secondary">
						More details will be added soon
					</Typography>: upcoming_webinars.map((webinar)=><UpcomingWebinar key={webinar.title} webinar={webinar}/>)
				}
			</Grid>
			<Grid item xs={12} sx={{ marginTop: 4}}>
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