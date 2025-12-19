import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import modules from "@/app/data/processed/_analyze"
import { EntityType } from "@/app/data/processed/utils";

export default function EntityPageAnalyze(props: { item: EntityType }) {
  const compatibleModules = modules.filter(({ compatible }) => compatible(props.item))
  if (compatibleModules.length === 0) return null
  return (
    <Grid sx={{paddingTop: 5, paddingBottom: 5}}>
      <Grid item xs={12} sx={{marginBottom: 5}}>
        <Typography variant="h2" color="secondary">Analyze</Typography>
      </Grid>
      <Grid item xs={12} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules
          .filter(({ compatible }) => compatible(props.item))
          .map(({ button: ModButton }, i) => <ModButton key={i} item={props.item} />)}
      </Grid>
    </Grid>
  )
}
