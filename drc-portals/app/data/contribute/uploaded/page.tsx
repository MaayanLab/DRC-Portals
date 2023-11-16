import * as React from 'react';
import Container from '@mui/material/Container'
// import { BsCheckCircleFill, BsCheckCircle } from "react-icons/bs";
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

export default async function UserFiles() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callback=/data/contribute/uploaded")
    // TODO: the user table should be joined with the dcc asset table on the creator field
    //       then these two queries can be updated to include userFiles..
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: session.user.id,
        },
    })
    if (!user.email) throw new Error('Missing email')
    const userFiles = await prisma.dccAsset.findMany({
        where: {
            creator: user?.email,
        },
        include: {
            dcc: {
                select: {
                    label: true
                }
            }
        }
    })
    console.log(userFiles)

    return (
        <>
            <Container className="mt-10 justify-content-center">
                <Typography variant="h3" className='text-center p-5'>Uploaded Files</Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                        <TableCell>Date Uploaded</TableCell>
                        <TableCell align="center">Uploaded By</TableCell>
                        <TableCell align="center">DCC</TableCell>
                        <TableCell align="center">File Type</TableCell>
                        <TableCell align="center">Uploaded File</TableCell>
                        <TableCell align="center">Additional Info</TableCell>
                        <TableCell align="center">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {userFiles.map((row) => (
                            <TableRow
                                key={row.link}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">{row.lastmodified.toString()}</TableCell>
                                <TableCell align="right">{row.creator}</TableCell>
                                <TableCell align="right">{row.dcc?.label ?? row.dcc_id}</TableCell>
                                <TableCell align="right">{row.filetype}</TableCell>
                                <TableCell align="right"><Link href={row.link} target="_blank" rel="noopener">{row.filename}</Link></TableCell>
                                <TableCell align="right"></TableCell>
                                <TableCell align="right">{row.approved}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
            </Container>


        </>
    );
}
