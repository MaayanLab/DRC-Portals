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
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import prisma from "@/lib/prisma";
import { OutreachWithDCC } from "@/components/misc/Outreach";
import Link from "next/link";
import ExportCalendar from "@/components/misc/Outreach/ExportCalendar";

import Icon from '@mdi/react';
import { mdiArrowRight, mdiYoutube, mdiClipboardEditOutline } from "@mdi/js"
import YoutubeEmbed from "@/components/misc/YoutubeEmbed";
type AgendaType = {
	label: string,
	summary?: string,
	presenters: Array<{
		presenter: string,
		affiliation: string
	}>,
	video_link?: string
}

const UpcomingWebinar = ({webinar}: {webinar: OutreachWithDCC}) => {
	const presenters: Array<AgendaType> = []
	if (Array.isArray(webinar.agenda)) {
		for (const item of webinar.agenda as Array<AgendaType>) {
			presenters.push(item)
		}
	}
	return (
		<Stack sx={{marginBottom: 2}}>
			{presenters.length > 0 && 
				<List sx={{marginLeft: -2}}>
					{presenters.map((section)=>(
						<ListItem key={section.label}>
							<Stack>
								<Typography variant="body1">
									<b>{section.label}</b>
								</Typography>
								{section.presenters.map(({presenter, affiliation})=>(
									<>
										<Typography variant="body1">
											{presenter}
										</Typography>
										<Typography variant="body1">
											<i>{affiliation}</i>
										</Typography>
									</>
								))}
								{section.summary && <Typography variant="body1">
										<b>Summary:</b> {section.summary}
								</Typography>}
							</Stack>
						</ListItem>
					))}
				</List>
			}
			{(webinar.start_date && webinar.end_date) && <Typography sx={{marginBottom: 2}} variant="body1">{webinar.start_date.toLocaleDateString('default', {month: 'short', year: 'numeric', day: '2-digit', weekday: 'long'})}, {webinar.start_date.toLocaleTimeString('default', {hour: 'numeric', hour12: true, timeZone: 'America/New_York'}).replace(" PM","")}-{webinar.end_date.toLocaleTimeString('default', {hour: 'numeric', hour12: true, timeZoneName: 'short', timeZone: 'America/New_York'})}</Typography>}
			<Link href="https://broadinstitute.zoom.us/webinar/register/WN_x0bGLLt4TbqFGlxlMM-T2A#/registration" target="_blank" rel="noopener noreferrer">
				<Button variant="contained" color="secondary" endIcon={<Icon path={mdiClipboardEditOutline} size={1}/>}>
					REGISTER FOR WEBINAR
				</Button>
			</Link>
		</Stack>
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
		<Stack sx={{marginBottom: 2}}>
			{(webinar.start_date && webinar.end_date) && <Typography variant="body1">{webinar.start_date.toLocaleDateString('default', {month: 'short', year: 'numeric', day: '2-digit', weekday: 'long'})}</Typography>}
			{presenters.length > 0 && 
				<List sx={{marginLeft: -2}}>
					{presenters.map((section)=>(
						<ListItem key={section.label}>
							<Stack>
								<Typography variant="body1">
								<b>{section.label}</b>
								</Typography>
								<div className="flex flex-col space-y-2">
								{section.presenters.map(({presenter, affiliation})=>(
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
								{section.video_link && <Link href={section.video_link} target="_blank" rel="noopener noreferrer">
									<Button  color="secondary" endIcon={<Icon path={mdiYoutube} size={1} />} sx={{marginLeft: -2}}>
										WATCH VIDEO ON
									</Button>
								</Link>}
							</Stack>
						</ListItem>
					))}
				</List>
			}
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
		<Grid container spacing={1} justifyContent={"flex-start"}>
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
			<Grid item xs={12}>
				{upcoming_webinars.length === 0 ?
					<Typography variant="body1" color="secondary">
						More details will be added soon
					</Typography>: upcoming_webinars.map((webinar)=><UpcomingWebinar key={webinar.title} webinar={webinar}/>)
				}
			</Grid>
			<Grid item xs={12}>
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