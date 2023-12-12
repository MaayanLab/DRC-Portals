'use client'
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, TableFooter, TablePagination, TableSortLabel } from '@mui/material';
import { BsCheckCircleFill } from "react-icons/bs";
import { FaCircleExclamation } from "react-icons/fa6";
import ApprovalBtn from './ApprovalBtn';
import { FileRow } from './collapsibleFileInfo';
import CurrentBtn from './CurrentBtn';
import type { DccAsset } from '@prisma/client'
import { visuallyHidden } from '@mui/utils';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string | Date | null },
    b: { [key in Key]: number | string | Date | null },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

interface EnhancedTableProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
    order: Order;
    orderBy: string;
}

interface Data {
    lastmodified: Date;
    creator: string;
    filetype: string;
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'lastmodified',
        numeric: false,
        disablePadding: true,
        label: 'Date Uploaded',
    },
    {
        id: 'creator',
        numeric: false,
        disablePadding: false,
        label: 'Uploaded By',
    },
    {
        id: 'filetype',
        numeric: false,
        disablePadding: false,
        label: 'File Type',
    },
];

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                <TableCell></TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align='center'
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
                <TableCell sx={{ fontSize: 14 }} align="center">DCC</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">DCC Status</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">DRC Status</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">Current</TableCell>
            </TableRow>
        </TableHead>
    );
}

export function PaginatedTable({ userFiles, role }: {
    userFiles: ({
        dcc: {
            label: string;
        } | null;
    } & DccAsset)[], role: "DCC_APPROVER" | "UPLOADER" | "DRC_APPROVER" | "ADMIN"
}) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [order, setOrder] = React.useState<Order>('desc');
    const [orderBy, setOrderBy] = React.useState<keyof Data>('lastmodified');


    const handleChangePage = React.useCallback((
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    }, [page]);

    const handleChangeRowsPerPage = React.useCallback((
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, [page]);

    const handleRequestSort = React.useCallback((
        event: React.MouseEvent<unknown>,
        property: keyof Data,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);


    const sortedData = React.useMemo(
        () =>
          stableSort(userFiles, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
          ),
        [order, orderBy, page, rowsPerPage, userFiles],
      );

    let symbolUserFiles;

    if (role === 'UPLOADER') {
        symbolUserFiles = sortedData.map((userFile) => {
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
                <FileRow userFile={userFile} approvedSymboldcc={approvedSymboldcc} approvedSymbol={approvedSymbol} currentSymbol={currentSymbol} />
            )
        })
    } else if (role === 'DCC_APPROVER') {
        symbolUserFiles = sortedData.map((userFile) => {
            let approvedSymboldcc = <ApprovalBtn {...userFile} dcc_drc='dcc' />
            let approvedSymbol = <FaCircleExclamation size={20} />
            let currentSymbol = <CurrentBtn {...userFile} />
            if (userFile.drcapproved) {
                approvedSymbol = <BsCheckCircleFill size={20} />
            }
            return (<FileRow userFile={userFile} approvedSymboldcc={approvedSymboldcc} approvedSymbol={approvedSymbol} currentSymbol={currentSymbol} />)
        })

    } else {
        symbolUserFiles = sortedData.map((userFile) => {
            let approvedSymbol = <ApprovalBtn {...userFile} dcc_drc='drc' />
            let approvedSymboldcc = <FaCircleExclamation size={20} />
            let currentSymbol = <CurrentBtn {...userFile} />
            if (userFile.dccapproved) {
                approvedSymboldcc = <BsCheckCircleFill size={20} />
            }
            return (
                <FileRow key={userFile.lastmodified.toString()} userFile={userFile} approvedSymboldcc={approvedSymboldcc} approvedSymbol={approvedSymbol} currentSymbol={currentSymbol} />
            )
        })
    }



    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <EnhancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                />
                <TableBody>
                    {symbolUserFiles}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={8}
                            count={userFiles.length}
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