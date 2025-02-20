'use client';
import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import SearchablePagedTable, { Description } from './SearchablePagedTable';
import DownloadButton from './DownloadButton';
import DRSBundleButton from './DRSBundleButton';
import { isURL, getNameFromBiosampleTable, getNameFromSubjectTable, getNameFromCollectionTable, getNameFromFileProjTable } from './utils';
import Link from '@/utils/link';
import { RowType, formatFileSize } from './utils';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

type TableFunction = (column: string) => string | undefined;

interface TableFunctionIndex {
    [key: string]: TableFunction | undefined;
}

interface ExpandableTableProps {
    data?: RowType[];
    full_data?: RowType[];
    downloadFileName?: string;
    drsBundle?: boolean;
    tableTitle: string;
    searchParams: {
        q?: string | null | undefined;
        p: number;
        r: number;
        t?: { type: string; entity_type: string | null; }[] | undefined;
    };
    count: number;
    colNames: string[];
    dynamicColumns: string[];
    tablePrefix: string;
}

const ExpandableTable: React.FC<ExpandableTableProps> = ({
    data,
    full_data,
    downloadFileName,
    drsBundle,
    tableTitle,
    searchParams,
    count,
    colNames,
    dynamicColumns,
    tablePrefix,
}) => {
    const [selectedRows, setSelectedRows] = useState<RowType[]>([]);
    const [selectedData, setSelectedData] = useState<RowType[]>([]);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});

    const tableFunctions: TableFunctionIndex = {
        bioSamplTbl: getNameFromBiosampleTable,
        subTbl: getNameFromSubjectTable,
        colTbl: getNameFromCollectionTable,
        fileProjTbl: getNameFromFileProjTable,
        fileSubTbl: getNameFromFileProjTable,
        fileBiosTbl: getNameFromFileProjTable,
        fileColTbl: getNameFromFileProjTable
    };

    function getNameFromTable(tblnm: string): ((column: string) => string | undefined) | undefined {
        return tableFunctions[tblnm];
    }

    if (!data || !full_data) return null;

    const handleRowSelect = (selectedRows: RowType[], selectAll: boolean) => {
        setSelectedRows(selectedRows);
        if (selectAll) {
            setSelectedData(data);
        } else {
            const selectedIds = selectedRows.map(row => row.id);
            const newSelectedData = data.filter(row => selectedIds.includes(row.id));
            setSelectedData(newSelectedData);
        }
    };

    const handleFilterChange = (column: string, value: string) => {
        setFilters(prev => ({ ...prev, [column]: value }));
    };

    const filteredData = data.filter(row => {
        return Object.entries(filters).every(([column, value]) => {
            return value === '' || String(row[column]) === value;
        });
    });

    return (
        <>
            {data.length > 1 && (
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{tableTitle}</Typography>
                        <div className="flex flex-wrap gap-4 mb-4">
                            {dynamicColumns.map(column => {
                                const uniqueValues = Array.from(new Set(data.map(row => row[column] || '')));
                                if (column == 'file_format_name') {
                                    return (
                                        <FormControl key={column} sx={{ minWidth: 150, backgroundColor: '#CAD2E9', fontWeight: 'bold' }}>
                                            <InputLabel>{getNameFromTable(tablePrefix)?.(column)}</InputLabel>
                                            <Select
                                                value={filters[column] || ''}
                                                onChange={e => handleFilterChange(column, e.target.value)}
                                            >
                                                <MenuItem value="">All</MenuItem>
                                                {uniqueValues.map(value => (
                                                    <MenuItem key={value} value={value}>{value}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    );
                                } else {
                                    return (
                                        <div></div>
                                    )
                                }
                            })}
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>

                        <SearchablePagedTable
                            tablePrefix={tablePrefix}
                            p={searchParams.p}
                            r={searchParams.r}
                            count={count}
                            columns={colNames.map(column => getNameFromTable(tablePrefix)?.(column) || column)}
                            rows={filteredData.map(row => {
                                const renderedColumns: { [key: string]: React.ReactNode } = {};
                                dynamicColumns.forEach(column => {
                                    const cellValue = row[column];
                                    const cellValueString = cellValue !== null ? String(cellValue) : 'NA';
                                    renderedColumns[column] = isURL(cellValueString) ? (
                                        <Link href={cellValueString} className="underline text-blue-600" target="_blank" rel="noopener noreferrer">
                                            {cellValueString}
                                        </Link>
                                    ) : column.toLowerCase().includes('size_in_bytes') ? (
                                        <Description description={cellValueString === 'NA' ? 'NA' : formatFileSize(Number(cellValueString))} />
                                    ) : (
                                        <Description description={cellValueString} />
                                    );
                                });
                                return { id: row.id, ...renderedColumns };
                            })}
                            onRowSelect={handleRowSelect}
                        />
                        <div className="flex flex-row gap-4">
                            {drsBundle && <DRSBundleButton data={selectedData} />}
                            <DownloadButton data={selectedData} filename={downloadFileName} name="Download Selected Metadata" />
                            <DownloadButton data={full_data} filename={`${downloadFileName}_ALL.json`} name="Download All Metadata" />
                        </div>
                    </AccordionDetails>
                </Accordion>
            )}
        </>
    );
};

export default ExpandableTable;
