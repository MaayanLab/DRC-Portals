// SearchablePagedTable.tsx
'use client'
import React, { useState } from 'react';
import { Box, Paper, Stack, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Checkbox } from '@mui/material';
import FormPagination from './FormPagination';
import SearchField from './SearchField';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { NodeType } from '@prisma/client';
import { type_to_string } from '../processed/utils';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import TagComponent from './TagComponent';
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
        <div className="w-32 h-16 relative">
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
        <div className="pl-2 relative">
            <Link href={props.href}>
                <FindInPageOutlinedIcon sx={{ width: '50px', height: '50px' }} />
            </Link>
        </div>
    );
}

interface SearchablePagedTableProps {
    label?: string;
    q?: string;
    p: number;
    r: number;
    count?: number;
    t?: { type: string; entity_type: string | null; }[] | undefined;
    columns: React.ReactNode[];
    rows: RowType[]; // Use the RowType
    tablePrefix: string;
    onRowSelect: (selectedRows: RowType[], selectAll: boolean) => void; // Adjust the onRowSelect type
}

const SearchablePagedTable: React.FC<SearchablePagedTableProps> = (props) => {
    const [selectedRows, setSelectedRows] = useState<RowType[]>([]); // Use the RowType

    const handleCheckboxChange = (row: RowType) => { // Use the RowType
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

    return (
        <Grid container justifyContent={'space-between'}>
            {props.label &&
                <Grid item xs={12} sx={{ marginBottom: 5 }}>
                    <Stack direction={"row"} alignItems={"center"} justifyContent={'space-between'}>
                        <Typography variant="h5" color="secondary" className="whitespace-nowrap">
                            {props.label}
                        </Typography>
                    </Stack>
                </Grid>
            }
            <Grid item xs={12}>
                {props.rows.length === 0 ? (
                    <>No results</>
                ) : (
                    <Stack spacing={1}>
                        {(props.q || props.t) &&
                            <Box display="inline-block">
                                <TagComponent q={props.q} t={props.t} />
                            </Box>
                        }
                        <FormPagination p={props.p} r={props.r} count={props.count} tablePrefix={props.tablePrefix} />
                        <TableContainer component={Paper} elevation={0} style={{ maxHeight: 700, overflow: 'auto' }}>
                            <Table stickyHeader aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
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
                                                style={{
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    backgroundColor: '#F0F8FF',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                <Typography variant='h6' color="secondary">{column}</Typography>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.rows.map((row, i) => (
                                        <TableRow key={row.id}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedRows.some(selectedRow => selectedRow.id === row.id)}
                                                    onChange={() => handleCheckboxChange(row)}
                                                />
                                            </TableCell>
                                            {Object.entries(row)
                                                .filter(([key]) => key !== 'id') // Ignore the 'id' key
                                                .map(([key, value], j) => (
                                                    <TableCell
                                                        key={j}
                                                        style={{
                                                            padding: '8px',
                                                            maxWidth: 300,
                                                            overflowWrap: 'break-word',
                                                            textAlign: 'left',
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
                        </TableContainer>
                    </Stack>
                )}
            </Grid>
        </Grid>
    );
};

export default SearchablePagedTable;
