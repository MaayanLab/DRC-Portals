import React from "react"
import { Box, Container, Typography } from "@mui/material"

export default function ListingPageLayout(props: React.PropsWithChildren<{
  count?: number,
  filters?: React.ReactNode,
  footer?: React.ReactNode,
}>) {
  return (
    <Container className="justify-content-center">
      <div className="flex flex-row gap-4 mt-4">
        {props.filters ? (
          <Box className="w-56 flex-shrink-0 flex flex-col p-5 bg-slate-100 rounded-lg">
            <div className="flex flex-row align-middle justify-between border-b border-b-slate-400 mb-4">
              <Typography variant="subtitle1">Results found</Typography>
              {(props.count ?? 0).toLocaleString()}
            </div>
            <div className="text-sm">Filter</div>
            <div className="text-cyan-700 text-lg">
              {props.filters}
            </div>
          </Box>
        ) : null}
        <Box className="flex-grow flex-col flex justify-stretch">
          {props.children}
        </Box>
      </div>
      {props.footer}
    </Container>
  )
}
