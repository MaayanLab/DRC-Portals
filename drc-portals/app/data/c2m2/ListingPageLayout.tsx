import React from "react"
import { Paper, Grid, Typography } from "@mui/material"
import DownloadButton from "./DownloadButton";
import { get_partial_list_string } from "@/app/data/c2m2/utils"


export default function ListingPageLayout(props: React.PropsWithChildren<{
  count?: number,
  all_count?: number,
  all_count_limit?: number,
  searchText?: string,
  filters?: React.ReactNode,
  footer?: React.ReactNode,
  data?: { [key: string]: string | bigint | number; }[],
  downloadFileName?: string;
}>) {
  const partial_list_string = get_partial_list_string(props.all_count ?? 0, props.count ?? 0, props.all_count_limit ?? 0);
  return (
    <Grid container justifyContent={"center"} sx={{ paddingTop: 5, paddingBottom: 5 }} spacing={2}>
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12} sm={props.filters ? 9 : 12}>
          {props.children}
          <Grid item xs={12}>
            {/*<DownloadButton data={props.data} filename={props.downloadFileName}/>*/}
          </Grid>
        </Grid>

        {props.filters &&
          <Grid item xs={12} sm={3}>
            <Paper sx={{ background: "linear-gradient(180deg, #EDF0F8 0%, transparent 100%)", height: '100%', padding: "12px 24px" }} elevation={0}>
              <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
                <Typography variant="h5">Results found: </Typography>
                {/*<Typography variant="h5">{(props.all_count ?? 0).toLocaleString()} {props.all_count > props.all_count_limit ? `(${(props.count ?? 0).toLocaleString()} listed)` : ''} </Typography>*/}
                <Typography variant="h5">&ge; {`${partial_list_string}`} </Typography>
              </div>
              <div><Typography variant="subtitle1">Filter</Typography></div>
              <div className="flex flex-col text-cyan-700 text-lg">
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
