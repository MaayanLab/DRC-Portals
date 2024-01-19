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
import ThemedStack from './ThemedStack';
import Status from './Status';
import DCCSelect from './DCCSelect';
import { $Enums } from '@prisma/client';
import { Box, Link, Stack } from '@mui/material';
import { ProgressBar } from './ProgressBar';
import jsSHA256 from 'jssha/sha256'
import { createPresignedUrl } from './UploadFunc'
import AssetInfoDrawer from '../AssetInfo';
import HelpIcon from '@mui/icons-material/Help';
import axios from "axios";

export const metaDataAssetOptions = [
  {
    asset: 'XMT',
    description: <Typography fontSize={12}> XMT files are text files that contain a collection of sets of a given entity type, for example, a library of gene sets. The 'X' in XMT stands for any entity type. It is an extension to GMT which stands for <Link color="secondary" href="https://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#GMT:_Gene_Matrix_Transposed_file_format_.28.2A.gmt.29" target="_blank">Gene Matrix Transpose</Link> that is used to store gene sets. Besides .gmt files, XMT files can be .dmt files which are XMT files that contain a collection of drug sets, or .mmt files which contain metabolite sets. Other sets for other entities are also valid. On each row of an XMT file, the first column contains the term associated with the set, while all other columns contain the set entities. The field separator between columns should be a {`<tab>`} character. All uploaded files with an extension that ends with the letters “mt” are considered as XMT files by the ingestion system.
    </Typography>,
    example: <Link href="https://cfde-drc.s3.amazonaws.com/GTEx/XMT/2023-03-10/GTEx_XMT_2023-03-10_GTEx_Tissues_V8_2023.gmt" color="secondary" target="_blank">GTEx_Tissues_V8_2023.gmt</Link>
  },
  {
    asset: 'C2M2',
    description:
      <Typography fontSize={12}> The Crosscut Metadata Model (C2M2) is a collection of files coded in the frictionless data package format.  The collection of files are a zipped set of TSV files containing metadata standardized to a set of known ontologies. Please explore the CFDE C2M2 documentation and C2M2 technical wiki for more information about how to prepare your metadata into C2M2 compatible files. Please also see the C2M2 section in the Standards and Protocols page of the CFDE Workbench portal on how to create C2M2 files. All uploaded zipped files are considered as C2M2 files by the ingestion system.
      </Typography>,
    example: <Link href="https://cfde-drc.s3.amazonaws.com/MoTrPAC/C2M2/2023-07-14/MoTrPAC_C2M2_2023-07-14_datapackage.zip" color="secondary">datapackage.zip</Link>
  },
  {
    asset: 'KG Assertions',
    description: <Typography fontSize={12}>A knowledge graph is a network that illustrates the relationship between different entities which may come from different datasets. A knowledge graph consists of three main components: nodes, edges and labels. Nodes are the entities represented in the knowledge graph e.g GO Ontology terms and edges characterize the relationship between nodes e.g. co-expressed with. Knowledge graph assertions are files which contain information about the nodes and edges that could be used to create a knowledge graph.
      For example, a KG Assertion file for nodes would contain columns which define information about each node: id, label, ontology_label. A KG Assertion file for edges would contain columns that comprises the necessary information about each edge: its source and target nodes, the labels for these nodes and their relationship. All uploaded files with .csv extensions are considered KG Assertion files by the ingestion system.
    </Typography>,
    example: <Link href='https://cfde-drc.s3.amazonaws.com/GTEx/KG/2023-10-26/GTEx_KG_2023-10-26_GTEX.edges.csv' target="_blank" color="secondary"><u>GTEX.edges.csv</u></Link>
  },
  {
    asset: 'Attribute Table',
    description: <Typography fontSize={12}>Attribute tables are files containing tables that describe the relationship between two entities with one entity type on the rows (e.g genes) and another on the columns (e.g tissue types). The intersection of a given row and column is then a value defining nature of the relationship between the row entity and the column entity e.g. the qualitative score of similarity between a given gene and a given tissue type. All uploaded files with .txt extensions are considered Attribute Table files by the ingestion system. </Typography>,
    example: <Link href='' color="secondary" target="_blank"><u></u></Link>
  },

]



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
  let extension = filename.split('.')[1]
  if (extension.slice(-2) === 'mt') {
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


  const uploadAndComputeSha256 = React.useCallback(async (file: File, filetype: string, dcc: string, setProgress: React.Dispatch<React.SetStateAction<number>>, progressAlloc: number, fileNumber: number) => {
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
    let date = new Date().toJSON().slice(0, 10)
    let filepath = dcc + '/' + filetype + '/' + date + '/' + file.name
    setProgress(oldProgress => oldProgress + progressAlloc / 3)
    const presignedurl = await createPresignedUrl(filepath, checksumHash)
    setProgress(oldProgress => oldProgress + progressAlloc / 3)


    await axios.put(presignedurl, file, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-amz-checksum-sha256': checksumHash
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const newProgress = ((fileNumber - 1) * progressAlloc) + ((0.667 * progressAlloc)) + ((progressEvent.loaded / progressEvent.total) * (0.333 * progressAlloc))
          setProgress(newProgress);
        }
      },
    }).catch(function (error) {
      if (error.response) {
        throw new Error(error.response.data)
      }
    })
    return checksumHash
  }, [])


  return (
    <form onSubmit={async (evt) => {
      evt.preventDefault()
      setStatus(() => ({ loading: true }))
      const formData = new FormData(evt.currentTarget)
      let dcc = formData.get('dcc')?.toString()
      if (uploadedfiles.length === 0) return setStatus(({ error: { selected: true, message: 'No files selected!' } }))
      for (var i = 0, l = uploadedfiles.length; i < l; i++) {
        if (parseFileTypeClient(uploadedfiles[i].name, uploadedfiles[i].type) === '') {
          setStatus(({ error: { selected: true, message: 'Error! Please make sure files are either .csv, .txt, .zip or .(x)mt' } }))
          return
        }
      }

      for (var i = 0, l = uploadedfiles.length; i < l; i++) {
        if (uploadedfiles[i].size > 500000000) {
          setStatus(({ error: { selected: true, message: 'File too large! Make sure that each file is less than 500MB' } }))
          return
        }
      }

      for (var i = 0, l = uploadedfiles.length; i < l; i++) {
        try {
          let filetype = parseFileTypeClient(uploadedfiles[i].name, uploadedfiles[i].type)
          if (!dcc) throw new Error('no dcc entered')
          let digest = await uploadAndComputeSha256(uploadedfiles[i], filetype, dcc, setProgress, 100 / (uploadedfiles.length), i + 1)
          await saveChecksumDb(digest, uploadedfiles[i].name, uploadedfiles[i].size, filetype, dcc)
        }
        catch (error) {
          if (error instanceof Error) {
            if (error.message === "\nInvalid `prisma.dccAsset.create()` invocation:\n\n\nUnique constraint failed on the fields: (`link`)") {
              console.log({ error }); setStatus(({ error: { selected: true, message: 'Error! File already exists in database. If same file was uploaded today, delete the already uploaded version or rename file to upload' } }));
              return
            } else {
              console.log({ error }); setStatus(({ error: { selected: true, message: 'Error Uploading File!' } }));
              return
            }
          } else {
            console.log({ error }); setStatus(({ error: { selected: true, message: 'Error Uploading File!' } }));
            return
          }
        }
      }
      setStatus(() => ({ success: true }))
      setProgress(0)
    }}>
      <S3UploadStatusContext.Provider value={status}>
        <Container>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h3" color="secondary.dark" sx={{ mb: 2, ml: 2, mt: 2 }} >DATA AND METADATA UPLOAD FORM</Typography>
            <AssetInfoDrawer assetOptions={metaDataAssetOptions} buttonText={<HelpIcon sx={{ mb: 2, mt: 2 }} />} />
          </Stack>
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
            <br></br>
            <AssetInfoDrawer assetOptions={metaDataAssetOptions} buttonText={<Typography >Click here for more information on data/metadata asset types</Typography>} />
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




