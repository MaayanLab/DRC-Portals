'use client'
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableFooter, TablePagination } from '@mui/material';


export function PaginatedTable({ symbolUserFiles }: { symbolUserFiles: React.JSX.Element[] }) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650}} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell sx={{ fontSize: 14 }} align="center">Date Uploaded</TableCell>
                        <TableCell sx={{ fontSize: 14 }} align="center">Uploaded By</TableCell>
                        <TableCell sx={{ fontSize: 14 }} align="center">DCC</TableCell>
                        <TableCell sx={{ fontSize: 14 }} align="center">File Type</TableCell>
                        <TableCell sx={{ fontSize: 14 }} align="center">DCC Status</TableCell>
                        <TableCell sx={{ fontSize: 14 }} align="center">DRC Status</TableCell>
                        <TableCell sx={{ fontSize: 14 }} align="center">Current</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rowsPerPage > 0
                        ? symbolUserFiles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : symbolUserFiles}
                    {/* {symbolUserFiles} */}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={8}
                            count={symbolUserFiles.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    )
}