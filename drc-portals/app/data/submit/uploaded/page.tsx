import * as React from 'react';
import Container from '@mui/material/Container'
import { Alert, Link, Typography, Grid, Button } from '@mui/material';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { PaginatedTable } from './PaginatedTable';
import Nav from '../Nav';
import { DCC } from '@prisma/client';


export default async function UserFiles() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callback=/data/submit/uploaded")

    const dccInfo = await prisma.dCC.findMany()
    const dccMapping: { [key: string]: string } = {}
    dccInfo.map((dcc) => {
        dcc.short_label ? dccMapping[dcc.short_label] = dcc.label : dccMapping[dcc.label] = dcc.label
    })

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
                            short_label: true
                        }
                    },
                    fileAsset: true,
                    codeAsset: true,
                    fairAssessments: {
                        orderBy: {
                            timestamp: 'desc',
                        },
                        take: 1,
                    }
                }
            },
            dccs: true
        },
    })

    if (user === null) return redirect("/auth/signin?callbackUrl=/data/submit/uploaded")
    // if user is not an uploader or approver, then they should not have acccess to this page
    if (user.role === 'USER') {
        return (
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid md={2} xs={12}>
                    <Nav />
                </Grid>
                <Grid md={10} xs={12}>
                    <Alert severity="warning">Access Denied. This page is only accessible to DCC Uploaders and DCC & DRC Approvers</Alert>
                </Grid>
            </Grid>
        )
    }
    if (!user.email) return (
        <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid md={2} xs={12}>
                <Nav />
            </Grid>
            <Grid md={10} xs={12}>
                <Alert severity="warning" action={
                    <Button color="inherit" size="small" href='/data/submit/account'>
                        GO TO MY ACCOUNT
                    </Button>
                }> Email not updated on user account. Please enter email on the My Account Page</Alert>
            </Grid>
        </Grid>
    );

    if (user.dccs.length === 0) return (
        <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid md={2} xs={12}>
                <Nav />
            </Grid>
            <Grid md={10} xs={12}>
                <Alert severity="warning"> User has no affiliated DCCs. Please contact the DRC to update your information</Alert>    </Grid>
        </Grid>
    );

    let userDCCArray: string[] = []
    user.dccs.forEach((dcc: DCC) => { if (dcc.short_label) { userDCCArray.push(dcc.short_label) } })

    const allFiles = await prisma.dccAsset.findMany({
        include: {
            dcc: {
                select: {
                    label: true,
                    short_label: true
                }
            },
            fileAsset: true,
            codeAsset: true,
            fairAssessments: {
                orderBy: {
                    timestamp: 'desc',
                },
                take: 1,
            }
        },
        where: {
            ...((user.role === 'DCC_APPROVER') || (user.role === 'READONLY')  ? {
                dcc: {
                    short_label: {
                        in: userDCCArray
                    }
                }
            } : {}),
            ...(user.role !== 'ADMIN' ? { deleted: false } : {}),
        },

    })


    let userFiles = []
    let headerText;

    if (user.role === 'UPLOADER') {
        userFiles = user.dccAsset.filter((asset) => asset.deleted === false).map(obj => ({ ...obj, assetType: obj.fileAsset ? obj.fileAsset?.filetype : obj.codeAsset?.type ?? '' }))

        // userFiles = allFiles
        headerText = <Typography variant="subtitle1" color="#666666" className='' sx={{ mb: 3, ml: 2 }}>
            These are all assets that you have uploaded/submitted for all the DCCs you are affiliated with.
            Expand a row to see additional information for a file or code asset.
            See the {' '}
            <Link color="secondary" href="/data/submit"> Documentation page</Link> for more information about the approval
            and current statuses of each file.
        </Typography>

    } else if ((user.role === 'DCC_APPROVER') || (user.role === 'READONLY')) {
        userFiles = allFiles.map(obj => ({ ...obj, assetType: obj.fileAsset ? obj.fileAsset?.filetype : obj.codeAsset?.type ?? '' }))
        headerText = <Typography variant="subtitle1" color="#666666" className='' sx={{ mb: 3, ml: 2 }}>
            These are all assets that have been uploaded/submitted for your affiliated DCCs.
            Expand a row to see additional information for a file or code asset.
            See the {' '}
            <Link color="secondary" href="/data/submit"> Documentation page</Link> for more information about the approval
            and current statuses of each file and the steps to approve a file or change its current status.
        </Typography>
    } else {
        userFiles = allFiles.map(obj => ({ ...obj, assetType: obj.fileAsset ? obj.fileAsset?.filetype : obj.codeAsset?.type ?? '' }))
        headerText = <Typography variant="subtitle1" color="#666666" className='' sx={{ mb: 3, ml: 2 }}>
            These are all assets that have been uploaded/submitted for all the DCCs.
            Expand a row to see additional information for a file or code asset.
            See the {' '}
            <Link color="secondary" href="/data/submit"> Documentation page</Link> for more information about the approval
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
                        <PaginatedTable userFiles={userFiles} role={user.role}/>
                    </Container>
                </Grid>
            </Grid>
        </>
    );
}

