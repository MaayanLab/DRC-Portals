import React from "react"
import { Box, Paper, Grid, Typography } from "@mui/material"

export default function ListingPageLayout(props: React.PropsWithChildren<{
  count?: number,
  filters?: React.ReactNode,
  footer?: React.ReactNode,
}>) {
  return (
    <Grid container justifyContent={"center"} className="mt-4" spacing={2}>
      <Grid item xs={12} sm={3}>
        {
          props.filters && 
            <Paper elevation={0} sx={{minHeight: 400, background: "linear-gradient(180deg, #DBE0ED 0%, #FFFFFF 100%)", padding: "12px 24px"}}>
              <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
                <Typography variant="h5">Results found</Typography>
                <Typography variant="h5">{(props.count ?? 0).toLocaleString()}</Typography>
              </div>
              <div><Typography variant="subtitle1">Filter</Typography></div>
              <div className="text-cyan-700 text-lg">
                {props.filters}
              </div>
            </Paper>
        }
      </Grid>
      <Grid item xs={12} sm={9}>
        {props.children}
      </Grid>
      <Grid item xs={12}>
        {props.footer}
      </Grid>
    </Grid>
  )
}
