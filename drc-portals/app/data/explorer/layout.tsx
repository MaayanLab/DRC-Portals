import { Grid } from "@mui/material";
import NavButton from "./navbutton";
export default function ConciergeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
	<Grid container spacing={2}>
	  <Grid item xs={12}>
	  	{children}
		<NavButton/>
	  </Grid>
	</Grid>
	);
}
