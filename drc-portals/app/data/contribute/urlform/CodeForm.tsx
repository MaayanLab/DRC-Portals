'use client'

import React from 'react'
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DCCSelect from '../form/DCCSelect';
import { $Enums, CodeAsset, DccAsset, FileAsset } from '@prisma/client';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { findCodeAsset, saveCodeAsset, updateCodeAsset } from './UploadCode';
import Status from './Status';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { Link, List, ListItemText, Stack } from '@mui/material';
import AssetInfoDrawer from '../AssetInfo';
import HelpIcon from '@mui/icons-material/Help';
import { z } from 'zod';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { CheckCircle, Error } from '@mui/icons-material'

const OtherCodeData = z.object({
    name: z.string(),
    url: z.string(),
    assetType: z.string(),
    dcc: z.string(),
    description: z.string().optional()
});


const APIData = z.object({
    name: z.string(),
    url: z.string(),
    assetType: z.string(),
    dcc: z.string(),
    description: z.string().optional(),
    openAPISpecs: z.string().optional(),
    smartAPISpecs: z.string().optional(),
    smartAPIUrl: z.string().optional(),
});

type OtherCodeDataType = {
    name: string
    url: string
    assetType: string
    dcc: string
    description?: string
}

type APIDataType = {
    name: string
    url: string
    assetType: string
    dcc: string
    description?: string
    openAPISpecs?: string
    smartAPISpecs?: string
    smartAPIUrl?: string
}


