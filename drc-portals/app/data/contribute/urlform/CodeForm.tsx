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
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { Link } from '@mui/material';

const assetOptions = [
    {
        asset: 'ETL',
        description: <Typography fontSize={11}>Extract, transform, load (ETL) is a three-phase process where data is extracted,
        transformed (cleaned, sanitized, scrubbed) and loaded into an output data container or database. The ETL URL is the Github link containing the code that performs these operations on DCC generated data for different tools/purposes.
        </Typography>,
        example: <Link href="https://github.com/nih-cfde/LINCS-metadata/blob/main/scripts/build_file_lincs2021.py" color="secondary" target="_blank">LINCS ETL script</Link>
    },
    {
        asset: 'API',
        description: 
        <Typography fontSize={11}><b>SmartAPI: </b>The smartAPI Specification (smartAPI) is a community-based extension of the OpenAPI specification. It features new metadata elements and value sets to promote the interoperability of web-based APIs. (Extracted from <Link href="https://github.com/SmartAPI/smartAPI-Specification/blob/OpenAPI.next/versions/3.0.0.md#versions" color="secondary">smartAPI specifications</Link>). See <Link href="https://github.com/SmartAPI/smartAPI-Specification/blob/OpenAPI.next/versions/3.0.0.md#versions" color="secondary" target="_blank">smartAPI specs</Link> for more information on how to generate script that adhers to SmartAPI specifications  
        <br></br>
        <b>OpenAPI:</b> The OpenAPI Specification provides a formal standard for describing HTTP APIs. OpenAPI specifications are typically written in YAML or JSON. See  the <Link href="https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md" color="secondary" target="_blank" >Current openAPI Specs</Link> for more information on how to generate script that adhers to openAPI specifications </Typography>,
        example: <Link href="https://brl-bcm.stoplight.io/docs/exrna-atlas-json-api/ZG9jOjQ1Mg-overview" color="secondary">exRNA openAPI link </Link> 
    },
    {
        asset: 'PWB Metanode',
        description: <Typography fontSize={11}>This is a Github link to a script describing a Playbook metanode (a Playbook component representing knowledge resolution graph node specifications used in the Playbook Partnership). A metanode is implemented by defining the semantic description, typescript-constrained type and functionality of that node. See  <Link href="https://github.com/nih-cfde/playbook-partnership/blob/main/docs/background.md" color='secondary' target="_blank">Playbook Partnership documentation</Link> and <Link href="http://info.cfde.cloud/info/standards" color="secondary" target="_blank">Standards and Protocols</Link> page for more information about metanodes.</Typography>,
        example: <Link href='https://github.com/nih-cfde/playbook-partnership/blob/main/components/MW/metabolite_summary/index.tsx' target="_blank" color="secondary"><u>PWB Metanode example</u></Link>
    },
    {
        asset: 'Entity Page Template',
        description: <Typography fontSize={11}>Entity Page Template is a link to a template used to create the page displaying the datasheet full of useful information about a given entity e.g. a gene obtained from a DCC. An entity page presents a single view of a given entity, all metadata associated to this entity and all entities that have a connection to this entity. </Typography>,
        example: <Link href='https://www.gtexportal.org/home/gene/MAPK3' color="secondary" target="_blank"><u>Entity Page example</u></Link>
    },
    {
        asset:
            'Chatbot Specifications',
        description: <Typography fontSize={11}>Chatbot specifications URL is a link to code detailing the implementation of a chatbot that interacts with users to provide information about a DCC and/or its processed data. </Typography>,
        example: ''
    },
    {
        asset: 'Apps URL',
        description: <Typography fontSize={11}>App URLs are links to a page(s)/site that serves all the web applications or tools that have been created using a given DCCs data.</Typography>,
        example: <Link color="secondary" href="https://lincsproject.org/LINCS/tools" target="_blank">LINCS Apps URL</Link>
    }
]


export type CodeUploadStatus = {
    success?: boolean,
    error?: {
        selected: boolean;
        message: string
    },
}

function isValidHttpUrl(string: string, assetType: string) {
    if (assetType === 'Entity Page Template') {
        return true;
    } else {
        try {
            const newUrl = new URL(string);
            return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
        } catch (err) {
            return false;
        }
    }
}



