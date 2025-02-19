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
            // Only select data on the current page
            setSelectedData(data);
        } else {
            const selectedIds = selectedRows.map(row => row.id);
            const newSelectedData = data.filter(row => selectedIds.includes(row.id));
            setSelectedData(newSelectedData);
        }
    };

    const selectedIds = selectedRows.map(row => row.id);
    const filteredSelectedData = data.filter(row => selectedIds.includes(row.id));

    const dataToSend = selectedRows.length > 0 ? (selectedIds.length === data.length ? data : filteredSelectedData) : selectedData;

    const hasSignificantData = (data: RowType[]) => {
        return data && data.length > 1 && Object.keys(data[0]).length > 1;
    };

    const significantDataExists = data && data.length > 0 && hasSignificantData(data);



    console.log(tablePrefix + " hasSignificantData = " + significantDataExists);

    return (
        <>
            {significantDataExists && (
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>{tableTitle}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <SearchablePagedTable
                            tablePrefix={tablePrefix}
                            p={searchParams.p}
                            r={searchParams.r}
                            count={count}
                            columns={colNames.map(column => (
                                getNameFromTable(tablePrefix)?.(column) || column
                            ))}
                            rows={data.map((row, rowIndex) => {
                                const renderedColumns: { [key: string]: React.ReactNode } = {};
                                dynamicColumns.forEach((column) => {
                                    const cellValue = row[column];
                                    const cellValueString = cellValue !== null ? String(cellValue) : 'NA';
                                    renderedColumns[column] = (column.toLowerCase().includes('persistent') || column.toLowerCase().includes('access'))
                                        && isURL(cellValueString) ? (
                                        <Link
                                            href={cellValueString}
                                            className="underline cursor-pointer text-blue-600"
                                            key={`${rowIndex}-${column}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {cellValueString}
                                        </Link>
                                    ) : (
                                        column.toLowerCase().includes('size_in_bytes') ? // matches substring 'size_in_bytes' in both "size_in_bytes" and "uncompressed_size_in_bytes"
                                            (
                                                <Description
                                                description={cellValueString == 'NA' ? 'NA' : formatFileSize(Number(cellValueString))}
                                                key={`${rowIndex}-${column}`}
                                            />
                                        )
                                            : (
                                                <Description
                                                description={cellValueString}
                                                key={`${rowIndex}-${column}`}
                                            />
                                        )
                                    );
                                });
                                return { id: row.id, ...renderedColumns };
                            })}
                            onRowSelect={handleRowSelect}
                        />
                        <div className="flex flex-row gap-4">
                            {drsBundle && <DRSBundleButton data={dataToSend} />}
                            <DownloadButton data={dataToSend} filename={downloadFileName} name={"Download Selected Metadata"} />
                            <DownloadButton data={full_data} filename={downloadFileName + "_ALL.json"} name={"Download All Metadata"} />
                        </div>
                    </AccordionDetails>
                </Accordion>
            )}
        </>
    );
};

export default ExpandableTable;
