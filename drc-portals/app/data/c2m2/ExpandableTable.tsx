import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordionDetails } from '@mui/material';
import SearchablePagedTable, { Description } from "@/app/data/c2m2/SearchablePagedTable";
import DownloadButton from "./DownloadButton";
import DRSBundleButton from "./DRSBundleButton";
import { isURL } from './utils';
import Link from 'next/link';

interface ExpandableTableProps {
    data?: { [key: string]: string | bigint; }[];
    full_data?: { [key: string]: string | bigint; }[];
    downloadFileName?: string;
    drsBundle?: boolean;
    tableTitle: string;
    searchParams: {
        q?: string | null | undefined;
        p: number;
        r: number;
        // Include additional properties if they're used
    };
    count: number;
    colNames: string[];
    dynamicColumns: string[];
    getNameFromTable?: (column: string) => string; // Optional: Function to get column names
    tablePrefix: string; // Add tablePrefix here
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
    getNameFromTable,
    tablePrefix, // Destructure tablePrefix here
}) => {
    if (!data || !full_data) return null; // Return nothing if data or full_data is undefined

    return (
        <>
            {data.length > 1 && (
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>{tableTitle}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {/* Assuming SearchablePagedTable can accept this new data format directly or is similarly adjusted */}
                        <SearchablePagedTable
                            tablePrefix={tablePrefix} // Pass the tablePrefix prop here
                            // q={searchParams.q ?? ''}
                            p={searchParams.p}
                            r={searchParams.r}
                            count={count}
                            columns={colNames.map(column => (
                                getNameFromTable ? getNameFromTable(column) : column
                            ))}
                            rows={data.map(row => (
                                dynamicColumns.map(column => (
                                    // Render persistent_id as hyperlink if it's a URL
                                    ( (column.toLowerCase().includes('persistent') || column.toLowerCase().includes('access')) 
                                    && isURL(row[column]) ) ? (
                                        <Link href={row[column]}
                                         className="underline cursor-pointer text-blue-600"
                                            key={column} target="_blank" rel="noopener noreferrer">
                                            {row[column]}
                                        </Link> 
                                    ) : (
                                        // Ensure bigint values are converted to string
                                        <Description description={row[column] !== null ? String(row[column]) : 'NA'} key={column} />
                                    )
                                ))
                            ))}
                        />
                        <div className="flex flex-row gap-4">
                            {drsBundle && <DRSBundleButton data={full_data} />}
                            <DownloadButton data={full_data} filename={downloadFileName} />
                        </div>
                    </AccordionDetails>
                </Accordion>
            )}
        </>
    );
};

export default ExpandableTable;

// To replace drs:// with https:// : //{ /* row[column].startsWith('drs://') ? row[column].replace(/^drs:\/\//i, 'https://') : row[column] */ }
// To not show drs:// in display: { /* row[column].startsWith('drs://')?row[column].substring(6):row[column] */}