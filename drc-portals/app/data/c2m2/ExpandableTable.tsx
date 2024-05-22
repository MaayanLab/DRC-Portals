'use client';
import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import SearchablePagedTable, { Description } from './SearchablePagedTable';
import DownloadButton from './DownloadButton';
import { isURL, getNameFromBiosampleTable, getNameFromSubjectTable, getNameFromCollectionTable, getNameFromFileProjTable } from './utils';
import Link from 'next/link';

// Function type definition
type TableFunction = (column: string) => string | undefined;

// Index interface
interface TableFunctionIndex {
    [key: string]: TableFunction | undefined;
}

interface ExpandableTableProps {
    data?: { [key: number]: string | bigint }[];
    full_data?: { [key: number]: string | bigint }[];
    downloadFileName?: string;
    drsBundle?: boolean;
    tableTitle: string;
    searchParams: {
        q?: string | null | undefined;
        p: number;
        r: number;
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
    const [selectedRows, setSelectedRows] = useState<{ [key: string]: any }[]>([]);
    const [selectedData, setSelectedData] = useState<{ [key: string]: string | bigint }[]>([]);

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
        return tableFunctions[tblnm]; // Return the function associated with the table name
    }

    if (!data || !full_data) return null;

    const handleRowSelect = (selectedRows: { [key: string]: any }[], selectAll: boolean) => {
        setSelectedRows(selectedRows);

        // If all rows are selected, set the selected data to the full data set
        if (selectAll) {
            setSelectedData(full_data);
        } else {
            // Otherwise, filter the full data based on selected row IDs
            const selectedIds = selectedRows.map(row => row.id);
            const newSelectedData = full_data.filter(row => selectedIds.includes(row.id));
            setSelectedData(newSelectedData);
        }
    };

    // Extracting IDs from selected rows
    const selectedIds = selectedRows.map(row => row.id);

    // Filtering full_data based on selected IDs
    const filteredSelectedData = full_data.filter(row => selectedIds.includes(row.id));

    const dataToSend = filteredSelectedData.length > 0 ? filteredSelectedData : selectedData;

    // Function to check if data has more than just ID columns and is not empty
    const hasSignificantData = (data: { [key: number]: string | bigint }[]) => {
        // length > 1 since for 1 row it becomes card data. Table is shown only for > 1
        return data && data.length > 1 && Object.keys(data[0]).length > 1;
    };

    // Check if the data is significant and not empty
    const significantDataExists = data && data.length > 0 && hasSignificantData(data);

    // Log for debugging purposes
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
                                getNameFromTable(tablePrefix)?.(column) || column // Use the function or the column name itself
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
                                        <Description description={cellValueString} key={`${rowIndex}-${column}`} />
                                    );
                                });
                                return { id: row.id, ...renderedColumns };
                            })}
                            onRowSelect={handleRowSelect}
                        />
                        <div className="flex flex-row gap-4">
                            {/*drsBundle && <DRSBundleButtondata={dataToSend} filename={downloadFileName} />*/}
                            <DownloadButton data={dataToSend} filename={downloadFileName} />
                        </div>
                    </AccordionDetails>
                </Accordion>
            )}
        </>
    );
};

export default ExpandableTable;
