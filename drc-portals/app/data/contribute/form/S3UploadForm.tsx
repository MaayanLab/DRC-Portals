'use client'

import React, { FormEvent } from 'react'
// import JSZip from 'jszip'
// import { z } from 'zod'
import {upload} from './UploadFunc'
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FileDrop } from './FileDrop'
import ThemedBox from './ThemedBox';
import ThemedStack from './ThemedStack';
import { Link } from '@mui/material';
import Status from './Status';
import DCCSelect from './DCCSelect';
import { $Enums } from '@prisma/client';

type S3UploadStatus = {
  success?: boolean,
  loading?: boolean,
  error?: any,
}
const S3UploadStatusContext = React.createContext({} as S3UploadStatus)


/**
 * Any child of <S3UploadForm> can access this hook to
 *  see the status of the upload.
 */
export function useS3UploadStatus() {
  return React.useContext(S3UploadStatusContext)
}

// export function S3UploadForm({ children }: React.PropsWithChildren<{}>) {
  export function S3UploadForm( user : {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    dcc: string | null
    role: $Enums.Role;
}
) {

  const [status, setStatus] = React.useState<S3UploadStatus>({})
  const [uploadedfiles, setUploadedfiles] = React.useState<FileList | []>([]);

 
  return (
    <form onSubmit={(evt) => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
       for (var i = 0, l = uploadedfiles.length; i < l; i++) {
        formData.append('files[]', uploadedfiles[i])
       }
      setStatus(() => ({ loading: true }))      
      // if (type(uploadedfiles) === 'Array') throw new Error('no file uploaded')
      upload(formData)
        .then(() => {setStatus(() => ({ success: true }))})
        .catch(error => {console.log({error}); setStatus(() => ({ error }))})
    }}>
      <S3UploadStatusContext.Provider value={status}>
        {/* {children} */}
        <Container className="mt-10">
        <Typography variant="h3" className='text-center p-5'>Data and Metadata Upload Form</Typography>
        <Grid container spacing={4} className='p-5' justifyContent="center">
          <ThemedBox>
            <TextField
              label="Uploader Name"
              name='name'
              disabled
              defaultValue={user.name}
              inputProps={{style: {fontSize: 16}}} // font size of input text
              InputLabelProps={{style: {fontSize: 16}}} // font size of input label
            />
          </ThemedBox>
          <ThemedBox>
            <TextField
              label="Email"
              name='email'
              disabled
              defaultValue={user.email}
              inputProps={{style: {fontSize: 16}}}
              InputLabelProps={{style: {fontSize: 16}}}
            />
          </ThemedBox>
          <ThemedBox>
            <DCCSelect dccOptions={user.dcc ? user.dcc : ''} />
          </ThemedBox>
        </Grid>

        <Typography  variant="subtitle1" className='text-center p-5'>Please upload a zipped file containing your data/metdata files and a manifest.json file detailing files information. See {' '}
        <Link href='/example_manifest.json' color="secondary" download>manifest.json template</Link>
        </Typography>
        <ThemedStack>
          <FileDrop name="currentData" setUploadedFiles={setUploadedfiles}/>
        </ThemedStack>
        <Status />
        <ThemedBox style={{ display: 'flex', justifyContent: 'center' }} className='p-5'>
          <FormControl>
            <Button variant="contained" color="tertiary" style={{ minWidth: '200px', maxHeight: '100px' }} type="submit" sx={{ marginTop: 2, marginBottom: 10 }}>
              Submit Form
            </Button>
          </FormControl>
        </ThemedBox>
      </Container>
      </S3UploadStatusContext.Provider>
    </form>
  )
}




