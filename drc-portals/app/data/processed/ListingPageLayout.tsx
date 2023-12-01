import React from "react"
import { Box, Container, Typography } from "@mui/material"

export default function ListingPageLayout(props: React.PropsWithChildren<{
  count?: number,
  filters?: React.ReactNode,
}>) {
  return (
    <Container className="mt-10 justify-content-center">
      <Box className="p-5 text-center">
        <Typography variant="h3">Results</Typography>
        <Typography variant="subtitle1">(found {(props.count ?? 0).toLocaleString()} matches)</Typography>
      </Box>
      <Box className="flex flex-row">
        {props.filters ? (
          <Box className="w-48">
            {props.filters}
          </Box>
        ) : null}
        <Box className="flex-grow flex-col flex justify-stretch">
          {props.children}
        </Box>
      </Box>
    </Container>
  )
}
