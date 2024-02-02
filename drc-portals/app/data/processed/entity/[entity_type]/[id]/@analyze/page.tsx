import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { getItem } from "../item"
import modules from "./modules";

export default async function Page(props: { params: { entity_type: string, id: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const item = await getItem(props.params.id)
  return (
    <Grid container sx={{paddingTop: 5, paddingBottom: 5}}>
      <Grid item xs={12} sx={{marginBottom: 5}}>
        <Typography variant="h2" color="secondary">Analyze</Typography>
      </Grid>
      <Grid item xs={12} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules
          .filter(({ compatible }) => compatible(item))
          .map(({ button: ModButton }, i) => <ModButton key={i} item={item} />)}
      </Grid>
    </Grid>
  )
}
