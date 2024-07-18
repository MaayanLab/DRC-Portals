import Image from "next/image";
import { Grid, Typography } from "@mui/material";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

export default function March2024F2F () {
	return(
		<Grid container spacing={2} alignItems={"flex-start"} sx={{marginTop: 5, marginBottom: 5}}>
			<Grid item xs={12}>
				<Typography variant="h2">The NIH CFDE March 2024 All-Hands Meeting</Typography>
				<Typography variant="subtitle2">March 19-20, 2024</Typography>
				<Typography variant="subtitle2"><b>The Bethesdan Hilton Hotel, Bethesda, MD</b></Typography>
			</Grid>
			<Grid item xs={12} sm={5}>
				<Typography variant="body1" sx={{textAlign: 'justify'}}>
					The Common Fund Data Ecosystem (CFDE) 2024 All-Hands Meeting took place on March 19-20, 2024 in Bethesda, MD.  Sessions included introductions of new CFDE members, partnership updates, research projects, breakout sessions, open discussion, and a poster session with over fifty participants.
				</Typography>
				
			</Grid>
			<Grid item xs={12} sm={7} className="flex justify-center items-center">
				<Image src='/img/Mar2024f2f.png' alt='f2f' width={450} height={450}/>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="h3">
					Blue Ribbon Posters
				</Typography>
			</Grid>
			<Grid item xs={12} sm={5}>
				<Typography variant="body1">
					The following presenters were awarded a blue ribbon during the second day of the meeting.
				</Typography>
				<List dense>
					<ListItem><Typography variant="body1"><b>Jimmy Zhen:</b> The MoTrPAC Data Hub: a suite of interactive tools for the dissemination of large scale multi-omics data (MoTrPac) </Typography></ListItem>
					<ListItem><Typography variant="body1"><b>David Jimenez-Morales:</b> Unveiling the Multi-Omic Landscape of Endurance Exercise: Biological Insights and Data Integration from the MoTrPAC Study (MoTrPac) </Typography></ListItem>
					<ListItem><Typography variant="body1"><b>John Erol Evangelista:</b> Interactive User Interface for the CFDE Data Distillery Knowledge Graph Partnership (LINCS/DRC) </Typography></ListItem>
					<ListItem><Typography variant="body1"><b>Giacomo Marino:</b> Implementing a Chatbot for Interacting with the CFDE Information and Data Resource Portals (LINCS/DRC) </Typography></ListItem>
					<ListItem><Typography variant="body1"><b>Nasheath Ahmend:</b> The CFDE Social Network Knowledge Graph (LINCS/DRC) </Typography></ListItem>
					<ListItem><Typography variant="body1"><b>Stephanie Olaiya:</b> Get-Gene-Set-Go: Web Interface for Assembling, Augmenting, Combining, Visualizing, and Analyzing CFDE Gene Sets (LINCS/DRC) </Typography></ListItem>
					<ListItem><Typography variant="body1"><b>Daniel Clarke:</b> The Common Fund Data Ecosystem Data Resource Portal (LINCS/DRC) </Typography></ListItem>
					<ListItem><Typography variant="body1"><b>Yasin El Abiedad:</b> Streamlining Metadata Harmonization and Maximizing the Reuse of Public Raw Data in Metabolomics (R03 awardee) </Typography></ListItem>
				</List>
			</Grid>

			<Grid item xs={12} sm={7} className="flex justify-center items-center">
				<Image src='/img/poster-winners.png' alt='f2f' width={450} height={450}/>
			</Grid>
		</Grid>
	)
}