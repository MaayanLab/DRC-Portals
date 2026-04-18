import { Grid, Typography, Avatar, Stack } from "@mui/material";
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
export default function ConciergeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
	<Grid container spacing={2}>
	  {/* <Grid item xs={12}>
		<Stack direction={'row'} spacing={1} alignItems={"center"}>
			<Avatar sx={{backgroundColor: 'secondary.main'}}><Icon path={mdiMagnify} size={1} /></Avatar>
			<Typography variant="h2" color="secondary">
			CFDE Workbench Explorer
			</Typography>
		</Stack>
	  </Grid> */}
	  {/* <Grid item xs={12}>
		<Typography variant="body1">
			Hi! I am the CFDE Workbench Concierge. I'm here to provide information about the CFDE 
			and help you access and execute tools created by CFDE DCCs. 
			Please start by selecting a query you are interested in, and I'll try my best to help you answer it.
		</Typography>
	  </Grid> */}
	  <Grid item xs={12}>
	  	{children}
	  </Grid>
	</Grid>
	);
}
