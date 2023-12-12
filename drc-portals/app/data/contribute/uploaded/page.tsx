import * as React from 'react';
import Container from '@mui/material/Container'
import { Alert, Typography } from '@mui/material';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { PaginatedTable } from './PaginatedTable';


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
                            label: true
                        }
                    }
                }
            },
        },
    })

    if (user === null) return redirect("/auth/signin?callbackUrl=/data/contribute/uploaded")
    // if user is not an uploader or approver, then they should not have acccess to this page
    if (user.role === 'USER') { return <p>Access Denied. This page is only accessible to DCC Uploaders, DCC Approvers and DRC Approvers</p> }

    if (!user.email) return (
        <Alert severity="warning"> Email not updated on user account. Please enter email on My Account Page</Alert>
    );

    if (!user.dcc) return (
        <Alert severity="warning"> User has no affiliated DCCs. Please contact the DRC to update your information</Alert>
    );

    const userDCCArray = user.dcc.split(',')
    const allFiles = await prisma.dccAsset.findMany({
        include: {
            dcc: {
                select: {
                    label: true
                }
            }
        },
        where: {
            ...(user.role === 'DCC_APPROVER' || user.role === 'UPLOADER' ? {
                dcc: {
                    label: {
                        in: userDCCArray
                    }
                }
            } : {})
        }

    })


    let userFiles = []

    if (user.role === 'UPLOADER') {
        // const userFiles = user.dccAsset
        userFiles = allFiles
    } else if (user.role === 'DCC_APPROVER') {
        userFiles = allFiles
    } else {
        userFiles = allFiles
    }

    return (
        <>
            <Container className="justify-content-center">
                <Typography variant="h3" className='text-center p-5'>Uploaded Files</Typography>
                <PaginatedTable userFiles={userFiles} role={user.role}/> 
            </Container>
        </>
    );
}

