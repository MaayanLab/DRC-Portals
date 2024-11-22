import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { S3UploadForm } from './S3UploadForm';
import { redirect } from 'next/navigation';
import { Alert, Button, Grid } from '@mui/material';
import Nav from '../Nav';
import prisma from '@/lib/prisma';

export default async function UploadForm() {
  const session = await getServerSession(authOptions)
  if (!session) return redirect("/auth/signin?callbackUrl=/data/submit/form")

  if (session.user.role === 'USER') {
    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid md={2} xs={12}>
          <Nav />
        </Grid>
        <Grid md={10} xs={12}>
          <Alert severity="warning">Access Denied. This page is only accessible to DCC Uploaders and DCC & DRC Approvers</Alert>
        </Grid>
      </Grid>
    )
  }
  if (!session.user.email) return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid md={2} xs={12}>
        <Nav />
      </Grid>
      <Grid md={10} xs={12}>
        <Alert severity="warning" action={
          <Button color="inherit" size="small" href='/data/submit/account'>
            GO TO MY ACCOUNT
          </Button>
        }> Email not updated on user account. Please enter email on the My Account Page</Alert>
      </Grid>
    </Grid>
  );

  const file_assets = await prisma.dccAsset.findMany({
    where: {
      dcc: {
        short_label: {in: session.user.dccs}
      }
    },
    include: {
      fileAsset: true,
      dcc:true
    }
  })

  // const code_assets = await prisma.dccAsset.findMany({
  //   where: {
  //     dcc: {
  //       short_label: {in: session.user.dccs}
  //     }
  //   },
  //   include: {
  //     codeAsset: true,
  //   }
  // })

  if (session.user.dccs.length === 0) return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid md={2} xs={12}>
        <Nav />
      </Grid>
      <Grid md={10} xs={12}>
        <Alert severity="warning"> User has no affiliated DCCs. Please contact the DRC to update your information</Alert>    </Grid>
    </Grid>
  );

  return (
    <>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid md={2} xs={12}>
          <Nav />
        </Grid>
        <Grid md={10} xs={12}>
          <S3UploadForm file_assets={file_assets} {...session.user}/>
        </Grid>
      </Grid>
    </>

  );
}
