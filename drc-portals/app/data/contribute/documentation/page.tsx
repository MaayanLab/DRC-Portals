import React from 'react'
import { BsCheckCircleFill, BsCheckCircle } from "react-icons/bs";
import { ImNotification } from "react-icons/im";
import submitImage from '@/public/img/contributions/submit_button.png'
import newUploadImage from '@/public/img/contributions/example_approve2.png'
import approveBtnImage from '@/public/img/contributions/approve_btn.png'
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
import { List, ListItem, Typography } from '@mui/material';
import Link from 'next/link';

const exampleSubmit = <Image src={submitImage} width='100' height='40' alt='' className="d-inline-block align-top" />;
const exampleNewUpload = <Image src={newUploadImage} width='900' height='200' alt='' className="d-inline-block align-top" />;
const exampleApproveBtn = <Image src={approveBtnImage} width='130' height='40' alt='' className="d-inline-block align-top" />;

export default function Documentation() {

    return (
        <>
            <Container className="mt-10 justify-content-center">
                <Grid container spacing={2}>
                    <Grid xs={2}>
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
                                <ListItemCollapsible primary="File Types">
                                    <List component="div" disablePadding>
                                        <ListItemButton sx={{ pl: 4 }} href="#xmt" LinkComponent={ScrollToAnchorLink}>
                                            <ListItemText primary="XMT" />
                                        </ListItemButton>
                                        <ListItemButton sx={{ pl: 4 }} href="#c2m2" LinkComponent={ScrollToAnchorLink}>
                                            <ListItemText primary="C2M2" />
                                        </ListItemButton>
                                        <ListItemButton sx={{ pl: 4 }} href="#kg-assertions" LinkComponent={ScrollToAnchorLink}>
                                            <ListItemText primary="KG Assertions" />
                                        </ListItemButton>
                                        <ListItemButton sx={{ pl: 4 }} href="#attribute-table" LinkComponent={ScrollToAnchorLink}>
                                            <ListItemText primary="Attribute Table" />
                                        </ListItemButton>
                                    </List>
                                </ListItemCollapsible>
                                <ListItemCollapsible primary="File Approval Stages">
                                    <List component="div" disablePadding>
                                        <ListItemButton sx={{ pl: 4 }} href="#uploaded" LinkComponent={ScrollToAnchorLink}>
                                            <ListItemText primary="Uploaded (Not Approved)" />
                                        </ListItemButton>
                                        <ListItemButton sx={{ pl: 4 }} href="#dcc-approved" LinkComponent={ScrollToAnchorLink}>
                                            <ListItemText primary="DCC Approved" />
                                        </ListItemButton>
                                        <ListItemButton sx={{ pl: 4 }} href="#drc-approved" LinkComponent={ScrollToAnchorLink}>
                                            <ListItemText primary="DRC Approved" />
                                        </ListItemButton>
                                    </List>
                                </ListItemCollapsible>
                                <ListItemButton>
                                    <ListItemText primary="File Upload Steps" />
                                </ListItemButton>
                                <ListItemButton>
                                    <ListItemText primary="File Approval Steps" />
                                </ListItemButton>
                            </List>
                        </ThemedBox>
                    </Grid>
                    <Grid xs={10}>
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
                                            </p>
                                        </ThemedBox>
                                        <ThemedBox>
                                            <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="c2m2">C2M2</h6>
                                            <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                Crosscut Metadata Model (C2M2) files are a (zipped) set of TSV files containing metadata that is already standardized to a set of known ontologies. Please explore the {' '}
                                                <Link href="https://docs.nih-cfde.org/en/latest/c2m2/draft-C2M2_specification/#c2m2-technical-specification">
                                                    CFDE C2M2 documentation</Link> and <Link href="https://github.com/nih-cfde/published-documentation/wiki">C2M2 techincal wiki</Link> {' '}
                                                for more information about C2M2 files.
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
                                                nodes, the labels for these nodes).
                                            </p>
                                        </ThemedBox>
                                        <ThemedBox>
                                            <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="attribute-table">Attribute Table</h6>
                                            <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                Attribute tables are files containing tables that describe the relationship between two entities with
                                                one entity type on the rows (e.g genes) and another on the columns (e.g tissue types). The intersection
                                                of a given row and column is then a value defining nature of the relationship between the row entity and
                                                the column entity e.g. the similarity between a given gene and a given tissue type.

                                            </p>
                                        </ThemedBox>
                                    </Box>
                                </ThemedBox>
                                <ThemedBox>
                                    <Box gridAutoRows={'repeat(4, 1fr)'}>
                                        <h4 className='text-center'> File Approval Stages</h4>
                                        <ThemedBox>
                                            <h6 style={{ textAlign: 'left' }} className="border text-left bg-light p-1" id="uploaded">Uploaded (Not Approved)</h6>
                                            <Typography sx={{ textAlign: 'left', fontWeight: 'lighter', fontSize: 14 }} className="p-2">
                                                Files that are just uploaded will first be placed in the first stage of approval which means
                                                that they have not yet received DCC or DRC approval. Files in this category are identified with the {' '}
                                                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                    <ImNotification />
                                                </span>
                                                {' '} icon on the <Link href="/data/contribute/form">Uploaded Files</Link> page.
                                            </Typography>
                                        </ThemedBox>
                                        <ThemedBox>
                                            <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="dcc-approved">DCC Approved</h6>
                                            <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                When an uploaded file has been approved by the corresponding DCC approver, the status of the file will
                                                be updated to 'DCC Approved' which is delineated by the {' '}
                                                <span style={{ display: 'inline-flex', alignItems: 'center' }}><BsCheckCircle /> </span> {' '} icon on the <Link href="/data/contribute/form">Uploaded Files</Link> page.
                                            </p>
                                        </ThemedBox>
                                        <ThemedBox>
                                            <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="drc-approved">DRC Approved</h6>
                                            <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                When an uploaded file has been approved by a member of the DRC, the status of the file will
                                                be updated to 'DRC Approved' which is the final stage of File Approval. This status is delineated by the
                                                {' '}
                                                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                    <BsCheckCircleFill /> </span> {' '} icon on the <Link href="/data/contribute/form">Uploaded Files</Link> page.
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
                                                        On the <Link href="/data/contribute/form">DRC Form</Link> page, upload a zipped file containing your
                                                        data/metadata file and a manifest.json detailing the information of each file. Please find an example manifest here: manifest.json.
                                                        No extra fields excluding what is detailed in the stencil should be added. Please note that only text based file types are allowed.
                                                    </Typography>
                                                </ListItem>
                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                    <Typography sx={{ textAlign: 'left', fontWeight: 'lighter', fontSize: 14 }} className="p-2">
                                                        After clicking on the <span style={{ display: 'inline-flex', alignItems: 'center' }}> {exampleSubmit}  </span> button, details of your uploaded file should appear on the
                                                        <Link href="/data/contribute/form"> Uploaded Files</Link> page. You can inspect your uploaded file by clicking
                                                        on the link under the 'Uploaded file' column
                                                        {exampleNewUpload}
                                                    </Typography>
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
                                                    <Typography sx={{ textAlign: 'left', fontWeight: 'lighter', fontSize: 14 }} className="p-2">
                                                        Go to the <Link href="/data/contribute/uploaded">Uploaded Files</Link> page. Here you will find
                                                        all uploaded files that fall under your jurisdiction. You can further inspect an uploaded file
                                                        by clicking on the link under the 'Uploaded file' column.
                                                    </Typography>
                                                </ListItem>
                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                    <Typography sx={{ textAlign: 'left', fontWeight: 'lighter', fontSize: 14 }} className="p-2">
                                                        For a given uploaded file, click on the {' '} <span style={{ display: 'inline-flex', alignItems: 'center' }}>  {exampleApproveBtn} </span> {' '} button to approve an uploaded file.
                                                    </Typography>
                                                </ListItem>
                                            </List>
                                        </ThemedBox>
                                    </Box>
                                </ThemedBox>
                            </Box>
                        </div>
                    </Grid>
                </Grid>
            </Container>
        </>

    );
}
