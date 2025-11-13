import React, { ReactNode } from "react"
import { Grid, Stack, Typography } from "@mui/material"
import Link from "@/utils/link"
import Image from "@/utils/image"

export default function LandingPageLayout(props: React.PropsWithChildren<{
  title: React.ReactNode,
  subtitle: React.ReactNode,
  description?: React.ReactNode,
  metadata?: ({label: React.ReactNode, value: ReactNode} | null)[],
  icon?: { src: string, href: string, alt: string },
}>) {
  return (
    <Grid container rowGap={2}>
      <Grid item xs={8}>
        <Typography variant="h1" color="secondary" sx={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
          {props.title}
          {props.subtitle ? <>&nbsp;<span className="whitespace-nowrap">({props.subtitle})</span></> : null}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        {props.icon ? 
          <Link href={props.icon.href}>
            <Image src={props.icon.src} alt={props.icon.alt} width={240} height={240} />
          </Link>
          : null}
      </Grid>
      <Grid item xs={12}>
        <Stack>
          {props.metadata?.map((item, i) => item && item.value ? <div key={i} className="prose max-w-none flex flex-row gap-1 place-items-start"><span className="text-nowrap"><strong>{item.label}</strong>:</span>{item.value}</div> : null)}
          {props.description ? <div className="prose max-w-none"><strong>Description</strong>: {props.description}</div> : null}
        </Stack>
      </Grid>
      <Grid item container xs={12}>
        {props.children}
      </Grid>
    </Grid>
  )
}