export const assetOptions = [
    {
        asset: 'ETL',
        description: <Typography fontSize={12}>Extract, transform, load (ETL) is the process of converting the DCC raw data into various processed data formats such as the C2M2, XMT, KG assertions, attribute tables, and database tables.The ETL URL should point to the DCC GitHub repo containing the scripts that process the data by the DCC to generate these processed datasets.
        </Typography>,
        example: <Typography></Typography>
    },
    {
        asset: 'API',
        description:
            <Typography fontSize={12}> It is expected that each DCC will have a URL to a page that documents how to access each DCC data and tools via APIs. Moreover, APIs should be documented in a standard format and the recommended standard is OpenAPI. In addition, it is recommended to deposit these APIs into the SmartAPI repository.
                <br></br>
                <b>SmartAPI: </b> This is a community-based repository for depositing APIs documented in the OpenAPI specification. It features additional metadata elements and value sets to promote the interoperability of RESTful APIs. See the <Link href="https://github.com/SmartAPI/smartAPI-Specification/blob/534f778052f98ec49088e1c7f22b53914a52f8d7/versions/3.0.0.md#versions" color="secondary" target="_blank">SmartAPI specifications</Link> specifications for more information on how to deposit your API into SmartAPI.
                <br></br>
                <b>OpenAPI:</b> The OpenAPI specification provides a formal standard for describing REST APIs. OpenAPI specifications are typically written in YAML or JSON. See  the <Link href="https://github.com/OAI/OpenAPI-Specification/blob/a1c2b7523a29574308f4bf1e3909a43262a5a6b2/versions/3.1.0.md" color="secondary" target="_blank" >current OpenAPI Specs</Link> for more information on how to generate your DCC OpenAPI document.</Typography>,
        example: <Link href="https://brl-bcm.stoplight.io/docs/exrna-atlas-json-api/ZG9jOjQ1Mg-overview" color="secondary">exRNA openAPI link </Link>
    },
    {
        asset: 'Playbook Workflow Builder (PWB) Metanodes',
        description: <Typography fontSize={12}>A PWB metanode is a workflow engine component  implemented by defining the semantic description, typescript-constrained type, and functionality of a node in the network of PWB workflows. See  <Link href="https://github.com/nih-cfde/playbook-partnership/blob/eece1eb07365d6255b44708b64606aa42eef5563/docs/background.md" color='secondary' target="_blank">Playbook Partnership documentation</Link> and <Link href="/info/standards" color="secondary" target="_blank">Standards and Protocols</Link> for more information about developing and publishing metanodes. The form requires a GitHub link to a script describing a Playbook metanode .</Typography>,
        example: <Link href='https://github.com/nih-cfde/playbook-partnership/blob/eece1eb07365d6255b44708b64606aa42eef5563/components/MW/metabolite_summary/index.tsx' target="_blank" color="secondary"><u>PWB Metanode example</u></Link>
    },
    {
        asset: 'Entity Page Template',
        description: <Typography fontSize={12}>The Entity Page Template and Example are links to: 1) a template used to create the landing page displaying the datasheet about a gene, a metabolite, and protein, a cell type, or other entities from a DCC; 2) The example URL provides a valid URL to an existing entity page that presents a single view of a given entity. Example of a template from GTEx: https://www.gtexportal.org/home/gene/${`<GENE_NAME>`}. </Typography>,
        example: <Link href='https://www.gtexportal.org/home/gene/MAPK3' color="secondary" target="_blank"><u>Live entity page from GTEx</u></Link>
    },
    {
        asset:
            'Chatbot Specifications',
        description: <Typography fontSize={12}>Chatbot specifications URL is a link to a manifest file containing metadata and OpenAPI specifications which can be used to develop a chat plugin for large language models. These plugins allow the large language models to function as specialized chatbots that have access to the exposed API endpoints described in the manifest files and can call these APIs based on user input. See <Link color="secondary" href="https://platform.openai.com/docs/plugins" target="_blank">ChatGPT plugins documentation</Link> for more information on how to develop chatbot specifications.</Typography>,
        example: <Link href="https://github.com/openai/plugins-quickstart/blob/3096542ef96b77f93d6b13a0ea105641c3763284/.well-known/ai-plugin.json" color="secondary" target="_blank">ai-plugin specs template</Link>
    },
    {
        asset: 'Apps URL',
        description: <Typography fontSize={12}>An Apps URL is a link to a page(s) that serves a listing of bioinformatics tools, workflows, and databases produced by the DCC.</Typography>,
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


type fullDCCAsset = {
    dcc: {
        short_label: string | null
    } | null;
    fileAsset: FileAsset | null;
    codeAsset: CodeAsset | null;
} & DccAsset

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
    const [smartSelected, setSmartSelected] = React.useState(false)
    const [apiSelected, setApiSelected] = React.useState(false)
    const [popOpen, setPopOpen] = React.useState(false)
    const [oldVersion, setOldVersion] = React.useState<fullDCCAsset[]>([])
    const [currentVersion, setCurrentVersion] = React.useState<OtherCodeDataType | APIDataType | null>(null)


    const handlePopClose = () => {
        setPopOpen(false);
    };

    const handlePopConfirm = async (isAPI: boolean | undefined) => {
        if (isAPI !== undefined) {
            try {
                if (currentVersion) {
                    if (!isAPI) {
                        const parsedForm = OtherCodeData.parse(currentVersion)
                        if (!isValidHttpUrl(parsedForm.url, parsedForm.assetType)) {
                            setStatus(({ error: { selected: true, message: 'Error! Not a valid HTTPS URL' } }))
                            setCurrentVersion(null)
                            setOldVersion([])
                            setPopOpen(false);
                            return
                        }
                        await updateCodeAsset(parsedForm.name, parsedForm.assetType, parsedForm.url, parsedForm.dcc, parsedForm.description as string)
                        setStatus(() => ({ success: true }))
                        setCurrentVersion(null)
                        setOldVersion([])
                    } else {
                        const parsedAPIData = APIData.parse(currentVersion)
                        console.log(parsedAPIData)
                        const openAPISpecs = parsedAPIData.openAPISpecs ? true : false
                        const smartAPISpecs = parsedAPIData.smartAPISpecs ? true : false
                        if (!isValidHttpUrl(parsedAPIData.url, parsedAPIData.assetType)) {
                            setStatus(({ error: { selected: true, message: 'Error! Not a valid HTTPS URL' } }))
                            setCurrentVersion(null)
                            setOldVersion([])
                            setPopOpen(false);
                            return
                        }
                        await updateCodeAsset(parsedAPIData.name, parsedAPIData.assetType, parsedAPIData.url, parsedAPIData.dcc, parsedAPIData.description as string, openAPISpecs, smartAPISpecs, parsedAPIData.smartAPIUrl)
                        setStatus(() => ({ success: true }))
                        setCurrentVersion(null)
                        setOldVersion([])
                    }
                }
            }
            catch (error) {
                console.log({ error }); setStatus(({ error: { selected: true, message: 'Error Uploading Code Asset!' } }));
                return
            }
            setPopOpen(false);
        }
    };

    const handleChange = React.useCallback((event: SelectChangeEvent) => {
        setCodeType(event.target.value);
        if (event.target.value === 'API') {
            setApiSelected(true)
        } else {
            setApiSelected(false)
        }
    }, []);

    const handleSmartSelect = React.useCallback((event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
        if (checked) {
            setSmartSelected(true)
        } else {
            setSmartSelected(false)
        }
    }, []);

    return (
        <form onSubmit={async (evt) => {
            evt.preventDefault()
            const formData = new FormData(evt.currentTarget)
            if (apiSelected) {
                const parsedAPIData = APIData.parse(Object.fromEntries(formData));
                const openAPISpecs = parsedAPIData.openAPISpecs ? true : false
                const smartAPISpecs = parsedAPIData.smartAPISpecs ? true : false
                const smartAPIUrl = parsedAPIData.smartAPIUrl ? parsedAPIData.smartAPIUrl : ''
                if (!isValidHttpUrl(parsedAPIData.url, parsedAPIData.assetType)) {
                    setStatus(({ error: { selected: true, message: 'Error! Not a valid HTTPS URL' } }))
                    return
                }
                const foundVersions = await findCodeAsset(parsedAPIData.url)
                if (foundVersions.length > 0) {
                    setPopOpen(true)
                    setOldVersion(foundVersions)
                    setCurrentVersion(parsedAPIData)
                } else {
                    try {
                        await saveCodeAsset(parsedAPIData.name, parsedAPIData.assetType, parsedAPIData.url, parsedAPIData.dcc, parsedAPIData.description as string, openAPISpecs, smartAPISpecs, smartAPIUrl)
                        setStatus(() => ({ success: true }))
                    }
                    catch (error) {
                        console.log({ error }); setStatus(({ error: { selected: true, message: 'Error Uploading Code Asset!' } }));
                        return
                    }
                }
            } else {
                const parsedForm = OtherCodeData.parse(Object.fromEntries(formData));
                if (!isValidHttpUrl(parsedForm.url, parsedForm.assetType)) {
                    setStatus(({ error: { selected: true, message: 'Error! Not a valid HTTPS URL' } }))
                    return
                }
                const foundVersions = await findCodeAsset(parsedForm.url)
                if (foundVersions.length > 0) {
                    setPopOpen(true)
                    setOldVersion(foundVersions)
                    setCurrentVersion(parsedForm)
                } else {
                    try {
                        await saveCodeAsset(parsedForm.name, parsedForm.assetType, parsedForm.url, parsedForm.dcc, parsedForm.description as string)
                        setStatus(() => ({ success: true }))
                    }
                    catch (error) {
                        console.log({ error }); setStatus(({ error: { selected: true, message: 'Error Uploading Code Asset!' } }));
                        return
                    }
                }

            }

        }}>


            <Container>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h3" color="secondary.dark" sx={{ mb: 2, ml: 2, mt: 2 }}>CODE ASSETS FORM </Typography>
                    <AssetInfoDrawer assetOptions={assetOptions} buttonText={<HelpIcon sx={{ mb: 2, mt: 2 }} />} />
                </Stack>

                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                    This is the form to submit URLs for the code assets of your DCCs. If there is an asset type that is not listed as an option, please contact the DRC.
                    <AssetInfoDrawer assetOptions={assetOptions} buttonText={<Typography >Click here for more information on code asset types</Typography>} />
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid md={9} xs={12}>
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
                        <Grid container justifyContent="center" className='mb-5'>
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
                                        name="assetType"
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

                            <TextField sx={{ minWidth: 440 }}
                                label="Name"
                                name='name'
                                required
                                color='secondary'
                                placeholder='Enter asset name here'
                                inputProps={{ style: { fontSize: 16 } }}
                                InputLabelProps={{ style: { fontSize: 16 } }}
                            />

                        </Grid>

                        <Grid container justifyContent="center" className='mb-5'>
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

                        {smartSelected && <Grid container justifyContent="center" className='mb-5'>
                            <TextField sx={{ minWidth: 640 }}
                                label="SmartAPI URL"
                                name='smartAPIUrl'
                                color='secondary'
                                placeholder='Enter SmartAPI URL here'
                                inputProps={{ style: { fontSize: 16 } }}
                                InputLabelProps={{ style: { fontSize: 16 } }}
                            />
                        </Grid>}

                        <Grid container justifyContent="center">
                            <TextField sx={{ minWidth: 640 }}
                                multiline
                                rows={4}
                                label="Description"
                                name='description'
                                color='secondary'
                                placeholder='Enter short description here'
                                inputProps={{ style: { fontSize: 16 } }}
                                InputLabelProps={{ style: { fontSize: 16 } }}
                            />
                        </Grid>
                        <Status status={status} />
                        <Grid
                            container
                            direction="column"
                            alignItems="center"
                        >
                            <FormControl>
                                <Button variant="contained" color="tertiary" style={{ minWidth: '200px', maxHeight: '100px' }} type="submit" sx={{ marginTop: 2, marginBottom: 10 }}>
                                    Submit
                                </Button>
                            </FormControl>
                            {/* </div> */}
                        </Grid>

                    </Grid>
                    {apiSelected && <Grid md={3} xs={12}>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox />} label="OpenAPI Specifications" name="openAPISpecs" />
                            <FormControlLabel control={<Checkbox />} label="SmartAPI Specifications" name="smartAPISpecs" onChange={handleSmartSelect} />
                        </FormGroup>
                    </Grid>}
                </Grid>


                <Dialog
                    open={popOpen}
                    onClose={handlePopClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Update Version of Code Asset?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            An existing version of this code asset already exists in the database. Do you want to update it?
                            {oldVersion.map((asset) => <List>
                                <ListItemText>
                                    <strong>Name:</strong> {asset.codeAsset?.name}
                                </ListItemText>
                                <ListItemText>
                                    <strong>Type:</strong> {asset.codeAsset?.type}
                                </ListItemText>
                                <ListItemText>
                                    <strong>URL: </strong><Link color="secondary" href={asset.link} target="_blank">{asset.link}</Link>
                                </ListItemText>
                                <ListItemText>
                                    <strong>Last Modified: </strong>{asset.lastmodified.toUTCString()}
                                </ListItemText>
                                <ListItemText>
                                    <strong>DCC:</strong> {asset.dcc?.short_label}
                                </ListItemText>
                                {asset.codeAsset?.type === 'API' && <><ListItemText>
                                    <strong>OpenAPISpecs:</strong> {asset.codeAsset.openAPISpec ? (<CheckCircle sx={{ color: "#7187C3" }} />) : ((<Error />))}
                                </ListItemText>
                                    <ListItemText>
                                        <strong>SmartAPISpecs:</strong> {asset.codeAsset.smartAPISpec ? (<CheckCircle sx={{ color: "#7187C3" }} />) : ((<Error />))}
                                    </ListItemText>
                                    <ListItemText>
                                        <strong>SmartAPIURL:</strong> {asset.codeAsset.smartAPIURL ? asset.codeAsset.smartAPIURL : ''}
                                    </ListItemText> </>}
                            </List>)}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" onClick={handlePopClose}>No</Button>
                        <Button color="secondary" onClick={() => handlePopConfirm(currentVersion ? currentVersion.assetType === 'API' : undefined)} autoFocus>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>

        </form>

    );
}
