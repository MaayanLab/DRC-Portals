"use client"

import React, { use, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { Divider, FormControl, Grid, Stack, TextField, Typography } from '@mui/material';
import { FileDrop } from '@/components/FileDrop'
import Box, { BoxProps } from '@mui/material/Box';
import { Prisma } from '@prisma/client';
import JSZip from 'jszip'
import { useSession } from 'next-auth/react';


function Item(props: BoxProps) {
  const { sx, ...other } = props;
  return (
    <Box
      sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
        color: (theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
        // border: '1px solid',
        // borderColor: (theme) =>
        //   theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
        p: 1,
        m: 1,
        // borderRadius: 2,
        fontSize: '0.875rem',
        fontWeight: '700',
        ...sx,
      }}
      {...other}
    />
  );
}

async function saveFileMetadata(uploadedFile: Prisma.DccAssetCreateInput) {
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: JSON.stringify(uploadedFile)
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.json();
}



function UploadForm() {
  const [formFiles, setFormFiles] = useState(null);
  const [manifestJSON, setmanifestJSON] = useState<any | null>(null)
  const [otherFileInfo, setOtherFileInfo] = useState<File | null>(null)
  const [formObjects, setFormObjects] = useState<any | null>(null)
  const [sendToDb, setSendToDb] = useState<boolean>(false);

  const { data: session, status } = useSession();

  async function extractZipContents(zipFile: File, formObject: any) {
    if (!zipFile) return;
    const zip = new JSZip();
    const zipBlob = await zip.loadAsync(zipFile);
    // Accessing the contents of the ZIP file and getting the contents of manifest.json
    zipBlob.forEach(async (relativePath, zipEntry) => {
      const content = await zipEntry.async('text');
      if (relativePath.split('/')[1] === 'manifest.json') {
        let manifestContent = JSON.parse(content.toString());
        setmanifestJSON(manifestContent);
      }
    });
  };

  async function getPreSignedURL(otherFileInfo: File) {
    if (otherFileInfo != null) {
      let response = await fetch(`/api/s3upload?name=${otherFileInfo.name}&dcc=${formObjects.dcc}&filetype=${manifestJSON.filetype}&date=${new Date().toJSON().slice(0, 10)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      if (response.status === 200) {
        response.json().then((response) => {
          let url = response.message;
          fetch(url, {
            method: 'PUT',
            body: otherFileInfo
          })
        })
      }
    }
  }

  
  // get the other files when manifest.json has been loaded
  useEffect(() => {
    if (manifestJSON !== null) {
      if (!formFiles) return;
      const zip = new JSZip();
      zip.loadAsync(formFiles).then((zipBlob) => {
        zipBlob.forEach(async (relativePath, zipEntry) => {
          if (relativePath.split('/')[1] === manifestJSON.filename) {
            const content = await zipEntry.async('blob');
            let newFile = new File([content], relativePath.split('/')[1]);
            setOtherFileInfo(newFile);
          }
        });
      })
    };
  }, [manifestJSON])


  // when all data has been loaded, start sending to database and S3
  useEffect(() => {
    if ((manifestJSON != null) && (otherFileInfo != null)) {
      setSendToDb(true);
    }
  }, [manifestJSON, otherFileInfo, formObjects])


  // when sendtoDb is true send data to database and S3
  useEffect(() => {
    if (sendToDb === true) {
      if ((manifestJSON != null) && (otherFileInfo != null)) {
        const data = {
          filetype: manifestJSON.filetype,
          filename: otherFileInfo.name,
          link: "https://cfde-drc.s3.amazonaws.com/" + formObjects.dcc + '/' + manifestJSON.filetype + '/' + new Date().toJSON().slice(0, 10) + '/' + otherFileInfo.name,
          size: otherFileInfo.size,
          creator: formObjects.email,
          annotation: manifestJSON.annotation,
          dcc_string: formObjects.dcc,
          dcc_id: ""
        }
        console.log(data)

        // put metadata in database
        fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(data),
        });

        // put file S3
        let perpetualFileInfo = otherFileInfo;
        getPreSignedURL(perpetualFileInfo);

        // reset variables
        setmanifestJSON({});
        setFormFiles(null);
        setOtherFileInfo(null);
        setSendToDb(false)
      }
    }
  }, [sendToDb])




  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    var data = new FormData(event.currentTarget);
    let formObject = Object.fromEntries(data.entries());
    if (formFiles != null) {
      formObject.file = formFiles
      setFormObjects(formObject)
      await extractZipContents(formFiles, formObject)

      alert("Form Submitted");
      console.log(otherFileInfo)
      console.log(manifestJSON)
      console.log(formObjects)
    }

  }


  return (
    <>
      <Container className="mt-10" component='form' onSubmit={handleSubmit}>
        <Typography variant="h3" className='text-center p-5'>Data and Metadata Upload Form</Typography>
        <Grid container spacing={4} className='p-5' justifyContent="center">
          <Item>
            <TextField
              label="Uploader Name"
              defaultValue=" "
              value={session?.user.name}
              name='name'
            />
          </Item>
          <Item>
            <TextField
              label="Email"
              value={session?.user.email}
              defaultValue=" "
              name='email'
            />
          </Item>
          <Item>
            <TextField
              label="DCC"
              value='LINCS'
              name='dcc'
            />
          </Item>
        </Grid>

        <Typography className='text-center p-5'>Please upload a zipped file containing your data/metdata file and a manifest.json file detailing file information. </Typography>
        <Stack
          divider={<Divider flexItem ></Divider>}
          spacing={2}
          alignItems="center"
          className='p-5'
          border={1}
          sx={{
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
            color: (theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
            p: 1,
            m: 1,
            borderRadius: 2,
            fontSize: '0.875rem',
            fontWeight: '700',
          }}
        >
          <FileDrop setFormFiles={setFormFiles} />
        </Stack>
        <Item style={{ display: 'flex', justifyContent: 'center' }} className='p-5'>
          <FormControl>
            <Button variant="contained" color="primary" style={{ minWidth: '200px', maxHeight: '100px' }} type="submit" sx={{ marginTop: 2, marginBottom: 10 }}>
              Submit Form
            </Button>
          </FormControl>
        </Item>
      </Container>
    </>


  );
}

export default UploadForm;