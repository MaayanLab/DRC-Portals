'use client'
import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { Grid, Stack, Typography, Card, CardContent } from "@mui/material";
import Link from "@/utils/link";
import Image from "@/utils/image";
import { isURL, MetadataItem, Category } from './utils';
import DownloadButton from './DownloadButton';





interface Icon {
  src: string;
  href: string;
  alt: string;
}

interface LandingPageLayoutProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  description: React.ReactNode;
  categories?: Category[];
  metadata?: (MetadataItem | null)[];
  icon?: Icon;
  children?: React.ReactNode;
}

export default function LandingPageLayout(props: LandingPageLayoutProps) {
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    let maxHeightValue = 0;
    if (Array.isArray(props.categories)) {
      props.categories.forEach((category) => {
        const contentHeight = document.getElementById(`card-content-${category.title}`)?.clientHeight;
        if (contentHeight && contentHeight > maxHeightValue) {
          maxHeightValue = contentHeight;
        }
      });
      setMaxHeight(maxHeightValue);
    }
  }, [props.categories]);

  const renderMetadataValue = (item: MetadataItem) => {
    if (typeof item.value === 'string' && item.label === 'Persistent ID' && isURL(item.value)) {
      return (
        <Link href={item.value} className="underline cursor-pointer text-blue-600" target="_blank" rel="noopener noreferrer" key={item.value}>
          {item.value}
        </Link>
      );
    }
    return item.value;
  };

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
          {props.description ? <Typography variant="body1"><strong>Project Description</strong>: {props.description}</Typography> : null}
          {props.metadata?.map((item, i) => item && item.value ? <Typography key={i} variant="body1"><strong>{item.label}</strong>: {item.value}</Typography> : null)}
        </Stack>
      </Grid>
      <Grid container spacing={2}>
        {props.categories && props.categories.length > 0 && (
          <Grid container spacing={2}>
            {props.categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined" sx={{ mb: 2, height: maxHeight }}>
                  <CardContent id={`card-content-${category.title}`}>
                    <Typography variant="h5" component="div">
                      {category.title}
                    </Typography>
                    {category.metadata.map((item, i) => (
                      item && item.value ? (
                        <Typography key={i} variant="body2">
                          <strong>{item.label}: </strong>
                          {renderMetadataValue(item)}
                        </Typography>
                      ) : null
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

      </Grid>


      {props.children && (
        <Grid container spacing={2}>
          {React.Children.map(props.children, child => (
            <Grid item xs={12}>
              {child}
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  );
}
