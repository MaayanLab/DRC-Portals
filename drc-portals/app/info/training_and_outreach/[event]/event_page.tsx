import { Grid, Typography, Container, Stack, Tooltip, IconButton } from "@mui/material";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Icon from '@mdi/react';
import { mdiHelpRhombusOutline, mdiPageNextOutline } from '@mdi/js';
import Markdown from "@/components/misc/MarkdownComponent";
import ExportCalendar from "@/components/misc/Outreach/ExportCalendar";
import Link from "next/link";
export const EventPage = async ({id}: {id: string}) => {
	const event = await prisma.outreach.findFirst({
		where: {
			id
		},
		include: {
			dccs: {
				include: {
					dcc: true
				}
			}
		},
	})
	if (event === null) {
		return (
			<Container maxWidth="sm" >
				<Stack spacing={5} sx={{marginTop: 10}} alignItems={"center"}>
					<Icon className="text-center" path={mdiHelpRhombusOutline} size={3} />
					<Typography className="text-center" variant="h2">Not Found</Typography>
					<Typography className="text-center" variant="body1">
						Oops, we did not find that page.
					</Typography>
				</Stack>
			</Container>
		)	
	}
	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Typography variant="h2" color="secondary">{event.title}</Typography>
			</Grid>
			<Grid item xs={12} md={6}>
				<Markdown markdown={event.description}/>
				<Stack direction={"row"} spacing={1} justifyContent={'flex-end'}>
					<ExportCalendar event={event} />
					{event.link && <Tooltip title={"Go to event's page"}><Link href={event.link} target="_blank" rel="noopener noreferrer"><IconButton color="secondary"><Icon path={mdiPageNextOutline} size={1} /></IconButton></Link></Tooltip>}
				</Stack>
			</Grid>
			<Grid item xs={12} md={6}>
				<Image src={event.image || ''} alt={event.title} width={500} height={500}/>
			</Grid>
		</Grid>
	)
}