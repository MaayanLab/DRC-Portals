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
import { Box } from '@mui/material';
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

  // React.useEffect(() => {
  //   console.log(progress)
  //   if (progress >= 100) {
  //     setStatus(() => ({ success: true }))
  //     setProgress(0)
  //   }
  // }, [progress])

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
                inputProps={{ style: { fontSize: 16 } }} // font size of input text
                InputLabelProps={{ style: { fontSize: 16 } }} // font size of input label
              />
            </ThemedBox>
            <ThemedBox>
              <TextField
                label="Email"
                name='email'
                disabled
                defaultValue={user.email}
                inputProps={{ style: { fontSize: 16 } }}
                InputLabelProps={{ style: { fontSize: 16 } }}
              />
            </ThemedBox>
            <ThemedBox>
              <DCCSelect dccOptions={user.dcc ? user.dcc : ''} />
            </ThemedBox>
          </Grid>
          <Typography variant="subtitle1" className='text-center p-5'>Please upload your data/metdata files here.
          </Typography>
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




