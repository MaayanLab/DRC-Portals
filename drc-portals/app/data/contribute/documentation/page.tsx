import React from 'react'
import { BsCheckCircleFill } from "react-icons/bs";
import { FaCircleExclamation } from "react-icons/fa6";
import Image from 'next/image'
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ScrollToAnchorLink from '@/components/misc/ScrollToAnchorLink';
import ListItemCollapsible from '@/components/misc/ListItemCollapsible';
import ThemedBox from './ThemedBox';
import { List, ListItem, Typography, Link } from '@mui/material';
import createuser from '@/public/img/contributions/createuser.png'
import createuser2 from '@/public/img/contributions/createuser2.png'
import createuser3 from '@/public/img/contributions/createuser3.png'
import updateuser1 from '@/public/img/contributions/updateuser1.png'
import updateuser2 from '@/public/img/contributions/updateuser2.png'
import deleteuser1 from '@/public/img/contributions/deleteuser1.png'
import fileapproval1 from '@/public/img/contributions/fileapproval1.png'
import fileapproval2 from '@/public/img/contributions/fileapproval2.png'
import fileapproval3 from '@/public/img/contributions/fileapproval3.png'
import fileapproval4 from '@/public/img/contributions/fileapproval4.png'
import fileapproval5 from '@/public/img/contributions/fileapproval5.png'
import fileapproval6 from '@/public/img/contributions/fileapproval6.png'
import fileapproval7 from '@/public/img/contributions/setCurrent.png'
import fileupload2 from '@/public/img/contributions/fileupload2.png'
import fileupload3 from '@/public/img/contributions/fileupload3.png'
import fileupload4 from '@/public/img/contributions/fileupload4.png'
import fileupload5 from '@/public/img/contributions/fileupload5.png'
import fileupload6 from '@/public/img/contributions/fileupload6.png'
import fileupload7 from '@/public/img/contributions/fileupload7.png'
import fileupload8 from '@/public/img/contributions/fileupload8.png'
import fileupload9 from '@/public/img/contributions/fileupload9.png'
import fileupload10 from '@/public/img/contributions/fileupload10.png'
import fileuploaderror from '@/public/img/contributions/fileuploaderror.png'
import Nav from '../Nav';


const createUser = <Image src={createuser} width='600' height='500' alt='' className="d-inline-block align-top" />;
const createUser2 = <Image src={createuser2} width='500' height='400' alt='' className="d-inline-block align-top" />;
const createUser3 = <Image src={createuser3} width='500' height='400' alt='' className="d-inline-block align-top" />;
const updateUser1 = <Image src={updateuser1} width='500' height='400' alt='' className="d-inline-block align-top" />;
const updateUser2 = <Image src={updateuser2} width='500' height='400' alt='' className="d-inline-block align-top" />;
const deleteUser1 = <Image src={deleteuser1} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileApproval1 = <Image src={fileapproval1} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileApproval2 = <Image src={fileapproval2} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileApproval3 = <Image src={fileapproval3} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileApproval4 = <Image src={fileapproval4} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileApproval5 = <Image src={fileapproval5} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileApproval6 = <Image src={fileapproval6} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileApproval7 = <Image src={fileapproval7} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileUpload2 = <Image src={fileupload2} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileUpload3 = <Image src={fileupload3} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileUpload4 = <Image src={fileupload4} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileUpload5 = <Image src={fileupload5} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileUpload6 = <Image src={fileupload6} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileUpload7 = <Image src={fileupload7} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileUpload8 = <Image src={fileupload8} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileUpload9 = <Image src={fileupload9} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileUpload10 = <Image src={fileupload10} width='500' height='400' alt='' className="d-inline-block align-top" />;
const fileUploadError = <Image src={fileuploaderror} width='500' height='400' alt='' className="d-inline-block align-top" />;


