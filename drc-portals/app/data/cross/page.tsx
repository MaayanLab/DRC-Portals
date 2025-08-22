import { GMTCrossLayout } from "./GMTCrossLayout";
import {  Typography } from "@mui/material";
import Container from "@mui/material/Container";

export default async function GMTCross() {
    const inOneDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
	return (
		<>
			<Container>
				<Container>
					<div className='flex items-center'>
						<Typography variant="h3" color="secondary.dark" sx={{ mb: 2, mt: 2 }}>COMMON FUND GENE SET CROSSING</Typography>
					</div>
					<Typography variant="subtitle1" color="#666666" sx={{ mb: 3 }}>
						Try crossing gene sets created from datasets produced by Common Fund programs to discover unexpected statistically significant overlaps between sets across programs. The crossed gene set pairs are ranked by the Fisher’s exact test p-value of the overlap. You can explore and export the overlapping genes, and receive an explanation about the unexpected overlap.
					</Typography>
					<GMTCrossLayout sessionInfo={null} />
				</Container>
			</Container>
		</>
	)
}