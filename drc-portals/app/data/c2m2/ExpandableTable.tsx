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
import { isURL, isDRS, getNameFromBiosampleTable, getNameFromSubjectTable, getNameFromCollectionTable, getNameFromFileProjTable, getNameFromBiosampleSubjectTable } from './utils';
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
        t?: { type: string; entity_type: string; }[] | undefined;
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
        bioSamplSubTbl: getNameFromBiosampleSubjectTable,
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
                        {/* <div className="flex flex-wrap gap-4 mb-4">
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
                        </div> */}
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
                                    ) : isDRS(cellValueString) ? (
                                        <Link href={`/data/drs?q=${encodeURIComponent(cellValueString)}`} className="underline text-blue-600" target="_blank" rel="noopener noreferrer">
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

/*

Example of testing record_info with more than one file format:
Go through the count_ff in:
select * from (select distinct id_namespace, project_local_id, assay_type, data_type, count(distinct file_format) as count_ff from c2m2.file group by id_namespace, project_local_id, assay_type, data_type) where count_ff > 1;
Select something that has > 1 file format.
E.g., from 4DN, search for: 91b694c3-f4d7-4ddd-8278-16f94e15c1c5 and select the first record
https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=91b694c3-f4d7-4ddd-8278-16f94e15c1c5&t=dcc_name:4D%20NUCLEOME%20DATA%20COORDINATION%20AND%20INTEGRATION%20CENTER|project_local_id:91b694c3-f4d7-4ddd-8278-16f94e15c1c5|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:blood%20cell|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Annotation%20track|assay_type_name:DamID-seq

Another example: https://ucsd-sslab.ngrok.app/data/search/PR000319/c2m2 (search: PR000319)

From SPARC: search: OT2OD023847

https://ucsd-sslab.ngrok.app/data/search/OT2OD023847/c2m2
Try first or any other record

*/