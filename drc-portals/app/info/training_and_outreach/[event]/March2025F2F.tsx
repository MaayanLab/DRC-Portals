import Image from "@/utils/image";
import { Grid, Typography } from "@mui/material";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

export default function March2024F2F () {
	return(
		<Grid container spacing={2} alignItems={"flex-start"} sx={{marginTop: 5, marginBottom: 5}}>
			<Grid item xs={12}>
				<Typography variant="h2">The NIH CFDE March 2025 All-Hands Meeting</Typography>
				<Typography variant="subtitle2">March 25-26, 2024</Typography>
				<Typography variant="subtitle2"><b>Bethesda Marriott Hotel, Bethesda, MD</b></Typography>
			</Grid>
			<Grid item xs={12} sm={5}>
				<Typography variant="body1" sx={{textAlign: 'justify'}}>
					The Common Fund Data Ecosystem (CFDE) 2024 All-Hands Meeting took place on March 25-26, 2024 in Bethesda, MD.  Sessions included introductions of new CFDE members, partnership updates, research projects, breakout sessions, open discussion, and a poster session with over fifty participants.
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
					<ListItem><Typography variant="body1"><b>Pauline Brochet:</b> Identifying exercise-mimetic drugs using LINCS and MoTrPAC data</Typography></ListItem>
					<ListItem><Typography variant="body1"><b>Cheng-Han Chung:</b> GeneSight: Advancing Insights into Complex Genetic Traits through CFDE-Enriched Knowledge Graphs</Typography></ListItem>
					<ListItem><Typography variant="body1"><b>David Jimenez-Morales:</b> Building a Bioinformatics Ecosystem for Large-Scale Multi-Omics Research: Lessons from MoTrPAC</Typography></ListItem>
					<ListItem><Typography variant="body1"><b>Ido Diamant:</b>  Preparing and Serving Common Supported Highly Processed Datasets in the Croissant Metadata Standard</Typography></ListItem>
					<ListItem><Typography variant="body1"><b>Christopher Patsalis:</b> Probing the Breadth of the Molecular Response to Exercise using Common Funds Metabolomics Data</Typography></ListItem>
					<ListItem><Typography variant="body1"><b>Daniall Masood:</b> BiomarkerKB: A Comprehensive Biomarker Knowledgebase</Typography></ListItem>
				</List>
			</Grid>

			<Grid item xs={12} sm={7} className="flex justify-center items-center">
				<Image src='/img/poster-winners.png' alt='f2f' width={450} height={450}/>
			</Grid>
		</Grid>
	)
}