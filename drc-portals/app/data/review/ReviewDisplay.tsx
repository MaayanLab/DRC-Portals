'use client'
import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';

interface ReviewDisplayProps {
    result: any[];
    title: string;
}

export default function ReviewDisplay({ result, title }: ReviewDisplayProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Handle page change
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page
    };

    // Calculate the paginated data
    const paginatedData = result.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            {result.length > 0 && (
                <Grid item xs={12}>
                    <Typography variant="h6">{title}</Typography>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100, 200]}
                        component="div"
                        count={result.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                    <TableContainer style={{ maxHeight: '75%', maxWidth: '100%', overflow: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {Object.keys(result[0]).map((key) => (
                                        <TableCell key={key} style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                                            {key}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedData.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {Object.values(row).map((value, cellIndex) => (
                                            <TableCell key={cellIndex}>{String(value)}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100, 200]}
                        component="div"
                        count={result.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Grid>
            )}
        </>
    );
}
