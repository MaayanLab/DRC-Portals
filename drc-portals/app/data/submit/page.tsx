import React from 'react'
import { BsCheckCircleFill } from "react-icons/bs";
import { FaCircleExclamation } from "react-icons/fa6";
import Image from 'next/image'
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import {Typography, Link, Button } from '@mui/material';
import { StyledAccordionComponent } from './StyledAccordion';
import dynamic from 'next/dynamic';

const YoutubeVideo = dynamic(() => import('./YoutubeVideo'))

const OnboardingDocs = dynamic(() => import('./docs/onboardingDocs.mdx'))
const FileAssetTypes = dynamic(() => import('./docs/fileAssets.mdx'))
const CodeAssetTypes = dynamic(() => import('./docs/codeAssets.mdx'))
const FileAssetSubmission = dynamic(() => import('./docs/fileAssetSubmission.mdx'))
const CodeAssetSubmission = dynamic(() => import('./docs/codeAssetSubmission.mdx'))
const AssetManagement = dynamic(() => import('./docs/assetManagement.mdx'))
const AdminUserDocs = dynamic(() => import('./docs/adminUserDocs.mdx'))
const AssetApprovalStatus = dynamic(() => import('./docs/assetApprovalStatus.mdx'))
const AssetCurrentStatus = dynamic(() => import('./docs/assetCurrentStatus.mdx'))

function CustomH1({ children }: { children?: any }) {
    return <h3 style={{ color: 'black', fontSize: '16px', borderBottom: 'solid', fontWeight: 600 }}>{children}</h3>
}

function CustomParagraph({ children }: { children?: any }) {
    return <p className="prose min-w-full">{children}</p>
}

function CustomList({ children }: { children?: any }) {
    return <li className="prose min-w-full">{children}</li>
}


function CustomNumberedList({ children }: { children?: any }) {
    return <ol className="prose min-w-full list-decimal list-inside [&_p]:inline">{children}</ol>
}


function CustomBulletList({ children }: { children?: any }) {
    return <ul className="prose min-w-full list-disc list-inside [&_p]:inline">{children}</ul>
}


const MyImage = (props: any) => (
    <img style={{ maxWidth: "70%", borderRadius: "15px", display: 'block', marginLeft: 'auto', marginRight: 'auto' }} {...props} />
)


function CustomH5({ children }: { children?: any }) {
    return <center><h5 style={{ fontSize: 14 }}>{children}</h5></center>
}


function CustomIconsFaCircleExclamation({ props }: { props: any }) {
    return <FaCircleExclamation style={{ display: 'inline-flex', alignItems: 'center' }} />
}

function CustomIconsBsCheckCircleFill({ props }: { props: any }) {
    return <BsCheckCircleFill style={{ display: 'inline-flex', alignItems: 'center' }} />
}


const components = {
    h3: CustomH1,
    p: CustomParagraph,
    li: CustomList,
    ol: CustomNumberedList,
    img: MyImage,
    h5: CustomH5,
    ul: CustomBulletList,
    FaCircleExclamation: CustomIconsFaCircleExclamation,
    BsCheckCircleFill: CustomIconsBsCheckCircleFill
}


export default function Documentation() {
    return (
        <Grid container spacing={2}>
            <Container className="justify-content-center">
                <Typography variant="h3" color="#111827.dark" className='p-5'>HOW TO SUBMIT DATA AND METADATA TO THE PORTAL?</Typography>
                <Typography variant="subtitle1" color="#374151" sx={{ mb: 3, ml: 2 }}>
                    This page covers the submission system documentation of the Data Resource Portal.
                    We are collecting file and code assets from Common Fund programs to make them
                    Findable, Accessible, Interoperable, and Reusable (FAIR) within the Data Resource Portal.
                    To submit assets, you must be logged in and registered. Registration involves being assigned a
                    role by an administrator. To register, please send us an email at <Link href="mailto:help@cfde.cloud" color='secondary'>help@cfde.cloud</Link>. 
                    Please consult this documentation for June 2024 submission (June 1st - June 15th, 2024)
                </Typography>
                <Grid item container justifyContent={'center'}>
                    <Button href='/data/submit/form' variant='contained' sx={{ height: '60px', width: '320px', margin: 3, padding: 1 }} color='tertiary'>
                        SUBMIT OR MANAGE FILE & CODE ASSETS
                    </Button>
                </Grid>
                <Grid item>
                    <StyledAccordionComponent heading="Onboarding to the Submission System" content={
                        <Box sx={{ p: 1, m: 1 }}>
                            <OnboardingDocs components={components} />
                        </Box>
                    } />

                    <StyledAccordionComponent heading='File Types' content={
                        <Box sx={{ p: 1, m: 1 }}>
                            <FileAssetTypes components={components} />
                        </Box>
                    } />

                    <StyledAccordionComponent heading='Code Asset Types' content={
                        <Box sx={{ p: 1, m: 1 }}>
                            <CodeAssetTypes components={components} />
                        </Box>
                    } />

                    <StyledAccordionComponent heading="Asset Approval Status" content={
                        <Box sx={{ p: 1, m: 1 }}>
                            <AssetApprovalStatus components={components} />
                        </Box>
                    }
                    />

                    <StyledAccordionComponent heading="Current vs Archived Status" content={
                        <Box sx={{ p: 1, m: 1 }}>
                            <AssetCurrentStatus components={components} />
                        </Box>
                    }
                    />

                    <StyledAccordionComponent heading="Data and Metadata Upload Form" content={
                        <Box sx={{ p: 1, m: 1 }}>
                            <FileAssetSubmission components={components} />
                        </Box>
                    }
                    />

                    <StyledAccordionComponent heading="Code Assets Upload Form" content={
                        <Box sx={{ p: 1, m: 1 }}>
                            <CodeAssetSubmission components={components} />
                        </Box>
                    }
                    />


                    <StyledAccordionComponent heading="Asset Approval Steps" content={
                        <Box sx={{ p: 1, m: 1 }}>
                            <AssetManagement components={components} />
                        </Box>
                    }
                    />


                    <StyledAccordionComponent heading="Admin User Documentation" content={
                        <Box sx={{ p: 1, m: 1 }}>
                            <AdminUserDocs components={components} />
                        </Box>
                    }
                    />

                    <StyledAccordionComponent heading="Instructional Video" content={
                        <Box sx={{ padding: 3 }}>
                            <center>
                                <YoutubeVideo />
                            </center>
                        </Box>
                    }
                    />
                </Grid>
            </Container >
        </Grid>
    );
}