const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        fontSize: 12,
        border: '1px solid #dadde9',
    },
}));

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
    const [apiSelected, setApiSelected] = React.useState(false)


    const handleChange = React.useCallback((event: SelectChangeEvent) => {
        setCodeType(event.target.value);
        if (event.target.value === 'API') {
            setApiSelected(true)
        } else {
            setApiSelected(false)
        }
    }, []);

    return (
        <form onSubmit={async (evt) => {
            evt.preventDefault()
            const formData = new FormData(evt.currentTarget)
            console.log(formData)
            if (apiSelected){
                let dcc = formData.get('dcc')?.toString()
                let assetType = formData.get('asset-type')?.toString()
                let openApiUrl = formData.get('openapi-url')?.toString()
                let smartApiUrl = formData.get('smartapi-url')?.toString()
                if ((!dcc) || (!assetType) || (!openApiUrl) || (!smartApiUrl)) {
                    setStatus(({ error: { selected: true, message: 'Error! Please make sure that all fields are filled' } }))
                    return
                }
                if ((!isValidHttpUrl(openApiUrl, assetType)) || (!isValidHttpUrl(smartApiUrl, assetType))) {
                    setStatus(({ error: { selected: true, message: 'Error! Not a valid HTTPS URL' } }))
                    return
                }
                await saveCodeAsset('OpenAPI URL', assetType, openApiUrl, dcc)
                await saveCodeAsset('SmartAPI URL', assetType, smartApiUrl, dcc)
                setStatus(() => ({ success: true }))
            } else {
                let dcc = formData.get('dcc')?.toString()
                let assetType = formData.get('asset-type')?.toString()
                let url = formData.get('url')?.toString()
                // let filename = formData.get('filename')?.toString()
                let filename = formData.get('url')?.toString()
                if ((!dcc) || (!assetType) || (!url) || (!filename)) {
                    setStatus(({ error: { selected: true, message: 'Error! Please make sure that all fields are correctly filled' } }))
                    return
                }
                if (!isValidHttpUrl(url, assetType)) {
                    setStatus(({ error: { selected: true, message: 'Error! Not a valid HTTPS URL' } }))
                    return
                }
                await saveCodeAsset(filename, assetType, url, dcc)
                setStatus(() => ({ success: true }))
            }

        }}>
            <Container>
                <Typography variant="h3" color="secondary.dark" className='p-5'>CODE ASSETS UPLOAD FORM</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                    This is the form to submit URLs for the code assets of your DCCs. If there is an asset type that is not listed as an option, please contact the DRC.
                </Typography>
                <Grid container className='p-5' justifyContent="center" sx={{ mt: 3 }}>
                    <TextField
                        label="Uploader Name"
                        disabled
                        defaultValue={user.name}
                        inputProps={{ style: { fontSize: 16 } }} // font size of input text
                        InputLabelProps={{ style: { fontSize: 16 } }} // font size of input label
                    />
                    <TextField
                        label="Email"
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
                                label="Code Asset Type"
                                name="asset-type"
                                sx={{ fontSize: 16 }}
                                color='secondary'
                            >
                                {assetOptions.map((asset) => {
                                    return <MenuItem key={asset.asset} value={asset.asset} sx={{ fontSize: 16 }}><HtmlTooltip
                                        title={
                                            <React.Fragment>
                                                <Typography>{asset.asset}</Typography>
                                                {asset.description} <br></br>
                                                {'Example:'} {asset.example}
                                            </React.Fragment>
                                        }
                                        placement="left"
                                    >
                                        <Typography sx={{ color: 'black', fontSize: 16 }}>{asset.asset}</Typography>
                                    </HtmlTooltip></MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </div>
                    {/* <TextField sx={{ minWidth: 440 }}
                        label="File Name"
                        name='filename'
                        required
                        color='secondary'
                        placeholder='Enter file name here'
                        inputProps={{ style: { fontSize: 16 } }}
                        InputLabelProps={{ style: { fontSize: 16 } }}
                    /> */}
                    {!apiSelected && <TextField sx={{ minWidth: 440 }}
                        label="URL"
                        name='url'
                        required
                        color='secondary'
                        placeholder='Enter URL here'
                        inputProps={{ style: { fontSize: 16 } }}
                        InputLabelProps={{ style: { fontSize: 16 } }}
                    />}
                    
                    {apiSelected && <>
                        <TextField sx={{ minWidth: 220 }}
                        label="OpenAPI URL"
                        name='openapi-url'
                        required
                        color='secondary'
                        placeholder='Enter URL here'
                        inputProps={{ style: { fontSize: 16 } }}
                        InputLabelProps={{ style: { fontSize: 16 } }}
                    />
                    <TextField sx={{ minWidth: 220 }}
                        label="SmartAPI URL"
                        name='smartapi-url'
                        required
                        color='secondary'
                        placeholder='Enter URL here'
                        inputProps={{ style: { fontSize: 16 } }}
                        InputLabelProps={{ style: { fontSize: 16 } }}
                    />
                    </>}


                </Grid>
                {/* <Grid container justifyContent="center" className='p-5'>
                    <TextField sx={{ minWidth: 640 }}
                        label="URL"
                        name='url'
                        required
                        color='secondary'
                        placeholder='Enter URL here'
                        inputProps={{ style: { fontSize: 16 } }}
                        InputLabelProps={{ style: { fontSize: 16 } }}
                    />
                </Grid> */}
                <Status status={status} />
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
