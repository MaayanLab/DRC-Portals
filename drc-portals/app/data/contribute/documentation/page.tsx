import React from 'react'
import { BsCheckCircleFill } from "react-icons/bs";
import { FaCircleExclamation } from "react-icons/fa6";
import Image from 'next/image'
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import { List, ListItem, Typography, Link } from '@mui/material';
import Nav from '../Nav';
import { StyledAccordionComponent } from './StyledAccordion';
import Markdown from 'react-markdown'
import dynamic from 'next/dynamic';

const YoutubeVideo = dynamic(() => import('./YoutubeVideo'))

export default function Documentation() {
    const macMarkdown = `
    shasum -a 256 [file location]
    `
    const linuxMarkdown = `
    sha256sum [file location]
    `
    const windowsMarkdown = `
    certutil -hashfile [file location] SHA256
    `
    const codeAssetSubmission = `
1. Go to the [Code Assets Upload Form](urlform) page OR Click on the “Contribute” option in the navigation bar or in the footer: 
2. On the Code Assets Upload Form, fill out all the fields: 
    - Select the DCC for which the asset is affiliated with
    - Select the code asset type you wish to submit from the available options ETL, API, PWB Metanode, Entity Page Template, Chatbot Specifications and Apps URL. If submitting an API asset. Please see the *API Code Asset Submission Steps* section
    - Enter the URL for the code asset in the URL field. Only valid HTTPS URLs are accepted.
3. After clicking on the “Submit Form” button: 
    - If an upload is successful, a green banner with “Success! Code Asset Uploaded” should appear. 
    - If an upload is unsuccessful, a red banner with an error message will appear.
4. Details of your uploaded code asset should appear on the [Uploaded Assets](uploaded) page. 

#### API Code Asset Submission Steps
1. Follow Steps 1-3 of the *Code Asset Submission Steps* section. 
2. Enter the URL of the page that documents the DCC APIs. 
    - If the API documentation meets OpenAPI specification, check the OpenAPI Specifications box.
    - If the API documentation is deposited in the SmartAPI registry, check the Deposited in SmartAPI box.
    - Insert the SmartAPI URL of the API if the SmartAPI URL is different from the API URL entered in the URL field of the form. Otherwise, leave the SmartAPI URL field empty.

#### Asset Upload Submission Troubleshooting/FAQ: 
1. Before uploading, ensure that all your account information has been entered/is accurate on the [My Account](account) page
    - If your email is missing, please fill it out and click 'Save Changes' 
    - If you do not have any DCCs associated with your account, please contact the DRC to update your information. 
    - If a DCC that you are affiliated with (and you are an uploader for) is not listed as one of your DCC options, please contact the DRC through email to update your information. 
    - If Role is inaccurate, please contact the DRC to update your information.
2. If you are to be an Uploader or Approver for your DCC and have “Access Denied” on the [Code Assets Upload Form](urlform) and [Uploaded Assets](uploaded) pages, please contact the DRC through email to grant you access.
3. If a mistake has been made in a submission, go to the [Uploaded Assets](uploaded) page, delete the incorrectly submitted asset by clicking on the delete icon on the row of the given file and reupload the corrected file.
    `

    const assetApproval = `
1. Go to the [Uploaded Assets](uploaded) page OR Click on the “Contribute” option in the navigation bar or in the footer and on the *Uploaded Assets* tab
2. Here you will find all uploaded assets that fall under your jurisdiction. 
    - For DCC Approvers, these are all assets that have been uploaded or submitted for your DCC. 
    - For DRC Approvers, these are all assets that have been uploaded/submitted by uploaders across all DCCs. 
3. All unapproved assets that you are authorized to approve will be marked by the “Approve Upload” button under the DCC status or DRC status columns for DCC and DRC Approvers respectively. 
4. To approve an asset, click on the “Approve Upload” button to approve the file. 
5. To remove the approved status of a asset, click on the button under the DCC/DRC status column. This reverses the Approval action. 
6. Similar steps are done to set an asset as the most current version. 
    - To toggle between setting an asset as Current and Archived, click on the button under Current column. Please note that:
        - Multiple assets of the same asset type can be set as current for a DCC. 
        - DCC and DRC approvers are authorized to change the current status of assets for affiliated DCCs/all DCCs respectively.

#### Troubleshooting/FAQ: 
1. If you are to be a DCC or DRC Approver and have “Access Denied” on the [Uploaded Assets](uploaded) page, please contact the DRC through email to change your role and grant you access.
2. If a DCC that you are affiliated with is not listed as one of your DCC options on the [My Account](/account) page, please contact the DRC through email to update your information. You will not be allowed to approve uploaded files for this DCC otherwise.
3. DCC Approvers do not have access to the File Upload and Code Submission Forms . This page is only available to DCC Uploaders and DRC Approvers.
`

    const deleteUsers = `
Both Uploaders and Approvers can delete uploaded assets.
1. On the [Uploaded Assets](uploaded) page, click on the delete icon next to the asset you wish to delete
2. A pop up will appear verifying your decision to delete the given asset. 
3. Click on "Yes, Delete" to confirm the deletion of the asset. **Please note that the delete operation is permanent**.
4. **For DCC and DRC approvers**: If a current asset is deleted, please update the current status of the otherwise most to update DCC asset of that type.
`

    const adminUsers = `
#### Create a User: 
1. Go to the [Admin](admin) page and click on the "Create New User" button,
2. Fill out the new user's information and click the “Create User” button. If successful, a banner with “User Creation Successful” should appear. 
#### Update User Information
1. Go to the [Admin](admin) page and select the users whose information is to be updated. 
2. In the dialog box that appears, for each user, select their new role and DCC information and click “Update”. An alert with “User Information Updated” will appear if the update operation is successful. 
3. When all selected users' information have been updated, click on “Done” or outside the dialog box
#### Delete Users
1. Go to the [Admin](admin) page and select the users to delete. 
2. Click on the  “Delete Users” button to delete selected users. **Please note that the delete operation is irreversible.**
`

    const entityPageText = `
The Entity Page Template and Example are  links to: 
1. A template used to create the landing page displaying the datasheet about a gene, a metabolite, and protein, a cell type, or other entities from a DCC; 
2. The example URL provides a valid URL to an existing entity page that presents a single view of a given entity. 

\Example of a template from GTEx:  https://www.gtexportal.org/home/gene/<GENE_NAME>. 

\Example live entity page from GTEx: [https://www.gtexportal.org/home/gene/MAPK3](https://www.gtexportal.org/home/gene/MAPK3)`

    return (
        <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item container md={2} xs={12}>
                <Nav />
            </Grid>
            <Grid item container md={10} xs={12}>
                <Container className="justify-content-center">
                    <Typography variant="h3" color="#111827.dark" className='p-5'>SUBMIT DOCUMENTATION</Typography>
                    <Typography variant="subtitle1" color="#374151" sx={{ mb: 3, ml: 2 }}>
                        This page covers the submission system documentation of the Data Resource Portal.
                        We are collecting file and code assets from Common Fund programs to make them
                        Findable, Accessible, Interoperable, and Reusable (FAIR) within the Data Resource Portal.
                        To submit assets, you must be logged in and registered. Registration involves being assigned a
                        role by an administrator. To register, please send us an email at <Link href="mailto:help@cfde.cloud" color='secondary'>help@cfde.cloud</Link>.
                        Please click on any section from the dropdown list below to navigate to that section.
                    </Typography>
                    <Grid item>
                        <StyledAccordionComponent heading='File Types' content={<>
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>XMT</Typography>
                                <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                    XMT files are text based files which contain a collection of sets of a given entity type.
                                    The 'X' in XMT stands for the entity that the sets contain
                                    For example, .gmt files are XMT files that contain a collection of gene sets while
                                    .dmt files are XMT files that contain a collection of drug sets.
                                    On each row of the XMT file, the first column contains the Term associated with the set while all other
                                    columns contain the set entities.

                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>C2M2</Typography>
                                <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                    The Crosscut Metadata Model (C2M2) is a collection of files coded in the frictionless data package format.
                                    The collection of files are a zipped set of TSV files containing metadata standardized to a set of known ontologies.
                                    Please explore the C2M2 technical wiki for more information about how to prepare your
                                    metadata into C2M2 compatible files. Please also see the C2M2 section in the <Link href="/info/standards" color='#111827' target='_blank'>Standards and Protocols</Link> page of the
                                    CFDE Workbench portal on how to create C2M2 files.
                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>KG Assertions</Typography>
                                <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                    A knowledge graph is a network that illustrates the relationship between different entities which may come from
                                    different datasets. A knowledge graph consists of three main components: nodes, edges and labels. Nodes are the
                                    entities represented in the knowledge graph e.g GO Ontology terms. Edges characterize the relationship between
                                    nodes e.g. co-expressed with. Knowledge graph assertions are files which contain information about the nodes and
                                    edges that could be used to create a knowledge graph.
                                    For example, a KG Assertions file for nodes would contain columns which define information about each node:
                                    id, label, ontology_label. A KG Assertions file for edges would contain columns that comprises the necessary
                                    information about each edge: its source and target nodes, the labels for these nodes and their relationship.

                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Attribute Table</Typography>
                                <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                    Attribute tables are files containing tables that describe the relationship between two entities with one
                                    entity type on the rows (e.g genes) and another on the columns (e.g tissue types). The intersection of a
                                    given row and column is then a value defining nature of the relationship between the row entity and the
                                    column entity e.g. the qualitative score of similarity between a given gene and a given tissue type.

                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, m: 1, }}>
                                The recommended extensions for each file asset type are:
                                <List sx={{ listStyleType: 'disc', pl: 3 }}>
                                    <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                        C2M2: .zip
                                    </ListItemText>
                                    <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                        KG Assertions: .csv
                                    </ListItemText>
                                    <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                        Attribute Table: .h5 or .hdf5
                                    </ListItemText>
                                    <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                        XMT: .(x)mt e.g .gmt or .dmt
                                    </ListItemText>
                                </List>
                            </Box>
                        </>
                        } />

                        <StyledAccordionComponent heading='Code Asset Types' content={<>
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>ETL</Typography>
                                <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                    Extract, transform, load (ETL) is the process of converting the DCC raw data into various processed data formats such as the C2M2,
                                    XMT, KG assertions, attribute tables, and database tables.The ETL URL should point to the DCC GitHub repo containing the scripts that
                                    process the data by the DCC to generate these processed datasets.
                                    <br></br>Example: <Link color="#111827">LINCS ETL script</Link>
                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>API</Typography>
                                <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                    It is expected that each DCC will have a URL to a page that documents how to access each DCC data and tools via APIs. Moreover, APIs
                                    should be documented in a standard format and the recommended standard is OpenAPI. In addition, it is recommended to deposit these
                                    API into the API repository SmartAPI. <br></br>
                                    <strong>OpenAPI: </strong> The OpenAPI specification provides a formal standard for describing REST APIs. OpenAPI specifications are typically written
                                    in YAML or JSON. <br></br>
                                    <strong>SmartAPI: </strong> This is a community-based repository for depositing APIs documented in the OpenAPI specification. It features
                                    additional metadata elements and value sets to promote the interoperability of RESTful APIs. <br></br>
                                    Learn more about generating an OpenAPI or SmartAPI specification on the <Link href="/info/standards/OpenAPI" color='#111827' target='_blank'>Standards and Protocols</Link> page.
                                    <br></br>Example: <Link href="https://brl-bcm.stoplight.io/docs/exrna-atlas-json-api/ZG9jOjQ1Mg-overview" color="#111827">exRNA openAPI link </Link>
                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Playbook Workflow Builder (PWB) Metanodes</Typography>
                                <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                    A PWB metanode is a workflow engine component  implemented by defining the semantic description, typescript-constrained type,
                                    and functionality of a node in the network of PWB workflows. See Playbook Partnership documentation  and <Link href="/info/standards" color='#111827' target='_blank'>Standards and Protocols</Link> page
                                    for more information about developing and publishing metanodes. The form requires a GitHub link to a script describing a Playbook
                                    metanode.
                                    <br></br>Example: <Link href='https://github.com/nih-cfde/playbook-partnership/blob/eece1eb07365d6255b44708b64606aa42eef5563/components/MW/metabolite_summary/index.tsx' color="#111827" target="_blank"><u>PWB Metanode</u></Link> created by the Metabolomics DCC
                                </Typography>

                            </Box>
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Entity Page Template and Example</Typography>
                                <Markdown className="prose min-w-full p-2" >{entityPageText}</Markdown>
                            </Box>
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Chatbot Specifications</Typography>
                                <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                    Chatbot specifications URL is a link to a manifest file containing metadata and OpenAPI specifications which can be used to develop a chat plugin for large language models. These plugins allow the large language models to function as specialized chatbots that have access to the exposed API endpoints described in the manifest files and can call these APIs based on user input. See ChatGPT plugins documentation for more information on how to develop chatbot specifications.
                                    <br></br>Example: <Link href="https://github.com/openai/plugins-quickstart/blob/3096542ef96b77f93d6b13a0ea105641c3763284/.well-known/ai-plugin.json" color="#111827" target="_blank">ai-plugin specs template</Link>
                                </Typography>

                            </Box>
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Apps URL</Typography>
                                <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                    An Apps URL is a link to a page(s) that serves a listing of bioinformatics tools, workflows, and databases produced by the DCC.
                                    <br></br>Example: <Link color="#111827" href="https://lincsproject.org/LINCS/tools" target="_blank">LINCS Apps URL</Link>
                                </Typography>
                            </Box>

                        </>
                        } />

                        <StyledAccordionComponent heading="Asset Approval Status" content={
                            <>
                                <Box sx={{ p: 1, m: 1, }}>
                                    <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Not Approved</Typography>
                                    <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                        This is the first stage of approval. All assets that are just uploaded or submitted by a DCC uploader will first be placed in this category.
                                        The asset will be tagged by the {' '}
                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                            <FaCircleExclamation />
                                        </span>
                                        {' '} icon on the <Link color="#111827" href="/data/contribute/uploaded">Uploaded Assets</Link> page, icon which represents
                                        that the file was not reviewed by the DCC approver or evaluated by the DRC.
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 1, m: 1, }}>
                                    <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>DCC Approved</Typography>
                                    <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                        When an asset has been approved by a DCC approver (appointed by each DCC), the status of the asset will be updated to
                                        'DCC Approved' which is tagged by the{' '}
                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                            <BsCheckCircleFill />
                                        </span>
                                        {' '}icon under the DCC Status column on the <Link color="#111827" href="/data/contribute/uploaded">Uploaded Assets</Link> page.
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 1, m: 1, }}>
                                    <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>DRC Approved</Typography>
                                    <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                        When an asset has been approved by an appointed DRC approver, the status of the asset will be updated to 'DRC Approved'.
                                        This status is  tagged by the{' '}
                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                            <BsCheckCircleFill />
                                        </span>
                                        {' '}icon under the “DRC Status” column on the <Link color="#111827" href="/data/contribute/uploaded">Uploaded Assets </Link>
                                        page. Please note that DCC and DRC approval status are independent of each other.
                                    </Typography>
                                </Box>
                            </>}
                        />

                        <StyledAccordionComponent heading="Current vs Archived Status" content={
                            <>
                                <Box sx={{ p: 1, m: 1, }}>
                                    <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Current</Typography>
                                    <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                        An asset tagged by the {' '}
                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                            <BsCheckCircleFill />
                                        </span> icon under the 'Current' column on the <Link color="#111827" href="/data/contribute/uploaded">Uploaded Assets</Link> page is considered the current version
                                        of that file type for a given DCC.
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 1, m: 1, }}>
                                    <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Archived</Typography>
                                    <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                        An asset tagged by the  {' '}
                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                            <FaCircleExclamation />
                                        </span>
                                        {' '} icon under the 'Current' column on the <Link color="#111827" href="/data/contribute/uploaded">Uploaded Assets</Link> page,
                                        is considered an archived version of that asset type.
                                        Please note that both DCC and DRC approvers can change the current status of an asset.
                                    </Typography>
                                </Box>
                            </>
                        }
                        />

                        <StyledAccordionComponent heading="User Roles" content={
                            <>
                                <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                    As a Common Fund Data Coordinating Center (DCC) you have 3 role options for your users of the submission system:
                                </Typography>
                                <Box sx={{ p: 1, m: 1, }}>
                                    <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>User</Typography>
                                    <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                        This is a general user of the platform who cannot upload, approve, or view non-public files. You can have as many users in this role as you want.
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 1, m: 1, }}>
                                    <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Uploader</Typography>
                                    <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                        Can submit data packages, but can't approve data packages/files. Users can see files that they submitted for their DCC, but can't approve them.
                                        You can have as many users in this role as you want.
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 1, m: 1, }}>
                                    <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Approver</Typography>
                                    <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                        Can submit new packages and approve a submitted package. You can have as many users in this role as you want.
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 1, m: 1, }}>
                                    <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                        Any given person in your DCC can only have 1 role. To give a member of your DCC Approver or Uploader privileges:
                                        Contact the DRC via email with the following information about the member:
                                    </Typography>
                                    <List sx={{ listStyleType: 'disc', pl: 3 }}>
                                        <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                            Name
                                        </ListItemText>
                                        <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                            Email
                                        </ListItemText>
                                        <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                            Role
                                        </ListItemText>
                                        <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                            DCC
                                        </ListItemText>
                                    </List>
                                    <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                        Please also indicate if the user has already logged into the portal (is a registered user) or has never accessed the portal (is a new user).
                                    </Typography>
                                </Box>
                            </>
                        } />


                        <StyledAccordionComponent heading="Data and Metadata Upload Form" content={
                            <>
                                <Box sx={{ p: 1, m: 1, }}>
                                    <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>File Upload Steps</Typography>
                                    <List sx={{ listStyle: "decimal", pl: 4 }}>
                                        <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                            Go to the <Link href="/data/contribute/form" color="#111827" target="_blank">Data and Metadata Upload Form</Link> OR Click on the “Contribute” option in the navigation bar or in the footer
                                        </ListItem>
                                        <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                            On the Upload Form page, upload your processed data by either dragging and dropping it in the upload box, or clicking in the box or on the "Choose File" button.
                                        </ListItem>
                                        <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                            The file you have selected should appear under “File to Upload”.
                                            If you select a wrong file, you can delete it by clicking on the delete icon next to the file name or by re-uploading the correct file
                                        </ListItem>
                                        <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                            Select the DCC that the files to upload were generated from. Only DCCs that you are affiliated with will be provided as an option in the dropdown menu. If you are affiliated with a DCC and the option is not provided, please contact the DRC to update this information.
                                        </ListItem>
                                        <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                            Select the file asset type that you wish to upload the file as and click on the "Submit Form" button.
                                        </ListItem>
                                        <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                            <strong>Unexpected File type: </strong>There are file extensions that are expected for each file asset type. If the extension of the selected file
                                            does not match one of the expected extensions based on the entered File Asset Type, a dialog box will appear requesting you to confirm your
                                            upload of this unexpected file type. If the unexpected file type is intentional, click on the 'Yes Continue' button to proceed with the upload, otherwise
                                            click 'No' to cancel the upload.
                                            <br></br>
                                            The recommended extensions for each file asset type are:
                                            <List sx={{ listStyleType: 'disc', pl: 3 }}>
                                                <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                                    C2M2: .zip
                                                </ListItemText>
                                                <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                                    KG Assertions: .csv
                                                </ListItemText>
                                                <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                                    Attribute Table: .h5 or .hdf5
                                                </ListItemText>
                                                <ListItemText sx={{ display: 'list-item', padding: 0 }}>
                                                    XMT: .(x)mt e.g .gmt or .dmt
                                                </ListItemText>
                                            </List>

                                        </ListItem>
                                        <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                            If an upload is successful, a green banner with “Success! File Uploaded” should appear.
                                            If an upload is unsuccessful, a red banner with an error message will appear with the reason for the upload error.
                                            Ensure that all the files you have selected for upload files are either .csv, .txt, .zip or .(x)mt files and are not larger than 5GB.
                                        </ListItem>
                                        <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                            Details of your uploaded file should appear on the <Link href="data/contribute/uploaded" color="#111827" target="_blank">Uploaded Assets</Link> page.
                                        </ListItem>
                                    </List>
                                </Box>
                                <Box sx={{ p: 1, m: 1, }}>
                                    <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>File Integrity Validation</Typography>
                                    <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                                        A checksum is a digital fingerprint that can be made from a sequence of bytes, otherwise known as a bitstream e.g. the contents of a file.
                                        Just like a fingerprint, a checksum is unique to the bitstream. Any change to the bitstream, however big or small, will cause the value of
                                        its checksum to change completely. Checksums can be used to detect changes in the contents of a file which occur during file upload and
                                        download. During file submission on the site, file integrity is verified using the SHA256 checksum algorithm. A checksum is calculated
                                        from the file a user upload browser-side and compared to the checksum calculated from the file received by the AWS S3 bucket. If these
                                        checksum values are the same, which shows that the file was unchanged/uncorrupted during upload, the file upload is successful. Otherwise,
                                        if the values are different, the system will throw an error.
                                    </Typography>
                                    <List sx={{ listStyle: "decimal", pl: 4 }}>
                                        <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                            The checksum of a successfully uploaded file is displayed on the <Link href="/data/contribute/uploaded" target="_blank" color="#111827">Uploaded Assets</Link> page under the File Info dropdown of each file.
                                        </ListItem>
                                        <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                            To verify file integrity after downloading a file from the portal:
                                        </ListItem>
                                        <List sx={{ listStyle: "disc", pl: 4 }}>
                                            <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                                Download the intended file
                                            </ListItem>
                                            <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                                Calculate the checksum in your terminal:
                                                <br></br>
                                                For Windows: <Markdown className="prose">{windowsMarkdown}</Markdown>
                                                <br></br>
                                                For Linux: <Markdown className="prose">{linuxMarkdown}</Markdown>
                                                <br></br>
                                                For MacOS: <Markdown className="prose">{macMarkdown}</Markdown>
                                            </ListItem>
                                            <ListItem sx={{ display: "list-item", color: "#374151" }}>
                                                If the string that is returned is the same as that displayed for the file on the portal, then the file contents have not been changed during download
                                            </ListItem>
                                        </List>

                                    </List>
                                </Box>


                            </>
                        }
                        />

                        <StyledAccordionComponent heading="Code Assets Upload Form" content={
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Code Asset Submission Steps</Typography>

                                <Markdown className="prose min-w-full">{codeAssetSubmission}</Markdown>

                            </Box>
                        }
                        />


                        <StyledAccordionComponent heading="Asset Approval Steps" content={
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography color={'#FF0000'} style={{ fontStyle: 'bold', textAlign: 'center' }} sx={{ padding: 1 }}>This section is for DCC and DRC Approvers Only</Typography>
                                <Markdown className="prose min-w-full">{assetApproval}</Markdown>

                            </Box>
                        }
                        />


                        <StyledAccordionComponent heading="Delete File or Code Assets" content={
                            <Box sx={{ p: 1, m: 1, }}>
                                <Markdown className="prose min-w-full" >{deleteUsers}</Markdown>
                            </Box>

                        }
                        />

                        <StyledAccordionComponent heading="Admin User Documentation" content={
                            <Box sx={{ p: 1, m: 1, }}>
                                <Typography color={'#FF0000'} style={{ fontStyle: 'bold', textAlign: 'center' }} sx={{ padding: 1 }}>This section is for Admin Users Only</Typography>
                                <Markdown className="prose min-w-full">{adminUsers}</Markdown>
                            </Box>
                        }
                        />

                        <StyledAccordionComponent heading="Instructional Video" content={
                            <Box sx={{padding: 3}}>
                                <center>
                                <YoutubeVideo />
                                </center>
                            </Box>
                        }
                        />
                    </Grid>
                </Container >
            </Grid>
        </Grid>

    );
}