export default function Documentation() {

    return (
        <>
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid md={2} xs={12}>
                    <Nav />
                </Grid>
                <Grid md={10} xs={12}>
                    <Container className="justify-content-center">
                        <Typography variant="h3" color="secondary.dark" className='p-5'>DOCUMENTATION</Typography>
                        <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                            This page covers the submission system of the Data Resource Portal. Please click on any section
                            from the dropdown list below to navigate to that section.
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid md={10} xs={12}>
                                <div>
                                    <Box sx={{ display: 'grid', gridAutoRows: 'repeat(3, 1fr)' }}>
                                        <ThemedBox>
                                            <Box gridTemplateRows={'repeat(5, 1fr)'}>
                                                <h4 className='text-center'>File Types</h4>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border bg-light p-1 " id="xmt">XMT</h6>
                                                    <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                        XMT files are text based files which contain a collection of sets of a given entity type.
                                                        The 'X' in XMT stands for the entity that the sets contain
                                                        For example, .gmt files are XMT files that contain a collection of gene sets while
                                                        .dmt files are XMT files that contain a collection of drug sets.
                                                        On each row of the XMT file, the first column contains the Term associated with the set while all other
                                                        columns contain the set entities.
                                                        All uploaded files with a .gmt or .dmt extension are tagged as XMT files by default.
                                                    </p>
                                                </ThemedBox>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="c2m2">C2M2</h6>
                                                    <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                        Crosscut Metadata Model (C2M2) files are a (zipped) set of TSV files containing metadata that is already standardized to a set of known ontologies. Please explore the {' '}
                                                        <Link color="secondary" href="https://docs.nih-cfde.org/en/latest/c2m2/draft-C2M2_specification/#c2m2-technical-specification">
                                                            CFDE C2M2 documentation</Link> and <Link color="secondary" href="https://github.com/nih-cfde/published-documentation/wiki">C2M2 techincal wiki</Link> {' '}
                                                        for more information about C2M2 files. Please also see the C2M2 section in the Standards and Protocols page on how to create C2M2 files. All uploaded zipped files are tagged as C2M2 files by default.
                                                    </p>
                                                </ThemedBox>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="kg-assertions">KG Assertions</h6>
                                                    <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                        A knowledge graph is a network that illustrates the relationship between different entities which may
                                                        come from different datasets. A knowledge graph consists of three main components: nodes, edges and labels.
                                                        Nodes are the entities represented in the knowledge graph eg genes, GO Ontology terms, etc and the edges
                                                        characterize the relationship between nodes eg co-expressed with. Knowledge graph assertions are files which
                                                        contain information about the nodes and edges that could be used to create a knowledge graph. For example,
                                                        a KG Assertion file for Nodes would contain columns id,label,ontology_label which define information about
                                                        each node. A KG Assertion file for Edges would contain columns source,relation,target,source_label,
                                                        target_label,resource which display the necessary information about each edge (its source and target
                                                        nodes, the labels for these nodes). All uploaded files with .csv extensions are tagged as KG Assertion files by default.

                                                    </p>
                                                </ThemedBox>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="attribute-table">Attribute Table</h6>
                                                    <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                        Attribute tables are files containing tables that describe the relationship between two entities with
                                                        one entity type on the rows (e.g genes) and another on the columns (e.g tissue types). The intersection
                                                        of a given row and column is then a value defining nature of the relationship between the row entity and
                                                        the column entity e.g. the similarity between a given gene and a given tissue type. All uploaded files with .txt
                                                        extensions are tagged as Attribute Table files by default.

                                                    </p>
                                                </ThemedBox>
                                            </Box>
                                        </ThemedBox>
                                        <ThemedBox>
                                            <Box gridAutoRows={'repeat(4, 1fr)'}>
                                                <h4 className='text-center'> File Approval Status</h4>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border text-left bg-light p-1" id="uploaded">Uploaded (Not Approved)</h6>
                                                    <Typography sx={{ textAlign: 'left', fontWeight: 'lighter', fontSize: 14 }} className="p-2">
                                                        The Uploaded (Not Approved) stage is the first stage of approval. All files that are just uploaded
                                                        by a designated DCC uploader will first be placed in this category.  The file will be visible by will be tagged by the {' '}
                                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                            <FaCircleExclamation />
                                                        </span>
                                                        {' '} icon on the <Link color="secondary" href="/data/contribute/uploaded">Uploaded Files</Link> page, icon which represents
                                                        that the file was not reviewed by the DCC approver or evaluated by the DRC.
                                                    </Typography>
                                                </ThemedBox>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="dcc-approved">DCC Approved</h6>
                                                    <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                        When an uploaded file has been approved by the corresponding DCC approver (appointed by each DCC),
                                                        the status of the file will be updated to become 'DCC Approved' which is tagged by the {' '}
                                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}><BsCheckCircleFill /> </span> {' '} icon under the DCC Status column
                                                        on the <Link color="secondary" href="/data/contribute/uploaded">Uploaded Files</Link> page.
                                                    </p>
                                                </ThemedBox>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="drc-approved">DRC Approved</h6>
                                                    <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                        When an uploaded file has been approved by an appointed DRC approver, the status of the file will be updated to 'DRC Approved'.
                                                        This status is  tagged by the
                                                        {' '}
                                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                            <BsCheckCircleFill /> </span> {' '} icon under the “DCC Status” column on the <Link color="secondary" href="/data/contribute/uploaded">Uploaded Files</Link> page.
                                                        Please note that DCC and DRC approval status are independent of each other.
                                                    </p>
                                                </ThemedBox>
                                            </Box>
                                        </ThemedBox>
                                        <ThemedBox>
                                            <Box gridAutoRows={'repeat(4, 1fr)'}>
                                                <h4 className='text-center'> File Current Status</h4>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border text-left bg-light p-1" id="current">Current</h6>
                                                    <Typography sx={{ textAlign: 'left', fontWeight: 'lighter', fontSize: 14 }} className="p-2">
                                                        A file tagged by the {' '}
                                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}><BsCheckCircleFill /> </span>
                                                        {' '} icon under the 'Current' column on the <Link color="secondary" href="/data/contribute/uploaded">Uploaded Files</Link> page is considered the current version of
                                                        that file type for a given DCC. DCC and DRC approvers both have the right to change the current/archived status of a file.
                                                    </Typography>
                                                </ThemedBox>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="archived">Archived</h6>
                                                    <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                        A file tagged by the {' '}
                                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                            <FaCircleExclamation />
                                                        </span>
                                                        {' '} icon under the 'Current' column
                                                        on the <Link color="secondary" href="/data/contribute/uploaded">Uploaded Files</Link> page, is considered an archived version of that filetype.
                                                    </p>
                                                </ThemedBox>
                                            </Box>
                                        </ThemedBox>
                                        <ThemedBox>
                                            <Box gridAutoRows={'repeat(4, 1fr)'}>
                                                <h4 className='text-center'> User Roles for File Submission System</h4>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border text-left bg-light p-1" id="users">Users</h6>
                                                    <Typography sx={{ textAlign: 'left', fontWeight: 'lighter', fontSize: 14 }} className="p-2">
                                                        This is a general user of the platform who cannot upload, approve, or view non-public files.
                                                        You can have as many users in this role as you want.
                                                    </Typography>
                                                </ThemedBox>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="uploaders">Uploaders</h6>
                                                    <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                        Can submit data packages, but can't approve data packages/files. Users can see files that they submitted for their DCC,
                                                        but can't approve them. You can have as many users in this role as you want
                                                    </p>
                                                </ThemedBox>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="approvers">Approvers</h6>
                                                    <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                        Can approve a submitted package, but can't submit new packages. You can have as many users in this role as you want.
                                                    </p>
                                                </ThemedBox>
                                            </Box>
                                        </ThemedBox>
                                        <ThemedBox>
                                            <Box gridTemplateRows={'repeat(1, 1fr)'}>
                                                <h4 className='text-center'> File Upload Steps</h4>
                                                <ThemedBox>
                                                    <List sx={{ listStyle: "decimal", pl: 4 }}>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            <Typography sx={{ textAlign: 'left', fontWeight: 'lighter', fontSize: 14 }} className="p-2">
                                                                Go to the :  <Link color="secondary" href="/data/contribute/form">Upload Form</Link>  page and click "Log In"
                                                                (top right corner) OR Click on the “Contribute” option in the navigation bar or in the footer:
                                                                {fileApproval1}
                                                            </Typography>
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            <Typography sx={{ textAlign: 'left', fontWeight: 'lighter', fontSize: 14 }} className="p-2">
                                                                Before uploading, ensure that all your account information has been entered is
                                                                accurate on the: <Link color="secondary" href="/data/contribute/account">My Account page</Link>
                                                                {fileUpload2}
                                                            </Typography>
                                                            <List sx={{ listStyleType: 'disc', pl: 2, }}>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    If your email is missing, please fill it out and click "Save Changes"
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    If DCC information is missing, please contact the the DRC to update your DCC information
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    If Role is inaccurate, please contact the DRC to update your information.
                                                                </ListItem>
                                                            </List>
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            On the Upload Form page, upload your data and metadata files by either dragging and dropping them in the upload box, or clicking in the box or on the "Choose Files” button.
                                                            {fileUpload3}
                                                            The files you have selected should appear under “File to Upload”
                                                            {fileUpload4}
                                                            <List sx={{ listStyleType: 'disc', pl: 2, }}>
                                                                <ListItem sx={{ display: 'list-item' }}>
                                                                    If you select a wrong file, you can delete it by clicking on the delete icon next to the file name
                                                                    {fileUpload5}
                                                                </ListItem>
                                                            </List>
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            Select the DCC that the files to upload were generated from. By default, only DCCs that you are affiliated
                                                            with will be provided as an option in the dropdown menu. If you are affiliated with a DCC and the option
                                                            is not provided, please contact the DRC to update this information
                                                            {fileUpload6}
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            After clicking on the “Submit Form” button:
                                                            <List sx={{ listStyleType: 'disc', pl: 2, }}>
                                                                <ListItem sx={{ display: 'list-item' }}>
                                                                    If an upload is successful, a green banner with “Success! File Uploaded” should appear.
                                                                    {fileUpload7}
                                                                    {fileUpload8}
                                                                </ListItem>
                                                                <ListItem sx={{ display: 'list-item' }}>
                                                                    If an upload is unsuccessful, a red banner with an error message will appear. If the message is: “Error! Please make sure files
                                                                    are either .csv, .txt, .zip or .dmt or .gmt” will appear. Ensure that all the files you have
                                                                    selected for upload have one of those extensions. Otherwise please try again.
                                                                    {fileUploadError}
                                                                </ListItem>
                                                            </List>
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            Details of your uploaded file should appear on the <Link color="secondary" href="/data/contribute/uploaded">Uploaded Files</Link> page.
                                                            <List sx={{ listStyleType: 'disc', pl: 2, }}>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    To inspect the contents of your uploaded file, click on the Collapse icon on the desired row to view the File Info.
                                                                    {fileUpload9}
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    To download the given file locally, click on the link for the given File. See also the Checksum section on how to validate file integrity after download.
                                                                    {fileUpload10}
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    File status information for each file is also on the <Link color="secondary" href="/data/contribute/uploaded">Uploaded Files</Link> page.
                                                                    Please look at the “File Approval Stages” section for more information on approval stages.                                                    </ListItem>
                                                            </List>
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'bold' }}>
                                                            Troubleshooting:
                                                            <List sx={{ listStyleType: 'disc', pl: 2, }}>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    If you are to be an Uploader for your DCC and have “Access Denied” on the Form and Uploaded pages, please contact the DRC through email to grant you access.
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    If you do not have any DCCs. associated with your account, please contact the DRC to update your information
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    If a DCC that you are affiliated with (and you are an uploader for) is not listed as one of your DCC options, please contact the DRC through email to grant you access.
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    File status information for each file is also on the <Link color="secondary" href="/data/contribute/uploaded">Uploaded Files</Link> page.
                                                                    Please look at the “File Approval Stages” section for more information on approval stages.                                                    </ListItem>
                                                            </List>
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'bold' }}>
                                                            Checksum:
                                                            <List sx={{ listStyleType: 'disc', pl: 2, }}>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    A checksum is a digital fingerprint that can be made from a sequence of bytes, otherwise known as a bitstream e.g. the contents of a file. Just like a fingerprint,
                                                                    a checksum is unique to the bitstream. Any change to the bitstream, however big or small, will cause the value of its checksum to change completely. Checksums
                                                                    can be used to detect changes in the contents of a file which occur during file upload and download. During file submission on the site, file integrity
                                                                    is verified using the SHA256 checksum algorithm. A checksum is calculated from the file a user upload browser-side and compared to the checksum calculated
                                                                    from the file received by the AWS S3 bucket. If these checksum values are the same, which shows that the file was unchanged/uncorrupted during upload, the file
                                                                    upload is successful. If the values are different, the system will throw an Error.
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    The checksum of a successfully uploaded file is displayed on the Uploaded Files page.
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    To use a file checksum to verify file integrity after downloading a file from the portal:
                                                                    <List sx={{ listStyleType: 'lower-alpha', pl: 2, }}>
                                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                            Download the intended file
                                                                        </ListItem>
                                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                            Calculate the checksum in your terminal using the shasum -a "filepath" command
                                                                        </ListItem>
                                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                            Copy the hash value returned, go to <Link color="secondary" href="https://base64.guru/converter/encode/hex">Hex to base64 coverter</Link>  and paste in the hex field
                                                                        </ListItem>
                                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                            Click on the  "Convert Hex to Base64" button
                                                                        </ListItem>
                                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                            If the string that is returned is the same as that displayed for the file on the portal,
                                                                            then the file contents have not been changes during download
                                                                        </ListItem>
                                                                    </List>
                                                                </ListItem>
                                                            </List>
                                                        </ListItem>
                                                    </List>
                                                </ThemedBox>
                                            </Box>
                                        </ThemedBox>
                                        <ThemedBox>
                                            <Box gridTemplateRows={'repeat(1, 1fr)'}>
                                                <h4 className='text-center'> File Approval Steps</h4>
                                                <ThemedBox>
                                                    <List sx={{ listStyle: "decimal", pl: 4 }}>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            <Typography sx={{ textAlign: 'left', fontWeight: 'lighter', fontSize: 14 }}>
                                                                Go to the <Link color="secondary" href="/data/contribute/uploaded">Uploaded Files</Link> page
                                                                and click "Log In" (top right corner) OR Click on the “Contribute” option in the navigation bar or in the footer and on the "Uploaded Files" tab
                                                                {fileApproval1}
                                                            </Typography>
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            <Typography sx={{ textAlign: 'left', fontWeight: 'lighter', fontSize: 14 }}>
                                                                Before approving, ensure that all your account information has been entered/is
                                                                accurate on the :<Link color="secondary" href="/data/contribute/account">My Account</Link> page
                                                                {fileApproval2}
                                                            </Typography>
                                                            <List sx={{ listStyleType: 'disc', pl: 2, }}>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    If your email is missing, please fill it out and click "Save Changes"
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    For DCC Approvers, if DCC information is missing, please contact the DRC to update your DCC information.
                                                                </ListItem>
                                                            </List>
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            Go to the <Link color="secondary" href="/data/contribute/uploaded">Uploaded Files</Link> page. Here you will find all uploaded
                                                            files that fall under your jurisdiction. For DCC Approvers, these are all files that have been uploaded for your DCC. For DRC Approvers,
                                                            these are all files that have been uploaded by uploaders across all DCCs.
                                                            {fileApproval3}
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            All unapproved files that you are authorized to approve will be marked by the “Approve Upload” button under the DCC status or
                                                            DRC status columns for DCC and DRC Approvers respectively.
                                                            {fileApproval4}
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            To inspect the content of an uploaded file, click on the link in the File Info. This will download the given file locally.
                                                            {fileApproval5}
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            To approve a given uploaded file, click on the “Approve Upload” button to approve the file.
                                                            {fileApproval3}
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            To remove the approved status of a file, click on the button. This reverses the Approval action.
                                                            {fileApproval6}
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            Similar steps are done to set a file as the most current version. Click the 'Set as Current' button to set a file as
                                                            the current version of a file type for a given DCC. Click the checkmark under the 'Current' column of the older version of the file to remove the 'Current' status.
                                                            DCC and DRC approvers are authorized to change the current status of files for affiliated DCCs/all DCCs respectively.
                                                            {fileApproval7}
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'bold' }}>
                                                            Troubleshooting:
                                                            <List sx={{ listStyleType: 'disc', pl: 2, }}>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    If you are to be a DCC or DRC Approver and have “Access Denied” on and Uploaded pages, please contact the DRC through email to change your role and grant you access.
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    If a DCC that you are affiliated with (and you are an uploader for) is not listed as one of your DCC options on the Accounts page, please contact the DRC through email to update your information.You will not be allowed to approve uploaded files for this DCC otherwise.
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    At the moment, files cannot be deleted after they have been uploaded. If it comes to your attention that a mistake has been made in an upload, simply do not approve the file.
                                                                </ListItem>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    DCC Approvers do not have access to the <Link color="secondary" href="/data/contribute/form">Data and Metadata Upload Form</Link>  page. This page is only available to DCC Uploaders and DRC Approvers.
                                                                </ListItem>
                                                            </List>
                                                        </ListItem>
                                                    </List>
                                                </ThemedBox>
                                            </Box>
                                        </ThemedBox>
                                        <ThemedBox>
                                            <Box gridAutoRows={'repeat(4, 1fr)'}>
                                                <h4 className='text-center'> Admin User Documentation</h4>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border text-left bg-light p-1" id="create">Create a User</h6>
                                                    <List sx={{ listStyle: "decimal", pl: 4 }}>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            Go to the <Link color="secondary" href="/data/contribute/admin">Admin page</Link> and click on the "Create New User" button,
                                                            {createUser}
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            Fill out the new user's information and click the “Create User” button. All fields are required. {createUser2} If successful, an alert with “User Creation Successful” should appear.
                                                            {createUser3}

                                                        </ListItem>
                                                    </List>
                                                </ThemedBox>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="update">Update User Information</h6>
                                                    <List sx={{ listStyle: "decimal", pl: 4 }}>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            Go to the <Link color="secondary" href="/data/contribute/admin">Admin page</Link> and select the users whose information is to be updated.
                                                            {updateUser1}
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            In the dialog box that appears, for each user, select their new role and DCC information and click “Update”.
                                                            An alert with “User Information Updated” will appear if the update operation is successful.
                                                            {updateUser2}
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            When all selected users' information have been updated, click on “Done” or outside the dialog box
                                                        </ListItem>
                                                    </List>
                                                </ThemedBox>
                                                <ThemedBox>
                                                    <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="delete">Delete Users</h6>
                                                    <List sx={{ listStyle: "decimal", pl: 4 }}>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            Go to the <Link color="secondary" href="/data/contribute/admin">Admin page</Link> and select the users to delete.
                                                        </ListItem>
                                                        <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                            Click on the  “Delete Users” button to delete selected users
                                                            {deleteUser1}
                                                            <List sx={{ listStyleType: 'disc', pl: 2, }}>
                                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                                    Please note that the delete operation is irreversible.
                                                                </ListItem>
                                                            </List>
                                                        </ListItem>
                                                    </List>
                                                </ThemedBox>
                                            </Box>
                                        </ThemedBox>
                                    </Box>
                                </div>
                            </Grid>
                            <Grid md={2} xs={12}>
                                <ThemedBox>
                                    <List
                                        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                                        component="nav"
                                        aria-labelledby="nested-list-subheader"
                                        subheader={
                                            <ListSubheader component="div" id="nested-list-subheader">
                                                Documentation
                                            </ListSubheader>
                                        }
                                    >
                                        <ListItemCollapsible primary="File Types" defaultOpen={false}>
                                            <List component="div" disablePadding>
                                                <ListItemButton sx={{ pl: 4 }} href="#xmt" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="XMT" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                                <ListItemButton sx={{ pl: 4 }} href="#c2m2" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="C2M2" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                                <ListItemButton sx={{ pl: 4 }} href="#kg-assertions" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="KG Assertions" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                                <ListItemButton sx={{ pl: 4 }} href="#attribute-table" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="Attribute Table" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                            </List>
                                        </ListItemCollapsible>
                                        <ListItemCollapsible primary="File Approval Status" defaultOpen={false}>
                                            <List component="div" disablePadding>
                                                <ListItemButton sx={{ pl: 4 }} href="#uploaded" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="Uploaded (Not Approved)" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                                <ListItemButton sx={{ pl: 4 }} href="#dcc-approved" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="DCC Approved" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                                <ListItemButton sx={{ pl: 4 }} href="#drc-approved" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="DRC Approved" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                            </List>
                                        </ListItemCollapsible>
                                        <ListItemCollapsible primary="File Current Status" defaultOpen={false}>
                                            <List component="div" disablePadding>
                                                <ListItemButton sx={{ pl: 4 }} href="#current" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="Current" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                                <ListItemButton sx={{ pl: 4 }} href="#archived" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="Archived" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                            </List>
                                        </ListItemCollapsible>
                                        <ListItemCollapsible primary="User Roles" defaultOpen={false}>
                                            <List component="div" disablePadding>
                                                <ListItemButton sx={{ pl: 4 }} href="#users" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="Users" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                                <ListItemButton sx={{ pl: 4 }} href="#uploaders" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="Uploaders" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                                <ListItemButton sx={{ pl: 4 }} href="#approvers" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="Approvers" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                            </List>
                                        </ListItemCollapsible>
                                        <ListItemButton>
                                            <ListItemText primary="File Upload Steps" primaryTypographyProps={{ fontSize: '16px' }} />
                                        </ListItemButton>
                                        <ListItemButton>
                                            <ListItemText primary="File Approval Steps" primaryTypographyProps={{ fontSize: '16px' }} />
                                        </ListItemButton>
                                        <ListItemCollapsible primary="Admin User Documentation" defaultOpen={false}>
                                            <List component="div" disablePadding>
                                                <ListItemButton sx={{ pl: 4 }} href="#create" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="Create a User" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                                <ListItemButton sx={{ pl: 4 }} href="#update" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="Update User Information" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                                <ListItemButton sx={{ pl: 4 }} href="#delete" LinkComponent={ScrollToAnchorLink}>
                                                    <ListItemText primary="Delete Users" primaryTypographyProps={{ fontSize: '15px' }} />
                                                </ListItemButton>
                                            </List>
                                        </ListItemCollapsible>
                                    </List>
                                </ThemedBox>
                            </Grid>
                        </Grid >
                    </Container >
                </Grid>
            </Grid>
        </>

    );
}
