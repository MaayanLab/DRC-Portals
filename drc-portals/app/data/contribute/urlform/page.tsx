import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Alert } from '@mui/material';
import { CodeForm } from './CodeForm';
import Nav from '../Nav';


export default async function UploadForm() {
  const session = await getServerSession(authOptions)
  if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })
  if (user === null) return redirect("/auth/signin?callbackUrl=/data/contribute/form")

  if (!(user.role === 'UPLOADER' || user.role === 'DRC_APPROVER' || user.role === 'ADMIN')) { return <p>Access Denied. This page is only accessible to DCC Uploaders and DRC Approvers</p> }
  if (!user.email) return (
    <Alert severity="warning"> Email not updated on user account. Please enter email on the My Account Page</Alert>
  );

  if (!user.dcc) return (
    <Alert severity="warning"> User has no affiliated DCCs. Please contact the DRC to update your information</Alert>
  );


  return (
    <>
     <Nav />
     <CodeForm {...user}>
    </CodeForm>
    </>

  );
}