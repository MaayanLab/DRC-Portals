'use client'

import React from 'react'
import { saveChecksumDb } from './UploadFunc'
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FileDrop } from './FileDrop'
import ThemedBox from './ThemedBox';
import ThemedStack from './ThemedStack';
import Status from './Status';
import DCCSelect from './DCCSelect';
import { $Enums } from '@prisma/client';
import { Box, Link } from '@mui/material';
import { ProgressBar } from './ProgressBar';
import jsSHA256 from 'jssha/sha256'
import { createPresignedUrl } from './UploadFunc'


export type S3UploadStatus = {
  success?: boolean,
  loading?: boolean,
  error?: {
    selected: boolean;
    message: string
  },
}


const S3UploadStatusContext = React.createContext({} as S3UploadStatus)

function parseFileTypeClient(filename: string, filetype: string) {
  let parsedFileType = ''
  if (filename.includes('.gmt') || filename.includes('.dmt')) {
    parsedFileType = 'XMT'
  } else if (filetype === 'text/csv') {
    parsedFileType = 'KG Assertions'
  } else if (filetype === 'text/plain') {
    parsedFileType = 'Attribute Table'
  } else if ((filetype === 'zip') || (filetype === 'application/zip') || (filetype === 'application/x-zip') || (filetype === "application/x-zip-compressed")) {
    parsedFileType = 'C2M2'
  }
  return parsedFileType
}

async function alternativeHash(file: File) {
  const hash = new jsSHA256("SHA-256", "UINT8ARRAY")
  const computeHash = file.stream()
    .pipeTo(new WritableStream({
      write(chunk) {
        const cycles = chunk.length
        hash.update(chunk)
      },
    },
    ))
  await computeHash
  const checksumHash = hash.getHash('B64')
  return checksumHash
}

/**
 * Any child of <S3UploadForm> can access this hook to
 *  see the status of the upload.
 */
export function useS3UploadStatus() {
  return React.useContext(S3UploadStatusContext)
}

export function S3UploadForm(user: {
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
  const [progress, setProgress] = React.useState(0);


  const uploadAndComputeSha256 = React.useCallback(async (file: File, filetype: string, dcc: string, setProgress: React.Dispatch<React.SetStateAction<number>>, progressAlloc: number) => {
    const hash = new jsSHA256("SHA-256", "UINT8ARRAY")
    const chunkSize = 64 * 1024 * 1024; // 64 MB chunks
    for (let start = 0; start < file.size; start += chunkSize) {
      const end = Math.min(start + chunkSize, file.size)
      await new Promise<void>((resolve, reject) => {
        const fr = new FileReader()
        fr.onload = () => {
          hash.update(new Uint8Array(fr.result as ArrayBuffer));
          resolve();
        }
        fr.readAsArrayBuffer(file.slice(start, end))
      })
    }
    const checksumHash = hash.getHash('B64')
    console.log(checksumHash)
    let date = new Date().toJSON().slice(0, 10)
    let filepath = dcc + '/' + filetype + '/' + date + '/' + file.name
    setProgress(oldProgress => oldProgress + progressAlloc / 3)
    const presignedurl = await createPresignedUrl(filepath, checksumHash)
    setProgress(oldProgress => oldProgress + progressAlloc / 3)
    const awsPost = await fetch(presignedurl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-amz-checksum-sha256': checksumHash
      },
      body: file,
    })
    setProgress(oldProgress => oldProgress + progressAlloc / 3)
    if (!awsPost.ok) throw new Error(await awsPost.text())
    return checksumHash
  }, [])


  return (
    <form onSubmit={async (evt) => {
      evt.preventDefault()
      setStatus(() => ({ loading: true }))
      const formData = new FormData(evt.currentTarget)
      let dcc = formData.get('dcc')?.toString()
      if (uploadedfiles.length === 0) return setStatus(({ error: { selected: true, message: 'No files uploaded' } }))
      for (var i = 0, l = uploadedfiles.length; i < l; i++) {
        if (parseFileTypeClient(uploadedfiles[i].name, uploadedfiles[i].type) === '') {
          setStatus(({ error: { selected: true, message: 'Error! Please make sure files are either .csv, .txt, .zip or .dmt or .gmt' } }))
          return
        }
      }

      for (var i = 0, l = uploadedfiles.length; i < l; i++) {
        try {
          let filetype = parseFileTypeClient(uploadedfiles[i].name, uploadedfiles[i].type)
          if (!dcc) throw new Error('no dcc entered')
          let digest = await uploadAndComputeSha256(uploadedfiles[i], filetype, dcc, setProgress, 100 / (uploadedfiles.length))
          await saveChecksumDb(digest, uploadedfiles[i].name, uploadedfiles[i].size, filetype, dcc)
        }
        catch (error) {
          console.log({ error }); setStatus(({ error: { selected: true, message: 'Error Uploading File!' } }));
          return
        }
      }
      setStatus(() => ({ success: true }))
      setProgress(0)
    }}>
      <S3UploadStatusContext.Provider value={status}>
        <Container>
          <Typography variant="h3" color="secondary.dark" className='p-5'>DATA AND METADATA UPLOAD FORM</Typography>
          <Typography variant="subtitle1" color="#666666" className='' sx={{ mb: 3, ml: 2 }}>
            This is the form to upload the data/metadata files for your DCC. Select the DCC for which the files belong and
            drop your files in the upload box or click on the 'Choose Files' to select files for upload. Please do not leave 
            the page until all files have been successfully uploaded.
            <br></br>
            All uploaded files with .csv extensions are tagged as KG Assertion files. All uploaded files with .txt
            extensions are tagged as Attribute Table files. All uploaded zipped files are tagged as C2M2 files.
            All uploaded files with a .gmt or .dmt extension are tagged as XMT files. All uploaded files with .txt
            extensions are tagged as Attribute Table files.
            <br></br>
            See the {' '}
            <Link color="secondary" href="/data/contribute/documentation"> Documentation page</Link> for more information the steps to upload files.
          </Typography>
          <Grid container spacing={4} justifyContent="center" sx={{ p: 5 }}>
            <TextField
              label="Uploader Name"
              name='name'
              disabled
              defaultValue={user.name}
              inputProps={{ style: { fontSize: 16 } }} // font size of input text
              InputLabelProps={{ style: { fontSize: 16 } }} // font size of input label
            />
            <TextField
              label="Email"
              name='email'
              disabled
              defaultValue={user.email}
              inputProps={{ style: { fontSize: 16 } }}
              InputLabelProps={{ style: { fontSize: 16 } }}
              sx={{ mx: 3 }}
            />
            <DCCSelect dccOptions={user.dcc ? user.dcc : ''} />
          </Grid>
          <ThemedStack>
            <FileDrop name="currentData" setUploadedFiles={setUploadedfiles} />
          </ThemedStack>
          <Status />
          <div className='flex justify-center'>
            <Box sx={{ width: '50%' }}>
              {status.loading && <ProgressBar value={progress} />}
            </Box>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }} className='p-5'>
            <FormControl>
              <Button variant="contained" color="tertiary" style={{ minWidth: '200px', maxHeight: '100px' }} type="submit" sx={{ marginTop: 2, marginBottom: 10 }}>
                Submit Form
              </Button>
            </FormControl>
          </div>
        </Container>
      </S3UploadStatusContext.Provider>
    </form>
  )
}




