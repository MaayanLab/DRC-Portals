'use client'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { IconButton, Link, Typography } from '@mui/material';
import * as React from 'react';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import type { DccAsset } from '@prisma/client'
import DeleteIcon from '@mui/icons-material/Delete';


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
        sha256checksum: string | null
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
                        <TableCell variant="head">Checksum (SHA256)</TableCell>
                        <TableCell>{fileInfo.sha256checksum ? Buffer.from(fileInfo.sha256checksum, 'base64').toString('hex') : ''}</TableCell>
                    </TableRow>
                </Table>
            </Box>
        </Collapse>
    )
}

export function FileRow({userFile, approvedSymboldcc, approvedSymbol, currentSymbol} : {userFile: {dcc: {
    label: string;
} | null;
} & DccAsset, approvedSymboldcc: React.JSX.Element, approvedSymbol: React.JSX.Element, currentSymbol: React.JSX.Element}) {
    const [open, setOpen] = React.useState(false);

    const deleteRow = () => {
        
    }

    return (
        <>
            <TableRow
                key={userFile.lastmodified.toString()}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell><CollapsibleArrow open={open} setOpen={setOpen}/></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center" >{userFile.lastmodified.toUTCString()}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">{userFile.creator}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">{userFile.filetype}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">{userFile.dcc?.label ?? userFile.dcc_id}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="right"><div className='flex justify-center'>{approvedSymboldcc}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"><div className='flex justify-center'>{approvedSymbol}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"><div className='flex justify-center'>{currentSymbol}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"><div className='flex justify-center'><button onClick={() => deleteRow()}><DeleteIcon /></button></div></TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <FileInfo open={open} fileInfo={{ 'fileLink': userFile.link, 'fileName': userFile.filename, 'sha256checksum': userFile.sha256checksum }} />
                </TableCell>
            </TableRow>
        </>
    );
}