'use client'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { IconButton, Link, Typography } from '@mui/material';
import * as React from 'react';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import type { DccAsset } from '@prisma/client'


export function CollapsibleArrow({open, setOpen}: {open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>}) {
    return (
        <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
        >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
    );
}

export function FileInfo({ open, fileInfo }: {
    open: boolean;
    fileInfo: {
        fileName: string,
        fileLink: string,
        etag: string | null
    }
}
) {
    return (
        <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                    File Info
                </Typography>
                <Table>
                    <TableRow>
                        <TableCell variant="head">File</TableCell>
                        <TableCell><Link color="secondary" href={fileInfo.fileLink} target="_blank" rel="noopener">{fileInfo.fileName}</Link></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head">Checksum (MD5)</TableCell>
                        <TableCell>{fileInfo.etag}</TableCell>
                    </TableRow>
                </Table>
            </Box>
        </Collapse>
    )
}

export function FileRow({userFile, approvedSymboldcc, approvedSymbol} : {userFile: {dcc: {
    label: string;
} | null;
} & DccAsset, approvedSymboldcc: React.JSX.Element, approvedSymbol: React.JSX.Element}) {
    const [open, setOpen] = React.useState(false);
    return (
        <>
            <TableRow
                key={userFile.lastmodified.toString()}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell><CollapsibleArrow open={open} setOpen={setOpen}/></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center" >{userFile.lastmodified.toString()}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">{userFile.creator}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">{userFile.dcc?.label ?? userFile.dcc_id}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">{userFile.filetype}</TableCell>
                {/* <TableCell sx={{ fontSize: 14 }} align="center"><Link color="secondary" href={userFile.link} target="_blank" rel="noopener">{userFile.filename}</Link></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">{userFile.etag}</TableCell> */}
                <TableCell sx={{ fontSize: 14 }} align="center">{approvedSymboldcc}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">{approvedSymbol}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <FileInfo open={open} fileInfo={{ 'fileLink': userFile.link, 'fileName': userFile.filename, 'etag': userFile.etag }} />
                </TableCell>
            </TableRow>
        </>
    );
}