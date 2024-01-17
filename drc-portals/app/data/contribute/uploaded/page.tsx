import * as React from 'react';
import Container from '@mui/material/Container'
import { Alert, Link, Typography, Grid } from '@mui/material';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { PaginatedTable } from './PaginatedTable';
import Nav from '../Nav';

const dccMapping : {[key: string]: string} = {
    'LINCS': 'Library of Integrated Network-based Cellular Signatures',
    '4DN': '4D Nucleome',
    'Bridge2AI': 'Bridge to Artificial Intelligence',
    'A2CPS': 'Acute to Chronic Pain Signatures',
    'ExRNA': 'Extracellular RNA Communication',
    'GTEx': 'Genotype Tissue Expression',
    'HMP': 'The Human Microbiome Project',
    'HuBMAP': 'Human BioMolecular Atlas Program',
    'IDG': 'Illuminating the Druggable Genome',
    'Kids First': 'Gabriella Miller Kids First Pediatric Research',
    'MoTrPAC': 'Molecular Transducers of Physical Activity Consortium',
    'Metabolomics': 'Metabolomics',
    'SenNet': 'The Cellular Senescence Network',
    'Glycoscience': 'Glycoscience', 
    'KOMP2': 'Knockout Mouse Phenotyping Program',
    'H3Africa': 'Human Heredity & Health in Africa', 
    'UDN': 'Undiagnosed Diseases Network',
    'SPARC': 'Stimulating Peripheral Activity to Relieve Conditions',
    'iHMP': 'NIH Integrative Human Microbiome Project'
}

export default async function UserFiles() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callback=/data/contribute/uploaded")

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        },
        include: {
            dccAsset: {
                include: {
                    dcc: {
                        select: {
                            label: true,
                            short_label:true
                        }
                    }
                }
            },
        },
    })

    if (user === null) return redirect("/auth/signin?callbackUrl=/data/contribute/uploaded")
    // if user is not an uploader or approver, then they should not have acccess to this page
    if (user.role === 'USER') {
        return (
            <>
                <Nav />
                <p>Access Denied. This page is only accessible to DCC Uploaders, DCC Approvers and DRC Approvers</p>
            </>)
    }

    if (!user.email) return (
        <>
            <Nav />
            <Alert severity="warning"> Email not updated on user account. Please enter email on the My Account Page</Alert>
        </>
    );

    if (!user.dcc) return (
        <>
            <Nav />
            <Alert severity="warning"> User has no affiliated DCCs. Please contact the DRC to update your information</Alert>
        </>
    );

    const userDCCArray = user.dcc.split(',').map((dcc) => dccMapping[dcc])
    
    const allFiles = await prisma.dccAsset.findMany({
        include: {
            dcc: {
                select: {
                    label: true,
                    short_label:true
                }
            }
        },
        where: {
            ...(user.role === 'DCC_APPROVER' ? {
                dcc: {
                    label: {
                        in: userDCCArray
                    }
                }
            } : {}),
            deleted: false
        }

    })


    let userFiles = []
    let headerText;

    if (user.role === 'UPLOADER') {
        userFiles = user.dccAsset
        // userFiles = allFiles
        headerText = <Typography variant="subtitle1" color="#666666" className='' sx={{ mb: 3, ml: 2 }}>
            These are all files that have been you have uploaded for all the DCCs you are affiliated with.
            Expand each file to download or view the SHA256 checksum of each file.
            <br></br>
            See the {' '}
            <Link color="secondary" href="/data/contribute/documentation"> Documentation page</Link> for more information about the approval
            and current statuses of each file.
        </Typography>

    } else if (user.role === 'DCC_APPROVER') {
        userFiles = allFiles
        headerText = <Typography variant="subtitle1" color="#666666" className='' sx={{ mb: 3, ml: 2 }}>
            These are all files that have been uploaded for your affiliated DCCs.
            Expand each file to download or view the SHA256 checksum of each file.
            <br></br>
            See the {' '}
            <Link color="secondary" href="/data/contribute/documentation"> Documentation page</Link> for more information about the approval
            and current statuses of each file and the steps to approve a file or change its current status.
        </Typography>
    } else {
        userFiles = allFiles
        headerText = <Typography variant="subtitle1" color="#666666" className='' sx={{ mb: 3, ml: 2 }}>
            These are all files that have been uploaded for all the DCCs.
            Expand each file to download or view the SHA256 checksum of each file.
            <br></br>
            See the {' '}
            <Link color="secondary" href="/data/contribute/documentation"> Documentation page</Link> for more information about the approval
            and current statuses of each file and the steps to approve a file or change its current status.
        </Typography>
    }

    return (
        <>
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid md={2} xs={12}>
                    <Nav />
                </Grid>
                <Grid md={10} xs={12}>
                    <Container className="justify-content-center">
                        <Typography variant="h3" color="secondary.dark" className='p-5'>UPLOADED ASSETS</Typography>
                        {headerText}
                        <PaginatedTable userFiles={userFiles} role={user.role} />
                    </Container>
                </Grid>
            </Grid>
        </>
    );
}

