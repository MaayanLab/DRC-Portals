import * as React from 'react';
import Container from '@mui/material/Container'
import { BsCheckCircleFill } from "react-icons/bs";
import { FaCircleExclamation } from "react-icons/fa6";
import { Alert, Typography } from '@mui/material';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { redirect } from 'next/navigation';
import ApprovalBtn from './ApprovalBtn';
import { FileRow } from './collapsibleFileInfo';
import CurrentBtn from './CurrentBtn';


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


    let symbolUserFiles = []

    if (user.role === 'UPLOADER') {
        // const userFiles = user.dccAsset
        const userFiles = allFiles

        symbolUserFiles = userFiles.map((userFile) => {
            let approvedSymboldcc = <FaCircleExclamation size={20} />
            let approvedSymbol = <FaCircleExclamation size={20} />
            let currentSymbol = <FaCircleExclamation size={20} />
            if (userFile.dccapproved) {
                approvedSymboldcc = <BsCheckCircleFill size={20} />
            }
            if (userFile.drcapproved) {
                approvedSymbol = <BsCheckCircleFill size={20} />
            }
            if (userFile.current) {
                currentSymbol = <BsCheckCircleFill size={20} />
            }
            return (
                <FileRow userFile={userFile} approvedSymboldcc={approvedSymboldcc} approvedSymbol={approvedSymbol}  currentSymbol={currentSymbol} />
            )
        })
    } else if (user.role === 'DCC_APPROVER') {
        const userFiles = allFiles
        symbolUserFiles = userFiles.map((userFile) => {
            let approvedSymboldcc = <ApprovalBtn {...userFile} dcc_drc='dcc' />
            let approvedSymbol = <FaCircleExclamation size={20} />
            let currentSymbol = <CurrentBtn {...userFile} dcc_drc='dcc'/>
            if (userFile.drcapproved) {
                approvedSymbol = <BsCheckCircleFill size={20} />
            }
            return (<FileRow userFile={userFile} approvedSymboldcc={approvedSymboldcc} approvedSymbol={approvedSymbol}  currentSymbol={currentSymbol} />)
        })

    } else {
        const userFiles = allFiles
        symbolUserFiles = userFiles.map((userFile) => {
            let approvedSymbol = <ApprovalBtn {...userFile} dcc_drc='drc' />
            let approvedSymboldcc = <FaCircleExclamation size={20} />
            let currentSymbol = <CurrentBtn {...userFile} dcc_drc='drc' />
            if (userFile.dccapproved) {
                approvedSymboldcc = <BsCheckCircleFill size={20} />
            }
            return (
                <FileRow userFile={userFile} approvedSymboldcc={approvedSymboldcc} approvedSymbol={approvedSymbol} currentSymbol={currentSymbol}/>
            )
        })
    }

    return (
        <>
            <Container className="mt-10 justify-content-center" sx={{ mb: 5 }}>
                <Typography variant="h3" className='text-center p-5'>Uploaded Files</Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell sx={{ fontSize: 14 }} align="center">Date Uploaded</TableCell>
                                <TableCell sx={{ fontSize: 14 }} align="center">Uploaded By</TableCell>
                                <TableCell sx={{ fontSize: 14 }} align="center">DCC</TableCell>
                                <TableCell sx={{ fontSize: 14 }} align="center">File Type</TableCell>
                                {/* <TableCell sx={{ fontSize: 14 }} align="center">Uploaded File</TableCell>
                                <TableCell sx={{ fontSize: 14 }} align="center">Checksum (MD5)</TableCell> */}
                                <TableCell sx={{ fontSize: 14 }} align="center">DCC Status</TableCell>
                                <TableCell sx={{ fontSize: 14 }} align="center">DRC Status</TableCell>
                                <TableCell sx={{ fontSize: 14 }} align="center">Current</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {symbolUserFiles}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </>
    );
}

