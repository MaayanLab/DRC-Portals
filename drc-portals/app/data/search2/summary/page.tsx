import React from 'react'
import SummaryComponent from './SummaryComponent'
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import Link from '@/utils/link';
import { Button, Grid, Typography } from '@mui/material';
import Icon from "@mdi/react";
import { mdiArrowLeft } from '@mdi/js';

export default async function Page() {
  return <ListingPageLayout
    footer={
      <Link href="/data">
        <Button
          sx={{textTransform: "uppercase"}}
          color="primary"
          variant="contained"
          startIcon={<Icon path={mdiArrowLeft} size={1} />}>
            BACK TO SEARCH
        </Button>
      </Link>
    }
  >
    <Grid container rowGap={2}>
      <Grid item xs={8}>
        <Typography variant="h1" color="secondary" sx={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
          Summary
        </Typography>
        <br />
      </Grid>
      <Grid item xs={12}>
        <SummaryComponent />
      </Grid>
    </Grid>
  </ListingPageLayout>
}
