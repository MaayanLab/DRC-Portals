import React from "react"
import { Grid } from "@mui/material"

export default function ListingPageLayout(props: React.PropsWithChildren<{
  filters?: React.ReactNode,
  footer?: React.ReactNode,
}>) {
  return (
    <Grid container justifyContent={"center"} spacing={2}>
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12} sm={props.filters ? 9 : 12}>
          {props.children}
        </Grid>
        {props.filters}
      </Grid>
      {props.footer && <Grid item xs={12}>
        {props.footer}
      </Grid>}
    </Grid>
  )
}
