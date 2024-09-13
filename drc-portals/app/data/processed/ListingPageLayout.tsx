import React from "react"
import { Paper, Grid, Typography } from "@mui/material"

export default function ListingPageLayout(props: React.PropsWithChildren<{
  count?: number,
  maxCount?: number,
  filters?: React.ReactNode,
  footer?: React.ReactNode,
}>) {
  return (
    <Grid container justifyContent={"center"} spacing={2}>
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12} sm={props.filters ? 9 : 12}>
          {props.children}
        </Grid>
        { props.filters &&
          <Grid item xs={12} sm={3}>
            <Paper sx={{background: "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)", height: '100%', padding: "12px 24px" }} elevation={0}>
              {props.count && (!props.maxCount || props.maxCount > props.count) ? <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
                <Typography variant="h5">Results found</Typography>
                <Typography variant="h5">{props.count.toLocaleString()}</Typography>
              </div> : <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
                <Typography variant="h5">Results</Typography>
              </div>}
              <div className="flex flex-col text-lg">
                {props.filters}
              </div>
            </Paper>
          </Grid>
        }
      </Grid>
      <Grid item xs={12}>
        {props.footer}
      </Grid>
    </Grid>
  )
}
