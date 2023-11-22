import * as React from 'react';
import Container from '@mui/material/Container'
import { BsCheckCircleFill, BsCheckCircle } from "react-icons/bs";
import { FaCircleExclamation } from "react-icons/fa6";
import { Link, Typography } from '@mui/material';
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
    // if (!user) throw new Error('user not found')
    if (!user.dcc) return redirect("/data/contribute/account")
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
            ...(user.role === 'DCC_APPROVER' ? {
                dcc: {
                    label: {
                        in: userDCCArray
                    }
                }
            } : {})
            }

    })

   
    // if user is not an uploader or approver, then they should not have acccess to this page
    if (user.role === 'USER') { return <p>Access Denied. This page is only accessible to DCC Uploaders, DCC Approvers and DRC Approvers</p> }
    if (!user.email) return redirect("/data/contribute/account")
    if (!user.dcc) return redirect("/data/contribute/account")

    let symbolUserFiles = []

    if (user.role === 'UPLOADER') {
        const userFiles = user.dccAsset

        symbolUserFiles = userFiles.map((userFile) => {
            let approvedSymboldcc = <FaCircleExclamation size={20} />
            let approvedSymbol = <FaCircleExclamation size={20} />
            if (userFile.dccapproved) {
                approvedSymboldcc = <BsCheckCircleFill size={20} />
            }
            if (userFile.drcapproved) {
                approvedSymbol = <BsCheckCircleFill size={20} />
            }
            return (
                <TableRow
                    key={userFile.link}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }}}
                >
                    <TableCell  sx={{ fontSize: 14 }} align="center" >{userFile.lastmodified.toString()}</TableCell>
                    <TableCell  sx={{ fontSize: 14 }} align="center">{userFile.creator}</TableCell>
                    <TableCell  sx={{ fontSize: 14 }} align="center">{userFile.dcc?.label ?? userFile.dcc_id}</TableCell>
                    <TableCell  sx={{ fontSize: 14 }} align="center">{userFile.filetype}</TableCell>
                    <TableCell  sx={{ fontSize: 14 }} align="center"><Link color="secondary" href={userFile.link} target="_blank" rel="noopener">{userFile.filename}</Link></TableCell>
                    <TableCell  sx={{ fontSize: 14 }} align="center"></TableCell>
                    <TableCell  sx={{ fontSize: 14 }} align="center">{approvedSymboldcc}</TableCell>
                    <TableCell  sx={{ fontSize: 14 }} align="center">{approvedSymbol}</TableCell>
                </TableRow>
            )
        })
    } else if (user.role === 'DCC_APPROVER') {
        const userFiles = allFiles
        symbolUserFiles = userFiles.map((userFile) => {
            let approvedSymboldcc = <ApprovalBtn {...userFile} dcc_drc='dcc' />
            let approvedSymbol = <FaCircleExclamation size={20} />
            if (userFile.drcapproved) {
                approvedSymbol = <BsCheckCircleFill size={20} />
            }
            return (<TableRow
                key={userFile.link}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell sx={{ fontSize: 14 }}  align="center" >{userFile.lastmodified.toString()}</TableCell>
                <TableCell sx={{ fontSize: 14 }}  align="center">{userFile.creator}</TableCell>
                <TableCell  sx={{ fontSize: 14 }} align="center">{userFile.dcc?.label ?? userFile.dcc_id}</TableCell>
                <TableCell  sx={{ fontSize: 14 }} align="center">{userFile.filetype}</TableCell>
                <TableCell  sx={{ fontSize: 14 }} align="center"><Link color="secondary" href={userFile.link} target="_blank" rel="noopener">{userFile.filename}</Link></TableCell>
                <TableCell  sx={{ fontSize: 14 }} align="center"></TableCell>
                <TableCell sx={{ fontSize: 14 }}  align="center">{approvedSymboldcc}</TableCell>
                <TableCell  sx={{ fontSize: 14 }} align="center">{approvedSymbol}</TableCell>
            </TableRow>)
        })

    } else {
        const userFiles = allFiles
        symbolUserFiles = userFiles.map((userFile) => {
            let approvedSymbol = <ApprovalBtn {...userFile} dcc_drc='drc' />
            let approvedSymboldcc = <FaCircleExclamation size={20} />
            if (userFile.dccapproved) {
                approvedSymboldcc = <BsCheckCircleFill size={20} />
            }
            return (
                <TableRow
                    key={userFile.lastmodified.toString()}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                    <TableCell  sx={{ fontSize: 14 }} align="center" >{userFile.lastmodified.toString()}</TableCell>
                    <TableCell  sx={{ fontSize: 14 }}align="center">{userFile.creator}</TableCell>
                    <TableCell  sx={{ fontSize: 14 }} align="center">{userFile.dcc?.label ?? userFile.dcc_id}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}  align="center">{userFile.filetype}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}  align="center"><Link color="secondary" href={userFile.link} target="_blank" rel="noopener">{userFile.filename}</Link></TableCell>
                    <TableCell  sx={{ fontSize: 14 }} align="center"></TableCell>
                    <TableCell  sx={{ fontSize: 14 }} align="center">{approvedSymboldcc}</TableCell>
                    <TableCell  sx={{ fontSize: 14 }} align="center">{approvedSymbol}</TableCell>
                </TableRow>
            )

        })
    }

    return (
        <>
            <Container className="mt-10 justify-content-center" sx={{mb:5}}>
                <Typography variant="h3" className='text-center p-5'>Uploaded Files</Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: 14 }} align="center">Date Uploaded</TableCell>
                                <TableCell sx={{ fontSize: 14 }} align="center">Uploaded By</TableCell>
                                <TableCell  sx={{ fontSize: 14 }} align="center">DCC</TableCell>
                                <TableCell sx={{ fontSize: 14 }} align="center">File Type</TableCell>
                                <TableCell sx={{ fontSize: 14 }} align="center">Uploaded File</TableCell>
                                <TableCell  sx={{ fontSize: 14 }} align="center">Additional Info</TableCell>
                                <TableCell sx={{ fontSize: 14 }} align="center">DCC Status</TableCell>
                                <TableCell sx={{ fontSize: 14 }} align="center">DRC Status</TableCell>
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

