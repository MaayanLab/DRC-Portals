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
		<Stack spacing={2} sx={{marginBottom: 2}}>
			{presenters.length > 0 && 
				<List>
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
			{(webinar.start_date && webinar.end_date) && <Typography variant="h5">{webinar.start_date.toLocaleDateString('default', {month: 'short', year: 'numeric', day: '2-digit', weekday: 'long'})}, {webinar.start_date.toLocaleTimeString('default', {hour: 'numeric', hour12: true, timeZone: 'UTC'}).replace(" PM","")}-{webinar.end_date.toLocaleTimeString('default', {hour: 'numeric', hour12: true, timeZoneName: 'short', timeZone: 'UTC'})}</Typography>}
			<div className="flex justify-start" style={{marginLeft: -15}}>
				<ExportCalendar event={webinar}/>
				<Link href={'https://hugeamp.org/research.html?pageid=CFDE_webinars'} target="_blank" rel="noopener noreferrer">
					<Button  color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />}>VISIT PAGE</Button>
				</Link>
			</div>
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
		<Grid container alignItems={'flex-start'} sx={{marginBottom: 2}}>
			<Grid item xs={12} sm={6}>
				<Stack spacing={2}>
					{presenters.length > 0 && 
						<List>
							{presenters.map((presenter)=>(
								<ListItem key={presenter.agenda}>
									<Stack spacing={1}>
										<Typography variant="body1">
											<b>{presenter.agenda}</b> &nbsp;
											<i>{presenter.presenter}</i>
										</Typography>
									</Stack>
								</ListItem>
							))}
						</List>
					}
					{(webinar.start_date && webinar.end_date) && <Typography variant="h5">Held on {webinar.start_date.toLocaleDateString('default', {month: 'short', year: 'numeric', day: '2-digit', weekday: 'long'})}</Typography>}
					{webinar.recording && <Link href={webinar.recording} target="_blank" rel="noopener noreferrer">
						<Button  color="secondary" endIcon={<Icon path={mdiYoutube} size={1} />} sx={{marginLeft: -2}}>
							WATCH VIDEO ON
						</Button>
					</Link>}
				</Stack>
			</Grid>
			{webinar.recording && <Grid item xs={12} sm={6}>
				<YoutubeEmbed embedId={webinar.recording.split("?v=")[1]}/>
			</Grid>}
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
		<Grid container spacing={1} justifyContent={"flex-start"}>
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
			<Grid item xs={12}>
				<Typography variant="h3" color="secondary">
					Sign Up
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<div className="flex flex-col">
					<Link href="https://broadinstitute.zoom.us/webinar/register/WN_x0bGLLt4TbqFGlxlMM-T2A#/registration" rel="noopener noreferrer">
						<Button color="secondary">https://broadinstitute.zoom.us/webinar/register/WN_x0bGLLt4TbqFGlxlMM-T2A#/registration</Button>
					</Link>
					<Link href="https://broadinstitute.zoom.us/webinar/register/WN_x0bGLLt4TbqFGlxlMM-T2A#/registration" rel="noopener noreferrer">
						<Button sx={{marginLeft: 2}} variant="contained" color="secondary" endIcon={<Icon path={mdiClipboardEditOutline} size={1}/>}>
							SIGN UP
						</Button>
					</Link>
				</div>
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