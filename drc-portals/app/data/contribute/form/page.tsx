import React from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FileDrop } from './FileDrop'
import ThemedBox from './ThemedBox';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ThemedStack from './ThemedStack';
import { S3UploadForm } from './S3UploadForm';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Link } from '@mui/material';
import Status from './Status';
import DCCSelect from './DCCSelect';

export default async function UploadForm() {
  const session = await getServerSession(authOptions)
  if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })
  if (user === null ) return redirect("/auth/signin?callbackUrl=/data/contribute/form")

  if (!(user.role === 'UPLOADER' || user.role === 'DRC_APPROVER')) {return <p>Access Denied</p>}
  if (!user.dcc) return redirect("/data/contribute/account")


  return (
    <S3UploadForm>
      <Container className="mt-10">
        <Typography variant="h3" className='text-center p-5'>Data and Metadata Upload Form</Typography>
        <Grid container spacing={4} className='p-5' justifyContent="center">
          <ThemedBox>
            <TextField
              label="Uploader Name"
              name='name'
              disabled
              defaultValue={user.name}
            />
          </ThemedBox>
          <ThemedBox>
            <TextField
              label="Email"
              name='email'
              disabled
              defaultValue={user.email}
            />
          </ThemedBox>
          <ThemedBox>
            <DCCSelect dccOptions={user.dcc} />
          </ThemedBox>
        </Grid>

        <Typography className='text-center p-5'>Please upload a zipped file containing your data/metdata files and a manifest.json file detailing files information. See {' '}
        <Link href='/example_manifest.json' download>manifest.json template</Link>
        </Typography>
        <ThemedStack>
          <FileDrop name="file" />
        </ThemedStack>
        <Status />
        <ThemedBox style={{ display: 'flex', justifyContent: 'center' }} className='p-5'>
          <FormControl>
            <Button variant="contained" color="secondary" style={{ minWidth: '200px', maxHeight: '100px' }} type="submit" sx={{ marginTop: 2, marginBottom: 10 }}>
              Submit Form
            </Button>
          </FormControl>
        </ThemedBox>
      </Container>
    </S3UploadForm>
  );
}
