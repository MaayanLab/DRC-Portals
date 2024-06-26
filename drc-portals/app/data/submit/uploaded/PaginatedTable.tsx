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
import ApprovalBtn from './ApprovalBtn';
import { FileRow } from './collapsibleFileInfo';
import CurrentBtn from './CurrentBtn';
import type { DccAsset, FileAsset, CodeAsset, FairAssessment } from '@prisma/client'
import { visuallyHidden } from '@mui/utils';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { useDebounce } from 'use-debounce';
import { ApprovedSymbol, NotApprovedSymbol } from './tableSymbols';


const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

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
    a: { [key in Key]: number | string | Date | null | { label: string; } },
    b: { [key in Key]: number | string | Date | null | { label: string; } },
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
    dcc?: {
        label: string;
        short_label: string | null
    };
    assetType: FileAsset | CodeAsset | null;
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
        id: 'assetType',
        numeric: false,
        disablePadding: false,
        label: 'Asset Type',
    },
    {
        id: 'dcc',
        numeric: false,
        disablePadding: false,
        label: 'DCC',
    }
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
                            <strong>{headCell.label}</strong>
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
                <TableCell sx={{ fontSize: 14 }} align="center"><strong>DCC Status</strong></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"><strong>DRC Status</strong></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"><strong>Current</strong></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"></TableCell>
            </TableRow>
        </TableHead>
    );
}

function dccCompare(a: {
    dcc: {
        label: string;
        short_label: string | null
    } | null;
    fileAsset: FileAsset | null;
    codeAsset: CodeAsset | null;
} & DccAsset, b: {
    dcc: {
        label: string;
        short_label: string | null
    } | null;
    fileAsset: FileAsset | null;
    codeAsset: CodeAsset | null;
} & DccAsset) {
    if (!a.dcc?.short_label) return 0
    if (!b.dcc?.short_label) return 0
    if (a.dcc?.short_label < b.dcc?.short_label) {
        return -1;
    } else if (a.dcc?.short_label > b.dcc?.short_label) {
        return 1;
    }
    return 0;
}

function dccCompareAsc(a: {
    dcc: {
        label: string;
        short_label: string | null
    } | null;
    fileAsset: FileAsset | null;
    codeAsset: CodeAsset | null;
} & DccAsset, b: {
    dcc: {
        label: string;
        short_label: string | null
    } | null;
    fileAsset: FileAsset | null;
    codeAsset: CodeAsset | null;
} & DccAsset) {
    if (!a.dcc?.short_label) return 0
    if (!b.dcc?.short_label) return 0
    if (a.dcc?.short_label < b.dcc?.short_label) {
        return 1;
    } else if (a.dcc?.short_label > b.dcc?.short_label) {
        return -1;
    }
    return 0;
}

function filterSearch(item: ({
    dcc: {
        label: string;
        short_label: string | null
    } | null;
    fileAsset: FileAsset | null;
    codeAsset: CodeAsset | null;
    assetType: string | null;
} & DccAsset), query: string) {
    return (item.assetType?.toLowerCase().includes(query.toLowerCase())) || 
    (item.codeAsset?.name.toLowerCase().includes(query.toLowerCase())) ||
    (item.fileAsset?.filename.toLowerCase().includes(query.toLowerCase())) ||
    (item.creator?.toLowerCase().includes(query.toLowerCase())) ||
    (item.lastmodified.toString().toLowerCase().includes(query.toLowerCase())) ||
    (item.link.toLowerCase().includes(query.toLowerCase())) ||
    (item.dcc?.short_label ? item.dcc?.short_label.toLowerCase().includes(query.toLowerCase()) : item.dcc?.label.toLowerCase().includes(query.toLowerCase()))

}

