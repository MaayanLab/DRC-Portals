import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Alert, Grid } from '@mui/material';
import { CodeForm } from './CodeForm';
import Nav from '../Nav';


export default async function UploadForm() {
  const session = await getServerSession(authOptions)
  if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/urlform")
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    include: {
      dccs: true
    }
  })
  if (user === null) return redirect("/auth/signin?callbackUrl=/data/contribute/urlform")

  if (!(user.role === 'UPLOADER' || user.role === 'DRC_APPROVER' || user.role === 'ADMIN' || user.role === 'DCC_APPROVER')) {
    return (
      <>
        <Nav />
        <p>Access Denied. This page is only accessible to DCC Uploaders and DCC & DRC Approvers</p>
      </>
    )
  }

  if (!user.email) return (
    <>
      <Nav />
      <Alert severity="warning"> Email not updated on user account. Please enter email on the My Account Page</Alert>
    </>
  );

  if (!user.dcc) return (
    <>
      <Nav />
      <Alert severity="warning"> User has no affiliated DCCs. Please contact the DRC to update your information</Alert>
    </>
  );


  return (
    <>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid md={2} xs={12}>
          <Nav />
        </Grid>
        <Grid md={10} xs={12}>
          <CodeForm {...user}>
          </CodeForm>
        </Grid>
      </Grid>
    </>

  );
}