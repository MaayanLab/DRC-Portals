import React, { ReactNode } from "react"
import { Grid, Stack, Typography } from "@mui/material"
import Link from "next/link"
import Image from "next/image"

export default function LandingPageLayout(props: React.PropsWithChildren<{
  label: React.ReactNode,
  description: React.ReactNode,
  metadata?: ({label: React.ReactNode, value: ReactNode} | null)[],
  icon?: { src: string, href: string, alt: string },
}>) {
  return (
    <Grid container sx={{paddingTop: 5, paddingBottom: 5}} gap={4}>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" >
          <Stack>
            <Typography variant="h1" color="secondary">{props.label}</Typography>
            {props.metadata?.map((item, i) => item && item.value ? <Typography key={i} variant="body2">{item.label}: {item.value}</Typography> : null)}
            {props.description ? <Typography variant="body2">Description: {props.description}</Typography> : null}
          </Stack>
          {props.icon ? 
            <div className="flex-grow-0 self-center justify-self-center">
              <Link href={props.icon.href}>
                <Image src={props.icon.src} alt={props.icon.alt} width={240} height={240} />
              </Link>
            </div>
            : null}
        </Stack>
      </Grid>
      {props.children}
    </Grid>
  )
}
