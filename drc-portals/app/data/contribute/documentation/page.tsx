'use client'
import React from 'react'
import { BsCheckCircleFill, BsCheckCircle } from "react-icons/bs";
import { ImNotification } from "react-icons/im";
import uploadImage from '@/public/img/contributions/upload_example.png'
import submitImage from '@/public/img/contributions/submit_button.png'
import newUploadImage from '@/public/img/contributions/new-upload.png'
import approveImage from '@/public/img/contributions/example_approve.png'
import approveBtnImage from '@/public/img/contributions/approve_btn.png'
import Image from 'next/image'
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Box, { BoxProps } from '@mui/material/Box';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import Link from '@mui/material/Link';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';


function Item(props: BoxProps) {
    const { sx, ...other } = props;
    return (
        <Box
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
                ...sx,
            }}
            {...other}
        />
    );
}



export default function Documentation() {
    const exampleUpload = <Image src={uploadImage} width='900' height='600' alt='' className="d-inline-block align-top" />;
    const exampleSubmit = <Image src={submitImage} width='100' height='40' alt='' className="d-inline-block align-top" />;
    const exampleNewUpload = <Image src={newUploadImage} width='900' height='200' alt='' className="d-inline-block align-top" />;
    const exampleApprove = <Image src={approveImage} width='900' height='280' alt='' className="d-inline-block align-top" />;
    const exampleApproveBtn = <Image src={approveBtnImage} width='130' height='40' alt='' className="d-inline-block align-top" />;

    const [open, setOpen] = React.useState(true);
    const [open2, setOpen2] = React.useState(true);

    const scrollToSection = React.useCallback((id: string) => {
        const el = document.getElementById(id)
        if (el === null) return
        window.scrollTo({
            top: el.offsetTop,
            behavior: "smooth",
        });
    }, []);

    return (
        <>
            {/* <Nav /> */}
            <Container className="mt-10 justify-content-center">
                <Grid container spacing={2}>
                    <Grid xs={2}>
                        {/* <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)' }}> */}
                            <Item>
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
                        <ListItemButton onClick={() => {setOpen(open => !open)}}>
                            <ListItemText primary="File Types" />
                            {open ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection("section1a")}>
                                    <ListItemText primary="XMT" />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection("section1b")}>
                                    <ListItemText primary="C2M2" />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection("section1c")}>
                                    <ListItemText primary="KG Assertions" />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection("section1d")}>
                                    <ListItemText primary="Attribute Table" />
                                </ListItemButton>
                            </List>
                        </Collapse>
                        <ListItemButton onClick={() => {setOpen2(open2 => !open2)}}>
                            <ListItemText primary="File Approval Stages" />
                            {open2 ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={open2} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection("section1e")}>
                                    <ListItemText primary="Uploaded (Not Approved)" />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection("section2a")}>
                                    <ListItemText primary="DCC Approved" />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => scrollToSection("section2b")}>
                                    <ListItemText primary="DRC Approved" />
                                </ListItemButton>
                            </List>
                        </Collapse>
                        <ListItemButton>
                            <ListItemText primary="File Upload Steps" />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemText primary="File Approval Steps" />
                        </ListItemButton>

                    </List>
                            </Item>
                        {/* </Box> */}
                    </Grid>
                    <Grid xs={10}>
                        <div>
                            <Box sx={{ display: 'grid', gridAutoRows: 'repeat(3, 1fr)' }}>
                                <Item>
                                    <Box gridTemplateRows={'repeat(5, 1fr)'}>
                                        <h4 className='text-center'>File Types</h4>
                                        <Item>
                                            <h6 style={{ textAlign: 'left' }} className="border bg-light p-1 " id="section1a"> XMT </h6>
                                            <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                XMT files are text based files which contain a collection of sets of a given entity type.
                                                The 'X' in XMT stands for the entity that the sets contain
                                                For example, .gmt files are XMT files that contain a collection of gene sets while
                                                .dmt files are XMT files that contain a collection of drug sets.
                                                On each row of the XMT file, the first column contains the Term associated with the set while all other
                                                columns contain the set entities.
                                            </p>
                                        </Item>
                                        <Item>
                                            <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="section1b"> C2M2 </h6>
                                            <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                Crosscut Metadata Model (C2M2) files are a (zipped) set of TSV files containing metadata that is already standardized to a set of known ontologies. Please explore the {' '}
                                                <Link href="https://docs.nih-cfde.org/en/latest/c2m2/draft-C2M2_specification/#c2m2-technical-specification">
                                                    CFDE C2M2 documentation</Link> and <Link href="https://github.com/nih-cfde/published-documentation/wiki">C2M2 techincal wiki</Link> {' '}
                                                for more information about C2M2 files.
                                            </p>
                                        </Item>
                                        <Item>
                                            <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="section1c"> KG Assertions </h6>
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
                                        </Item>
                                        <Item>
                                            <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="section1e"> Attribute Table </h6>
                                            <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                Attribute tables are files containing tables that describe the relationship between two entities with
                                                one entity type on the rows (e.g genes) and another on the columns (e.g tissue types). The intersection
                                                of a given row and column is then a value defining nature of the relationship between the row entity and
                                                the column entity e.g. the similarity between a given gene and a given tissue type.

                                            </p>
                                        </Item>
                                    </Box>
                                </Item>
                                <Item>
                                    <Box gridAutoRows={'repeat(4, 1fr)'}>
                                        <h4 className='text-center'> File Approval Stages</h4>
                                        <Item>
                                            <h6 style={{ textAlign: 'left' }} className="border text-left bg-light p-1" id="section2a"> Uploaded (Not Approved) </h6>
                                            <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                Files that are just uploaded will first be placed in the first stage of approval which means
                                                that they have not yet received DCC or DRC approval. Files in this category are identified with the
                                                <ImNotification /> icon on the <Link href="/data/form">Uploaded Files</Link> page.
                                            </p>
                                        </Item>
                                        <Item>
                                            <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="section2b"> DCC Approved </h6>
                                            <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                When an uploaded file has been approved by the corresponding DCC approver, the status of the file will
                                                be updated to 'DCC Approved' which is delineated by the &nbsp;
                                                <BsCheckCircle /> &nbsp; icon on the <Link href="/data/form">Uploaded Files</Link> page.
                                            </p>
                                        </Item>
                                        <Item>
                                            <h6 style={{ textAlign: 'left' }} className="border bg-light p-1" id="section2c"> DRC Approved </h6>
                                            <p style={{ textAlign: 'left', fontWeight: 'lighter' }} className="p-2">
                                                When an uploaded file has been approved by a member of the DRC, the status of the file will
                                                be updated to 'DRC Approved' which is the final stage of File Approval. This status is delineated by the
                                                <BsCheckCircleFill /> icon on the <Link href="/data/form">Uploaded Files</Link> page.
                                            </p>
                                        </Item>
                                    </Box>
                                </Item>
                                <Item>
                                    <Box gridTemplateRows={'repeat(1, 1fr)'}>
                                        <h4 className='text-center'> File Upload Steps</h4>
                                        <Item>
                                            <List sx={{ listStyle: "decimal", pl: 4 }}>
                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                    On the <Link href="/data/form">DRC Form</Link> page, fill out the available fields.
                                                    All fields except the 'File Additional Information' field are required. When satisfied with
                                                    your entries, upload your data file. Please note that only text based file types are allowed.
                                                    An example of a completed form can be seen here:
                                                    {exampleUpload}
                                                </ListItem>
                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                    After clicking on the {exampleSubmit} button, details of your uploaded file should appear on the
                                                    <Link href="/data/form"> Uploaded Files</Link> page. You can inspect your uploaded file by clicking
                                                    on the link under the 'Uploaded file' column
                                                    {exampleNewUpload}
                                                </ListItem>
                                            </List>
                                        </Item>
                                    </Box>
                                </Item>
                                <Item>
                                    <Box gridTemplateRows={'repeat(1, 1fr)'}>
                                        <h4 className='text-center'> File Approval Steps</h4>
                                        <Item>
                                            <List sx={{ listStyle: "decimal", pl: 4 }}>
                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                Go to the <Link href="/data/form">Uploaded Files</Link> page. Here you will find
                                             all uploaded files that fall under your jurisdiction. You can further inspect an uploaded file
                                             by clicking on the link under the 'Uploaded file' column.
                                                </ListItem>
                                                <ListItem sx={{ display: "list-item", fontWeight: 'lighter' }}>
                                                For a given uploaded file, click on the {exampleApproveBtn} button to approve an uploaded file.
                                                </ListItem>
                                            </List>
                                        </Item>
                                    </Box>
                                </Item>
                            </Box>
                        </div>
                    </Grid>
                </Grid>


            </Container>
        </>

    );
}
