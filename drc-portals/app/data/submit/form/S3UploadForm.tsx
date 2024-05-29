'use client'

import React from 'react'
import { findFileAsset, saveChecksumDb } from './UploadFunc'
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FileDrop } from './FileDrop'
import ThemedStack from './ThemedStack';
import Status from './Status';
import { DCCSelect, FileTypeSelect } from './DCCSelect';
import { $Enums, DCC, User } from '@prisma/client';
import { Box, Link, List, ListItem, Stack, Tooltip } from '@mui/material';
import { ProgressBar } from './ProgressBar';
import jsSHA256 from 'jssha/sha256'
import { createPresignedUrl } from './UploadFunc'
import AssetInfoDrawer from '../AssetInfo';
import HelpIcon from '@mui/icons-material/Help';
import axios from "axios";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export const metaDataAssetOptions = [
  {
    asset: 'XMT',
    description: <Typography fontSize={12}> XMT files are text files that contain a collection of sets of a given entity type, for example, a library of gene sets. The 'X' in XMT stands for any entity type. It is an extension to GMT which stands for <Link color="secondary" href="https://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#GMT:_Gene_Matrix_Transposed_file_format_.28.2A.gmt.29" target="_blank">Gene Matrix Transpose</Link> that is used to store gene sets. Besides .gmt files, XMT files can be .dmt files which are XMT files that contain a collection of drug sets, or .mmt files which contain metabolite sets. Other sets for other entities are also valid. On each row of an XMT file, the first column contains the term associated with the set, while all other columns contain the set entities. The field separator between columns should be a {`<tab>`} character.
    </Typography>,
    example: <Link href="https://cfde-drc.s3.amazonaws.com/GTEx/XMT/2023-03-10/GTEx_XMT_2023-03-10_GTEx_Tissues_V8_2023.gmt" color="secondary" target="_blank">GTEx_Tissues_V8_2023.gmt</Link>
  },
  {
    asset: 'C2M2',
    description:
      <Typography fontSize={12}> The Crosscut Metadata Model (C2M2) is a collection of files coded in the frictionless data package format.  The collection of files are a zipped set of TSV files containing metadata standardized to a set of known ontologies. Please explore the CFDE C2M2 documentation and C2M2 technical wiki for more information about how to prepare your metadata into C2M2 compatible files. Please also see the C2M2 section in the Documentation page of the CFDE Workbench portal on how to create C2M2 files.
      </Typography>,
    example: <Link href="https://cfde-drc.s3.amazonaws.com/MoTrPAC/C2M2/2023-07-14/MoTrPAC_C2M2_2023-07-14_datapackage.zip" color="secondary">datapackage.zip</Link>
  },
  {
    asset: 'KG Assertions',
    description: <Typography fontSize={12}>A knowledge graph is a network that illustrates the relationship between different entities which may come from different datasets. A knowledge graph consists of three main components: nodes, edges and labels. Nodes are the entities represented in the knowledge graph e.g GO Ontology terms and edges characterize the relationship between nodes e.g. co-expressed with. Knowledge graph assertions are files which contain information about the nodes and edges that could be used to create a knowledge graph.
      For example, a KG Assertion file for nodes would contain columns which define information about each node: id, label, ontology_label. A KG Assertion file for edges would contain columns that comprises the necessary information about each edge: its source and target nodes, the labels for these nodes and their relationship.
    </Typography>,
    example: <Link href='https://cfde-drc.s3.amazonaws.com/GTEx/KG/2023-10-26/GTEx_KG_2023-10-26_GTEX.edges.csv' target="_blank" color="secondary">GTEX.edges.csv</Link>
  },
  {
    asset: 'Attribute Table',
    description: <Typography fontSize={12}>Attribute tables are files containing tables that describe the relationship between two entities with one entity type on the rows (e.g genes) and another on the columns (e.g tissue types). The intersection of a given row and column is then a value defining nature of the relationship between the row entity and the column entity e.g. the qualitative score of similarity between a given gene and a given tissue type. </Typography>,
    example: <Link href='https://cfde-drc.s3.amazonaws.com/LINCS/Attribute%20Table/2024-03-29/LINCS_L1000_CRISPR_KO_Perturbation_Consensus_CD_Sigs.h5' color="secondary" target="_blank" sx={{ wordWrap: 'break-word' }}> LINCS_L1000_CRISPR_KO_Perturbation_Consensus_CD_Sigs.h5</Link>
  },

]



export type S3UploadStatus = {
  success?: boolean,
  loading?: {
    selected: boolean;
    message: string
  },
  error?: {
    selected: boolean;
    message: string
  },
}


const S3UploadStatusContext = React.createContext({} as S3UploadStatus)

