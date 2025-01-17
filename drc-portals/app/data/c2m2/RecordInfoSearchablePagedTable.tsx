'use client';
import React, { useEffect, useState } from 'react';
import { Box, Paper, Stack, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Checkbox, TablePagination } from '@mui/material';
import FormPagination from './FormPagination';
import Link from '@/utils/link';
import Image, { StaticImageData } from 'next/image';
import { NodeType } from '@prisma/client';
import { type_to_string } from '../processed/utils';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import { RowType } from './utils'; // Import the RowType

export function LinkedTypedNode({
    id,
    type,
    label,
    entity_type = null,
    focus = false,
}: {
    id: string,
    type: NodeType,
    label: string,
    entity_type?: string | null,
    focus?: boolean,
}) {
    return (
        <div className="flex flex-col">
            <Link href={`/data/c2m2/${type}${entity_type ? `/${encodeURIComponent(entity_type)}` : ''}/${id}`}>
                <Typography variant="body1" sx={{ overflowWrap: 'break-word', maxWidth: 300 }} color="secondary" fontWeight={focus ? 'bold' : undefined}>
                    {label}
                </Typography>
            </Link>
            <Link href={`/data/c2m2/${type}${entity_type ? `/${encodeURIComponent(entity_type)}` : ''}`}>
                <Typography variant='caption' color="secondary">
                    {type_to_string(type, entity_type)}
                </Typography>
            </Link>
        </div>
    );
}

export function Description({ description }: { description: string }) {
    if (description === 'TODO') return null;
    else {
        return <Typography variant="body1" color="secondary">{description}</Typography>;
    }
}

export function SearchablePagedTableCellIcon(props: {
    src: string | StaticImageData, href: string, alt: string
}) {
    return (
        <div className="w-20 h-20 relative">
            <Link href={props.href}>
                <Image className="object-contain" src={props.src} alt={props.alt} fill />
            </Link>
        </div>
    );
}

export function PreviewButton(props: {
    href: string, alt: string
}) {
    return (
        <div className="relative">
            <Link href={props.href}>
                <PageviewOutlinedIcon
                    sx={{ width: '40px', height: '40px' }}
                />
            </Link>
        </div>
    );
}

interface RecordInfoSearchablePagedTableProps {
    label?: string;
    count: number;
    columns: React.ReactNode[];
    rows: RowType[];
    tablePrefix: string;
    onRowSelect: (selectedRows: RowType[], selectAll: boolean) => void;
}

const RecordInfoSearchablePagedTable: React.FC<RecordInfoSearchablePagedTableProps> = (props) => {
    const [selectedRows, setSelectedRows] = useState<RowType[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page set to 10


    const handleCheckboxChange = (row: RowType) => {
        const isSelected = selectedRows.some(selectedRow => selectedRow.id === row.id);
        const updatedSelectedRows = isSelected
            ? selectedRows.filter(selectedRow => selectedRow.id !== row.id)
            : [...selectedRows, row];

        setSelectedRows(updatedSelectedRows);
        props.onRowSelect(updatedSelectedRows, false);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedRows(props.rows);
            props.onRowSelect(props.rows, true);
            return;
        }
        setSelectedRows([]);
        props.onRowSelect([], false);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedRows = props.rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Grid container justifyContent={'space-between'} sx={{ maxWidth: '100%', overflow: 'hidden' }}>
            {props.label &&
                <Grid item xs={12} sx={{ marginBottom: 5 }}>
                    <Stack direction={"row"} alignItems={"center"} justifyContent={'space-between'}>
                        <Typography variant="h5" color="secondary" className="whitespace-nowrap">
                            {props.label}
                        </Typography>
                    </Stack>
                </Grid>
            }
            <Grid item xs={12} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Stack spacing={1}>
                    <TableContainer component={Paper} elevation={0} variant="rounded-top" sx={{ maxHeight: 1100, width: '100%', overflowX: 'auto', maxWidth: '1100px' }}>
                        {props.rows.length === 0 ? (
                            <Typography variant='h6' color="secondary" sx={{ padding: 4, textAlign: 'center' }}>
                                No results found
                            </Typography>
                        ) : (
                            <Table stickyHeader aria-label="simple table" sx={{ tableLayout: 'auto', minWidth: '100%' }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox" sx={{ backgroundColor: '#CAD2E9' }} >
                                            <Checkbox
                                                indeterminate={selectedRows.length > 0 && selectedRows.length < props.rows.length}
                                                checked={props.rows.length > 0 && selectedRows.length === props.rows.length}
                                                onChange={handleSelectAllClick}
                                            />
                                        </TableCell>
                                        {props.columns.map((column, i) => (
                                            <TableCell
                                                key={i}
                                                align="center"
                                                sx={{
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    backgroundColor: '#CAD2E9',
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap',
                                                    overflowX: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                <Typography variant='body1' color="secondary">{column}</Typography>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedRows.map((row, i) => (
                                        <TableRow key={row.id}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedRows.some(selectedRow => selectedRow.id === row.id)}
                                                    onChange={() => handleCheckboxChange(row)}
                                                />
                                            </TableCell>
                                            {Object.entries(row)
                                                .filter(([key]) => key !== 'id')
                                                .map(([key, value], j) => (
                                                    <TableCell
                                                        key={j}
                                                        sx={{
                                                            padding: '8px',
                                                            overflowWrap: 'break-word',
                                                            textAlign: 'left',
                                                            maxWidth: 190,
                                                            minWidth: 50,
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                        align="left"
                                                    >
                                                        {value}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={props.count}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Stack>
            </Grid>
        </Grid>
    );
};

export default RecordInfoSearchablePagedTable;
