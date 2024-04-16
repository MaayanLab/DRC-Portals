import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { S3UploadForm } from './S3UploadForm';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Alert, Button, Grid } from '@mui/material';
import Nav from '../Nav';
import Link from 'next/link';

export default async function UploadForm() {
  const session = await getServerSession(authOptions)
  if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    include: {
      dccs: true
    }
  })
  if (user === null) return redirect("/auth/signin?callbackUrl=/data/contribute/form")

  if (!(user.role === 'UPLOADER' || user.role === 'DRC_APPROVER' || user.role === 'ADMIN' || user.role === 'DCC_APPROVER')) {
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
  if (!user.email) return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid md={2} xs={12}>
        <Nav />
      </Grid>
      <Grid md={10} xs={12}>
        <Alert severity="warning" action={
          <Button color="inherit" size="small" href='/data/contribute/account'>
            GO TO MY ACCOUNT
          </Button>
        }> Email not updated on user account. Please enter email on the My Account Page</Alert>
      </Grid>
    </Grid>
  );

  if (user.dccs.length === 0) return (
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
          <S3UploadForm {...user}>
          </S3UploadForm>
        </Grid>
      </Grid>
    </>

  );
}
