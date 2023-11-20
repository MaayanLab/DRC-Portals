import * as React from 'react';
import Container from '@mui/material/Container'
import { BsCheckCircleFill, BsCheckCircle } from "react-icons/bs";
import { FaCircleExclamation } from "react-icons/fa6";
import { Button, Link, Typography } from '@mui/material';
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
        }
    })

    if (user === null ) return redirect("/auth/signin?callbackUrl=/data/contribute/uploaded")

    // if user is not an uploader or approver, then they should not have acccess to this page
    if (user.role === 'USER') { return <p>Access Denied</p> }
    if (!session.user.email) return redirect("/data/contribute/account")

    if (user.role === 'UPLOADER') {
        const userFiles = await prisma.dccAsset.findMany({
            where: {
                creator: session.user.email,
            },
            include: {
                dcc: {
                    select: {
                        label: true
                    }
                }
            }
        })

        const symbolUserFiles = userFiles.map((userFile) => {
            let approvedSymbol = <FaCircleExclamation />
            if (userFile.approved) {
                approvedSymbol = <BsCheckCircle />
            }
            return ({ ...userFile, approvedSymbol })
        })



        return (
            <>
                <Container className="mt-10 justify-content-center">
                    <Typography variant="h3" className='text-center p-5'>Uploaded Files</Typography>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Date Uploaded</TableCell>
                                    <TableCell align="center">Uploaded By</TableCell>
                                    <TableCell align="center">DCC</TableCell>
                                    <TableCell align="center">File Type</TableCell>
                                    <TableCell align="center">Uploaded File</TableCell>
                                    <TableCell align="center">Additional Info</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {symbolUserFiles.map((row) => (
                                    <TableRow
                                        key={row.link}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell align="center" >{row.lastmodified.toString()}</TableCell>
                                        <TableCell align="center">{row.creator}</TableCell>
                                        <TableCell align="center">{row.dcc?.label ?? row.dcc_id}</TableCell>
                                        <TableCell align="center">{row.filetype}</TableCell>
                                        <TableCell align="center"><Link href={row.link} target="_blank" rel="noopener">{row.filename}</Link></TableCell>
                                        <TableCell align="center"></TableCell>
                                        <TableCell align="center">{row.approvedSymbol}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>


            </>
        );
    } else if (user.role === 'DCC_APPROVER') {
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: session.user.id
            }
        })
        if (!user) throw new Error('user not found')
        if (!user.dcc) return redirect("/data/contribute/account")

        const userDCCArray = user.dcc.split(',')

        const userFiles = await prisma.dccAsset.findMany({
            include: {
                dcc: {
                    select: {
                        label: true
                    }
                }, 
            },
            where: {
                dcc :{
                    label : {
                        in : userDCCArray
                    } 
                }
            }
        })


        // const symbolUserFiles = userFiles.map((userFile) => {
        //     let approvedSymboldcc = <ApprovalBtn {...userFile} dcc_drc='dcc' />
        //     let approvedSymbol = <FaCircleExclamation size={20}/>
        //     if (userFile.approved) {
        //         approvedSymboldcc = <BsCheckCircleFill size={20}/>
        //     }
        //     if (userFile.drcapproved) {
        //         approvedSymbol =  <BsCheckCircleFill size={20}/>
        //     }
        //     return ({ ...userFile, approvedSymbol, approvedSymboldcc })
        // })

        const symbolUserFiles = userFiles.map((userFile) => {
            let approvedSymboldcc = <ApprovalBtn {...userFile} dcc_drc='dcc'/>
            let approvedSymbol = <FaCircleExclamation size={20}/>
            if (userFile.drcapproved) {
                approvedSymbol= <BsCheckCircleFill size={20}/>
            }
            return ({ ...userFile, approvedSymbol, approvedSymboldcc })
        })


        return (
            <>
                <Container className="mt-10 justify-content-center">
                    <Typography variant="h3" className='text-center p-5'>Uploaded Files</Typography>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Date Uploaded</TableCell>
                                    <TableCell align="center">Uploaded By</TableCell>
                                    <TableCell align="center">DCC</TableCell>
                                    <TableCell align="center">File Type</TableCell>
                                    <TableCell align="center">Uploaded File</TableCell>
                                    <TableCell align="center">Additional Info</TableCell>
                                    <TableCell align="center">DCC Status</TableCell>
                                    <TableCell align="center">DRC Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {symbolUserFiles.map((row) => (
                                    <TableRow
                                        key={row.link}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell align="center" >{row.lastmodified.toString()}</TableCell>
                                        <TableCell align="center">{row.creator}</TableCell>
                                        <TableCell align="center">{row.dcc?.label ?? row.dcc_id}</TableCell>
                                        <TableCell align="center">{row.filetype}</TableCell>
                                        <TableCell align="center"><Link href={row.link} target="_blank" rel="noopener">{row.filename}</Link></TableCell>
                                        <TableCell align="center"></TableCell>
                                        <TableCell align="center">{row.approvedSymboldcc}</TableCell>
                                        <TableCell align="center">{row.approvedSymbol}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            </>
        );

    } else {
        const userFiles = await prisma.dccAsset.findMany({
            include: {
                dcc: {
                    select: {
                        label: true
                    }
                }
            }
        })
        const symbolUserFiles = userFiles.map((userFile) => {
            let approvedSymbol = <ApprovalBtn {...userFile} dcc_drc='drc'/>
            let approvedSymboldcc = <FaCircleExclamation size={20}/>
            if (userFile.approved) {
                approvedSymboldcc = <BsCheckCircleFill size={20}/>
            }
            return ({ ...userFile, approvedSymbol, approvedSymboldcc })
        })


        return (
            <>
                <Container className="mt-10 justify-content-center">
                    <Typography variant="h3" className='text-center p-5'>Uploaded Files</Typography>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Date Uploaded</TableCell>
                                    <TableCell align="center">Uploaded By</TableCell>
                                    <TableCell align="center">DCC</TableCell>
                                    <TableCell align="center">File Type</TableCell>
                                    <TableCell align="center">Uploaded File</TableCell>
                                    <TableCell align="center">Additional Info</TableCell>
                                    <TableCell align="center">DCC Status</TableCell>
                                    <TableCell align="center">DRC Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {symbolUserFiles.map((row) => (
                                    <TableRow
                                        key={row.lastmodified.toString()}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell align="center" >{row.lastmodified.toString()}</TableCell>
                                        <TableCell align="center">{row.creator}</TableCell>
                                        <TableCell align="center">{row.dcc?.label ?? row.dcc_id}</TableCell>
                                        <TableCell align="center">{row.filetype}</TableCell>
                                        <TableCell align="center"><Link href={row.link} target="_blank" rel="noopener">{row.filename}</Link></TableCell>
                                        <TableCell align="center"></TableCell>
                                        <TableCell align="center">{row.approvedSymboldcc}</TableCell>
                                        <TableCell align="center">{row.approvedSymbol}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            </>
        );
    }

}