function parseFileTypeClient(filename: string, filetype: string, enteredFileType: string) {
  let parsedFileType : string[] = []
  let extension = filename.split('.')[1]
  if (extension.slice(-2) === 'mt') {
    parsedFileType.push('XMT')
  } else if ((extension === 'h5') || (extension === 'hdf5')) {
    parsedFileType.push('Attribute Table')
  } else if ((filetype === 'zip') || (filetype === 'application/zip') || (filetype === 'application/x-zip') || (filetype === "application/x-zip-compressed")) {
    parsedFileType = ['C2M2', 'KG Assertions']
  }
  return parsedFileType.includes(enteredFileType) ? true : false
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

const assetTypeExtensionMap: { [key: string]: string } = {
  'KG Assertions': '.zip',
  'C2M2': '.zip',
  'XMT': '.gmt or .dmt',
  'Attribute Table': '.h5 or hdf5'
}

/**
 * Any child of <S3UploadForm> can access this hook to
 *  see the status of the upload.
 */
export function useS3UploadStatus() {
  return React.useContext(S3UploadStatusContext)
}

export function S3UploadForm(user: User & { dccs: DCC[] }
) {

  const [status, setStatus] = React.useState<S3UploadStatus>({})
  const [uploadedfile, setUploadedfile] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [popOpen, setPopOpen] = React.useState(false)
  const [fileTypeMatch, setFileTypeMatch] = React.useState({ 'dcc': '', 'filetype': '', 'expected': '', 'parsed': '' })



  const uploadAndComputeSha256 = React.useCallback(async (file: File, filetype: string, dcc: string, setProgress: React.Dispatch<React.SetStateAction<number>>) => {
    const hash = new jsSHA256("SHA-256", "UINT8ARRAY")
    const chunkSize = 64 * 1024 * 1024; // 64 MB chunks
    setStatus(() => ({ loading: { selected: true, message: 'Hashing File...' } }))
    for (let start = 0; start < file.size; start += chunkSize) {
      const end = Math.min(start + chunkSize, file.size)
      await new Promise<void>((resolve, reject) => {
        const fr = new FileReader()
        fr.onload = () => {
          hash.update(new Uint8Array(fr.result as ArrayBuffer));
          resolve();
        }

        fr.onprogress = (data) => {
          if (data.lengthComputable) {
            const newProgress = (start / end) * 100;
            setProgress(newProgress)
          }
        }
        fr.readAsArrayBuffer(file.slice(start, end))
      })
    }
    const checksumHash = hash.getHash('B64')
    let date = new Date().toJSON().slice(0, 10)
    let filepath = dcc.replace(' ', '') + '/' + filetype + '/' + date + '/' + file.name
    const presignedurl = await createPresignedUrl(filepath, checksumHash)

    setStatus(() => ({ loading: { selected: true, message: 'Uploading File to S3...' } }))
    await axios.put(presignedurl, file, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-amz-checksum-sha256': checksumHash
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const newProgress = ((progressEvent.loaded / progressEvent.total) * 100)
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


  const handlePopClose = React.useCallback(() => {
    setPopOpen(false);
  }, []);

  const handleContinue = React.useCallback(async () => {
    setPopOpen(false);
    setStatus(() => ({ loading: { selected: true, message: 'File Upload in Progress' } }))
    if (!uploadedfile) return setStatus(({ error: { selected: true, message: 'No files selected!' } }))
    try {
      let digest = await uploadAndComputeSha256(uploadedfile, fileTypeMatch.filetype, fileTypeMatch.dcc, setProgress)
      await saveChecksumDb(digest, uploadedfile.name, uploadedfile.size, fileTypeMatch.filetype, fileTypeMatch.dcc)
    }
    catch (error) {
      console.log({ error }); setStatus(({ error: { selected: true, message: 'Error Uploading File!' } }));
      return
    }
    setStatus(() => ({ success: true }))
    setProgress(0)
  }, [uploadedfile, fileTypeMatch]);


  return (
    <form onSubmit={async (evt) => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
      let dcc = formData.get('dcc')?.toString()
      let filetype = formData.get('fileAssetType')?.toString()
      if (!filetype) throw new Error('no file type entered')
      if (!uploadedfile) return setStatus(({ error: { selected: true, message: 'No files selected!' } }))

      // file size check
      if (uploadedfile.size > 5000000000) {
        setStatus(({ error: { selected: true, message: 'File too large! Make sure that each file is less than 5GB' } }))
        return
      }

      // other version of asset error check
      if (!dcc) throw new Error('no dcc entered')
      const foundVersions = await findFileAsset(filetype, dcc, uploadedfile.name)
      if (foundVersions.length > 0) {
        setStatus(({ error: { selected: true, message: `Error! File: ${uploadedfile.name} already exists in database. Rename file to upload` } }));
        return
      }

      const fileAssetTypeCheck = parseFileTypeClient(uploadedfile.name, uploadedfile.type, filetype)
      if (!fileAssetTypeCheck) {
        setFileTypeMatch({ dcc: dcc, filetype: filetype, expected: assetTypeExtensionMap[filetype], parsed: uploadedfile.type ? uploadedfile.type : '.' + uploadedfile.name.split('.')[1] })
        setPopOpen(true)
      } else {
        setStatus(() => ({ loading: { selected: true, message: 'File Upload in Progress' } }))
        try {
          let digest = await uploadAndComputeSha256(uploadedfile, filetype, dcc, setProgress)
          await saveChecksumDb(digest, uploadedfile.name, uploadedfile.size, filetype, dcc)
        }
        catch (error) {
          console.log({ error }); setStatus(({ error: { selected: true, message: 'Error Uploading File!' } }));
          return
        }
        setStatus(() => ({ success: true }))
        setProgress(0)
      }



    }}>
      <S3UploadStatusContext.Provider value={status}>
        <Container>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h3" color="secondary.dark" sx={{ mb: 2, ml: 2, mt: 2 }} >DATA AND METADATA UPLOAD FORM</Typography>
            <AssetInfoDrawer assetOptions={metaDataAssetOptions} buttonText={<Tooltip title='Click here for more information on data/metadata asset types'><HelpIcon sx={{ mb: 2, mt: 2 }} /></Tooltip>} />
          </Stack>
          <Typography variant="subtitle1" color="#666666" className='' sx={{ mb: 3, ml: 2 }}>
            This is the form to upload the data/metadata files for your DCC. Select the DCC for which the file belongs and the
            asset type of the file. Then drop your file in the upload box or click on the 'Choose File' to select file for upload. Please do not refresh
            your browser during the upload process.
            <br></br>
            The recommended extensions for each file asset type are:
            <List sx={{ listStyleType: 'disc', pl: 3 }}>
              <ListItem sx={{ display: 'list-item', padding: 0 }}>
                C2M2: .zip
              </ListItem>
              <ListItem sx={{ display: 'list-item', padding: 0 }}>
                KG Assertions: .zip
              </ListItem>
              <ListItem sx={{ display: 'list-item', padding: 0 }}>
                Attribute Table: .h5 or .hdf5
              </ListItem>
              <ListItem sx={{ display: 'list-item', padding: 0 }}>
                XMT: .(x)mt e.g .gmt or .dmt
              </ListItem>
            </List>
            See the {' '}
            <Link color="secondary" href="/data/submit"> Documentation page</Link> for more information about the steps to upload files.
            <br></br>
          </Typography>
          <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: 2 }}>
            <Grid item>
              <TextField
                label="Uploader Name"
                name='name'
                disabled
                defaultValue={user.name}
                inputProps={{ style: { fontSize: 16 } }} // font size of input text
                InputLabelProps={{ style: { fontSize: 16 } }} // font size of input label
              />
            </Grid>
            <Grid item>
              <TextField
                label="Email"
                name='email'
                disabled
                defaultValue={user.email}
                inputProps={{ style: { fontSize: 16 } }}
                InputLabelProps={{ style: { fontSize: 16 } }}
              />
            </Grid>
            <Grid item>
              <DCCSelect dccOptions={user.dccs.map((dcc) => dcc.short_label).toString()} />
            </Grid>
            <Grid item>
              <FileTypeSelect />
            </Grid>
          </Grid>
          <ThemedStack>
            <FileDrop name="currentData" setUploadedFile={setUploadedfile} />
          </ThemedStack>
          <Status />
          <div className='flex justify-center'>
            <Box sx={{ width: '50%' }}>
              {status.loading && <ProgressBar value={progress} />}
            </Box>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }} className='p-5'>
            <FormControl>
              <Button variant="contained" color="tertiary" style={{ minWidth: '200px', maxHeight: '100px' }} type="submit" sx={{ marginTop: 2, marginBottom: 10 }} disabled={user.role === 'READONLY'}>
                Submit Form
              </Button>
            </FormControl>
          </div>
          <Dialog
            open={popOpen}
            onClose={handlePopClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Unexpected File Type"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                The expected file extension for {fileTypeMatch.filetype} file is {fileTypeMatch.expected} but received {fileTypeMatch.parsed} file. Would you still like to proceed with the upload?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button color="secondary" onClick={handlePopClose}>No</Button>
              <Button color="secondary" autoFocus onClick={handleContinue}>
                Yes, Continue
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </S3UploadStatusContext.Provider>
    </form>
  )
}




