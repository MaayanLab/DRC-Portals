import React from 'react'
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Typography, Link, Button } from '@mui/material';
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
const FairAssessmentDocs = dynamic(() => import('./docs/fairAssessmentDocs.mdx'))

function CustomH3({ children }: { children?: any }) {
    return <h3 style={{ color: 'black', fontSize: '16px', borderBottom: 'solid', fontWeight: 600, marginTop: 15 }}>{children}</h3>
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


function CustomEm({ children }: { children?: any }) {
    return <em className="caption" style={{ fontSize: 14, fontStyle: 'normal', textAlign: 'center', display: 'block' }}>{children}</em>
}

function CustomH4({ children }: { children?: any }) {
    return <h3 style={{ color: 'black', fontSize: '16px', fontWeight: 600,  marginTop: 10}} className=' prose min-w-full list-disc list-inside [&_p]:inline'>{children}</h3>
}

const components = {
    h3: CustomH3,
    h4: CustomH4,
    p: CustomParagraph,
    li: CustomList,
    ol: CustomNumberedList,
    img: MyImage,
    // h5:  CustomH5,
    ul: CustomBulletList,
    em: CustomEm
}


export default function Documentation() {
    return (
        <Grid container spacing={2} justifyContent={"center"}>
            <Grid item xs={12}>
                <Typography variant="h3" color="#111827.dark" className='p-5'>HOW TO SUBMIT DATA AND METADATA TO THE PORTAL?</Typography>
                <Typography variant="subtitle1" color="#374151" sx={{ mb: 3, ml: 2 }}>
                    This page covers the submission system documentation of the Data Resource Portal.
                    We are collecting file and code assets from Common Fund programs to make them
                    Findable, Accessible, Interoperable, and Reusable (FAIR) within the Data Resource Portal.
                    To submit assets, you must be logged in and registered. Registration involves being assigned a
                    role by an administrator. To register, please send us an email at <Link href="mailto:help@cfde.cloud" color='secondary'>help@cfde.cloud</Link>.
                    Please consult this documentation for June 2024 submission (June 1st - June 15th, 2024).
                </Typography>
            </Grid>
            <Grid item xs={12} container justifyContent={'center'}>
                <Button href='/data/submit/form' variant='contained' sx={{ height: '60px', width: '320px', margin: 3, padding: 1 }} color='tertiary'>
                    SUBMIT OR MANAGE FILE & CODE ASSETS
                </Button>
            </Grid>
            <Grid item xs={12}>
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

                <StyledAccordionComponent heading="Fair Assessment Documentation" content={
                    <Box sx={{ p: 1, m: 1 }}>
                        <FairAssessmentDocs components={components} />
                    </Box>
                }
                />

                <StyledAccordionComponent heading="Instructional Video" content={
                    <>
                        <Box sx={{ padding: 3, display: { xs: 'none', sm: 'block', md: 'block', lg: 'block', xl: 'block' } }}>
                            <center>
                                <YoutubeVideo size={'large'} />
                            </center>
                        </Box>
                        <Box sx={{ padding: 3, display: { xs: 'block', sm: 'none', md: 'none', lg: 'none', xl: 'none' } }}>
                            <center>
                                <YoutubeVideo size={'small'} />
                            </center>
                        </Box>
                    </>
                }
                />
            </Grid>
        </Grid>
    );
}
