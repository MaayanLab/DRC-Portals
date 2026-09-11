import { Grid, Typography } from "@mui/material";

export default function ChatPage() {
  return (
    <Grid spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h2" color="secondary" sx={{ ml: 3, mt: 2 }}>
          CFDE Text2Cypher
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={{ ml: 3, mt: 2, mb: 2 }}>
          Use the tabs below to switch between Query, Templates, and Schema.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {/* Feature goes here */}
      </Grid>
    </Grid>
  );
}
