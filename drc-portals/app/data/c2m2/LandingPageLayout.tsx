import React, { ReactNode } from "react";
import { Grid, Stack, Typography, Card, CardContent, CardHeader } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import {
  Description as DescriptionIcon,
  Link as LinkIcon,
  Coronavirus as CoronavirusIcon,
  Inventory as InventoryIcon,
  Note as NoteIcon,
  Biotech as BiotechIcon,
  FolderSpecial as FolderSpecialIcon,
  Groups3 as Groups3Icon

} from '@mui/icons-material'; // Import necessary icons

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
      <Grid container spacing={2}>

        <Grid item xs={12}>
          {/* Project Metadata Card */}
          <Card sx={{ p: 2, my: 2 }}>
            <CardHeader title={
              <Typography variant="h3" gutterBottom>
                <LinkIcon style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                <span style={{ fontWeight: 'bold' }}>Project ID:</span> {props.metadata.find(item => item.label === 'Project ID')?.value}
              </Typography>
            } />
            <CardContent>
              {props.metadata ? (
                <>
                  <Typography variant="body1">{props.metadata.find(item => item.label === 'Project URL')?.value}
                  </Typography>

                </>
              ) : (
                <Typography variant="body2">
                  Not available
                </Typography>
              )
              }
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {/* Project Description Card */}
          <Card sx={{ p: 2, my: 2 }}>
            <CardHeader title={
              <Typography variant="h3" gutterBottom>
                <DescriptionIcon style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Project Description
              </Typography>
            } />
            <CardContent>
              {props.description ? (
                <>
                  <Typography variant="body1">{props.description}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2">
                  No description found
                </Typography>
              )
              }
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          {/* Anatomy Card */}
          <Card sx={{ p: 2, my: 2 }}>
            <CardHeader title={
              <Typography variant="h3" gutterBottom>
                <NoteIcon style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                <span style={{ fontWeight: 'bold' }}>Anatomy:</span> {props.metadata.find(item => item.label === 'Anatomy')?.value}
              </Typography>
            } />
            <CardContent>
              {props.metadata ? (
                <>
                  <Typography variant="body1">{props.metadata.find(item => item.label === 'Anatomy Description')?.value}
                  </Typography>

                </>
              ) : (
                <Typography variant="body2">
                  Not available
                </Typography>
              )
              }
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          {/* Disease Card */}
          <Card sx={{ p: 2, my: 2 }}>
            <CardHeader title={
              <Typography variant="h3" gutterBottom>
                <CoronavirusIcon style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                <span style={{ fontWeight: 'bold' }}>Disease:</span> {props.metadata.find(item => item.label === 'Disease')?.value}
              </Typography>
            } />
            <CardContent>
              {props.metadata ? (
                <>
                  <Typography variant="body1">{props.metadata.find(item => item.label === 'Disease Description')?.value}
                  </Typography>

                </>
              ) : (
                <Typography variant="body2">
                  Not available
                </Typography>
              )
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Biosamples, Subjects and Collections */}
        <Grid item xs={4}>
          <Card sx={{ p: 2, my: 2 }}>
            <CardHeader title={
              props.metadata ? (
                <Typography variant='h1' align='center' gutterBottom>
                  {props.metadata.find(item => item.label === 'Biosamples')?.value}
                </Typography>
              ) :
                <Typography variant='h1' align='center' gutterBottom>
                  0
                </Typography>
            } />
            <CardContent>
              <Typography align='center' variant='h3'>
                <BiotechIcon style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Biosamples
              </Typography>
            </CardContent>
          </Card>

        </Grid>

        <Grid item xs={4}>
          <Card sx={{ p: 2, my: 2 }}>
            <CardHeader title={
              props.metadata ? (
                <Typography variant='h1' align='center' gutterBottom>
                  {props.metadata.find(item => item.label === 'Subjects')?.value}
                </Typography>
              ) :
                <Typography variant='h1' align='center' gutterBottom>
                  0
                </Typography>
            } />
            <CardContent>
              <Typography align='center' variant='h3'>
                <Groups3Icon style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Subjects
              </Typography>
            </CardContent>
          </Card>

        </Grid>

        <Grid item xs={4}>
          <Card sx={{ p: 2, my: 2 }}>
            <CardHeader title={
              props.metadata ? (
                <Typography variant='h1' align='center' gutterBottom>
                  {props.metadata.find(item => item.label === 'Collections')?.value}
                </Typography>
              ) :
                <Typography variant='h1' align='center' gutterBottom>
                  0
                </Typography>
            } />
            <CardContent>
              <Typography align='center' variant='h3'>
                <FolderSpecialIcon style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Collections
              </Typography>
            </CardContent>
          </Card>

        </Grid>

      </Grid>

      {/* Grid container for cards */}
      <Grid container spacing={2}>
        {props.categories?.map((category, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined" sx={{ height: "100%" }}>
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
      </Grid>
      {props.children}
    </Grid >
  );
}
