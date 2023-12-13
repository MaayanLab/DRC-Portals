'use client'

import React from 'react'
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DCCSelect from '../form/DCCSelect';
import { $Enums } from '@prisma/client';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { saveCodeAsset } from './UploadCode';
import Status from './Status';

const assetOptions = [
    'ETL',
    'API',
    'PWB Metanode',
    'Entity Page',
    'Chatbot Specifications',
    'App URL'
]


export type CodeUploadStatus = {
    success?: boolean,
    error?: {
      selected: boolean;
      message: string
    },
  }
  

export function CodeForm(user: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    dcc: string | null
    role: $Enums.Role;
}) {

    const [codeType, setCodeType] = React.useState('');
    const [status, setStatus] = React.useState<CodeUploadStatus>({})


    const handleChange = React.useCallback((event: SelectChangeEvent) => {
        setCodeType(event.target.value);
    }, []);

    return (
        <form onSubmit={async (evt) => {
            evt.preventDefault()
            const formData = new FormData(evt.currentTarget)
            console.log(formData)
            let dcc = formData.get('dcc')?.toString()
            let assetType = formData.get('asset-type')?.toString()
            let url = formData.get('url')?.toString()
            let filename = formData.get('filename')?.toString()
            if ((!dcc) || (!assetType) || (!url) || (!filename)) {
                setStatus(({ error: { selected: true, message: 'Error! Please make sure that all fields are correctly filled' } }))
                return
            }
            await saveCodeAsset(filename, assetType, url, dcc)
            setStatus(() => ({ success: true }))
        }}>
            <Container>
                <Typography variant="h3" color="secondary.dark" className='p-5'>CODE ASSETS UPLOAD FORM</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                    This is the form to submit URLs for the code assets of your DCCs. If there is an asset type that is not listed as an option, please contact the DRC.
                </Typography>
                <Grid container className='p-5' justifyContent="center" sx={{ mt: 3 }}>
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
                        sx={{ mx: 2 }}
                    />
                    <DCCSelect dccOptions={user.dcc ? user.dcc : ''} />
                </Grid>
                <Grid container justifyContent="center">
                    <div>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel id="select-url"
                                sx={{ fontSize: 16 }} color='secondary'
                            >Code Asset Type</InputLabel>
                            <Select
                                labelId="select-url"
                                id="simple-select"
                                value={codeType}
                                onChange={handleChange}
                                autoWidth
                                required
                                label="Asset Type"
                                name="asset-type"
                                sx={{ fontSize: 16 }}
                                color='secondary'
                            >
                                {assetOptions.map((asset) => {
                                    return <MenuItem key={asset} value={asset} sx={{ fontSize: 16 }}>{asset}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </div>
                    <TextField sx={{ minWidth: 440 }}
                        label="File Name"
                        name='filename'
                        required
                        color='secondary'
                        placeholder='Enter file name here'
                        inputProps={{ style: { fontSize: 16 } }}
                        InputLabelProps={{ style: { fontSize: 16 } }}
                    />
                </Grid>
                <Grid container justifyContent="center" className='p-5'>
                    <TextField sx={{ minWidth: 640 }}
                        label="URL"
                        name='url'
                        required
                        color='secondary'
                        placeholder='Enter URL here'
                        inputProps={{ style: { fontSize: 16 } }}
                        InputLabelProps={{ style: { fontSize: 16 } }}
                    />
                </Grid>
                <Status status={status}/>
                <div style={{ display: 'flex', justifyContent: 'center' }} className='p-5'>
                    <FormControl>
                        <Button variant="contained" color="tertiary" style={{ minWidth: '200px', maxHeight: '100px' }} type="submit" sx={{ marginTop: 2, marginBottom: 10 }}>
                            Submit
                        </Button>
                    </FormControl>
                </div>
               
            </Container>
        </form>
    );
}
