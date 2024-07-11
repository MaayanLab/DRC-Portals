import React, { ReactNode } from "react"
import { Grid, Stack, Typography } from "@mui/material"
import Link from "next/link"
import Image from "next/image"

export default function LandingPageLayout(props: React.PropsWithChildren<{
  title: React.ReactNode,
  subtitle: React.ReactNode,
  description: React.ReactNode,
  metadata?: ({label: React.ReactNode, value: ReactNode} | null)[],
  icon?: { src: string, href: string, alt: string },
}>) {
  return (
    <Grid container sx={{paddingTop: 5, paddingBottom: 5}} rowGap={2}>
      <Grid item xs={8}>
        <Typography variant="h1" color="secondary" sx={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
          {props.title}
          {props.subtitle ? <>&nbsp;<span className="whitespace-nowrap">({props.subtitle})</span></> : null}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        {props.icon ? 
          <Link prefetch={false} href={props.icon.href}>
            <Image src={props.icon.src} alt={props.icon.alt} width={240} height={240} />
          </Link>
          : null}
      </Grid>
      <Grid item xs={12}>
        <Stack>
          {props.metadata?.map((item, i) => item && item.value ? <Typography key={i} variant="body2">{item.label}: {item.value}</Typography> : null)}
          {props.description ? <Typography variant="body2">Description: {props.description}</Typography> : null}
        </Stack>
      </Grid>
      {props.children}
    </Grid>
  )
}