export function PaginatedTable({ userFiles, role, fairAssessments }: {
    userFiles: ({
        dcc: {
            label: string;
            short_label: string | null;
        } | null;
        fileAsset: FileAsset | null;
        codeAsset: CodeAsset | null;
        assetType: string | null;
    } & DccAsset)[], role: "DCC_APPROVER" | "UPLOADER" | "DRC_APPROVER" | "ADMIN" | "READONLY", 
    fairAssessments: (FairAssessment | null)[]
}) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [order, setOrder] = React.useState<Order>('desc');
    const [orderBy, setOrderBy] = React.useState<keyof Data>('lastmodified');
    const [queryString, setQueryString] = React.useState('')
    const [copyUserFiles, setCopyUserFiles] = React.useState<({
        dcc: {
            label: string;
            short_label: string | null;
        } | null;
        fileAsset: FileAsset | null;
        codeAsset: CodeAsset | null;
        assetType: string | null;
    } & DccAsset)[]>([])

    React.useEffect(() => {
        setCopyUserFiles([...userFiles.filter((item) => filterSearch(item, queryString))]);
      }, [userFiles, queryString]);

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
        () => {
            if (orderBy === 'dcc') {
                if (rowsPerPage === -1) {
                    return order === 'desc' ? copyUserFiles.sort(dccCompare) : copyUserFiles.sort(dccCompareAsc)
                } else {
                    return order === 'desc' ? copyUserFiles.sort(dccCompare).slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                    ) : copyUserFiles.sort(dccCompareAsc).slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                    )
                }
            }
            if (rowsPerPage === -1) {
                return stableSort(copyUserFiles, getComparator(order, orderBy))
            } else {
                return stableSort(copyUserFiles, getComparator(order, orderBy)).slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage,
                )
            }
        }, [order, orderBy, page, rowsPerPage, userFiles, copyUserFiles],
    );

    const [debouncedSortedData] = useDebounce(sortedData, 200); // Debounce after 200ms

    let symbolUserFiles;

    if ((role === 'DRC_APPROVER') || (role === 'ADMIN')) {
        symbolUserFiles = debouncedSortedData.map((userFile) => {
            let approvedSymbol = <ApprovalBtn {...userFile} dcc_drc='drc' />
            let approvedSymboldcc =<NotApprovedSymbol />
            let currentSymbol = <CurrentBtn {...userFile} />
            if (userFile.dccapproved) {
                approvedSymboldcc = <ApprovedSymbol />
            }
            let fairAssessment = fairAssessments.find((assessment) => assessment?.link === userFile.link)
            return (
                <FileRow userFile={userFile} approvedSymboldcc={approvedSymboldcc} approvedSymbol={approvedSymbol} currentSymbol={currentSymbol} role={role} fairAssessment={fairAssessment} />
            )
        })
    } else if (role === 'DCC_APPROVER') {
        symbolUserFiles = debouncedSortedData.map((userFile) => {
            let approvedSymboldcc = <ApprovalBtn {...userFile} dcc_drc='dcc' />
            let approvedSymbol = <NotApprovedSymbol />
            let currentSymbol = <CurrentBtn {...userFile} />
            if (userFile.drcapproved) {
                approvedSymbol = <ApprovedSymbol />
            }
            let fairAssessment = fairAssessments.find((assessment) => assessment?.link === userFile.link)
            return (<FileRow userFile={userFile} approvedSymboldcc={approvedSymboldcc} approvedSymbol={approvedSymbol} currentSymbol={currentSymbol} role={role} fairAssessment={fairAssessment}/>)
        })
    } else { // if readonly role or uploader
        symbolUserFiles = debouncedSortedData.map((userFile) => {
            let approvedSymboldcc = <NotApprovedSymbol />
            let approvedSymbol =  <NotApprovedSymbol />
            let currentSymbol =  <NotApprovedSymbol />
            if (userFile.dccapproved) {
                approvedSymboldcc = <ApprovedSymbol />
            }
            if (userFile.drcapproved) {
                approvedSymbol = <ApprovedSymbol />
            }
            if (userFile.current) {
                currentSymbol =  <ApprovedSymbol />
            }
            let fairAssessment = fairAssessments.find((assessment) => assessment?.link === userFile.link)
            return (
                <FileRow userFile={userFile} approvedSymboldcc={approvedSymboldcc} approvedSymbol={approvedSymbol} currentSymbol={currentSymbol} role={role} fairAssessment={fairAssessment}/>
            )
        })
    }

    return (
        <TableContainer component={Paper} sx={{ ml: 3 }}>
            <Search>
                <SearchIconWrapper>
                    <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                    placeholder="Search…"
                    inputProps={{ 'aria-label': 'search' }}
                    name='search'
                    onInput={(e) => setQueryString((e.target as HTMLFormElement).value)}
                />
            </Search>
            <Table sx={{ maxWidth: '100%'}} aria-label="uploaded files">
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
                            colSpan={10}
                            count={copyUserFiles.length}
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