import { GMTCrossLayout } from "./GMTCrossLayout";
import {  Typography, Grid } from "@mui/material";

export default async function GMTCross() {
    const inOneDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
	return (
		<Grid container spacing={1}>
			<Grid item xs={12} >
				<Typography sx={{ml:3, mt:2}} color="secondary" variant="h2">
					Common Fund Gene Set Crossing
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography sx={{ml:3, mb:2}} variant="subtitle1">
					Try crossing gene sets created from datasets produced by Common Fund programs to discover unexpected statistically significant overlaps between sets across programs. The crossed gene set pairs are ranked by the Fisher’s exact test p-value of the overlap. You can explore and export the overlapping genes, and receive an explanation about the unexpected overlap.
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<GMTCrossLayout sessionInfo={null} />
			</Grid>
		</Grid>
	)
}