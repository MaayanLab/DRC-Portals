import React, { ReactNode } from "react";
import { Grid, Stack, Typography, Card, CardContent } from "@mui/material";
import Link from "next/link";
import Image from "next/image";

export default function LandingPageLayout(props: React.PropsWithChildren<{
  title: React.ReactNode,
  subtitle: React.ReactNode,
  description: React.ReactNode,
  metadata?: ({ label: React.ReactNode, value: ReactNode } | null)[],
  icon?: { src: string, href: string, alt: string },
  categories?: {
    title: ReactNode,
    metadata: ({ label: React.ReactNode, value: ReactNode } | null)[],
  }[],
}>) {
  return (
    <Grid container sx={{ paddingTop: 5, paddingBottom: 5 }} rowGap={2}>
      <Grid item xs={8}>
        <Typography variant="h1" color="secondary" sx={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
          {props.title}
          {props.subtitle ? <>&nbsp;<span className="whitespace-nowrap">({props.subtitle})</span></> : null}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        {props.icon ?
          <Link href={props.icon.href} passHref>
              <Image src={props.icon.src} alt={props.icon.alt} width={120} height={120} />
          </Link>
          : null}
      </Grid>
      <Grid item xs={12}>
        <Stack>
          {props.description ? <Typography variant="body2"><strong>Project Description</strong>: {props.description}</Typography> : null}
          {props.metadata?.map((item, i) => item && item.value ? <Typography key={i} variant="h6"><strong>{item.label}</strong>: {item.value}</Typography> : null)}
        </Stack>
      </Grid>
      {props.categories?.map((category, index) => (
        <Grid item xs={12} key={index}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {category.title}
              </Typography>
              {category.metadata.map((item, i) => (
                item && item.value ? <Typography key={i} variant="body2">
                  <strong>{item.label}</strong>: {item.value}
                </Typography> : null
              ))}
            </CardContent>
          </Card>
        </Grid>
      ))}
      {props.children}
    </Grid>
  );
}
