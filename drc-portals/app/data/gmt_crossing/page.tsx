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
						Cross Common Fund GMTs to explore their similarity for novel hypothesis generation. Each gene set pair is displayed with their Fisher exact test p-value, odds ratio and overlapping genes. Add gene sets to your cart to cross your assembled sets with CFDE gene set libraries.
					</Typography>
					<GMTCrossLayout sessionInfo={null} />
				</Container>
			</Container>
		</>
	)
}