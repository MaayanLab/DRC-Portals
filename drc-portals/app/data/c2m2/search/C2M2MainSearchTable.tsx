'use client'
import React, { useState } from 'react';
import SearchablePagedTable from '../SearchablePagedTable'; // Adjust the import path as necessary
import DownloadButton from '../DownloadButton'; // Adjust the import path as necessary
import { RowType } from '../utils';
import DownloadAllButton from '../DownloadAllButton';
import { Box } from '@mui/material'; // If you're using Material-UI

interface C2M2MainSearchTableProps {
    label?: string;
    q?: string;
    p: number;
    r: number;
    count?: number;
    t?: { type: string; entity_type: string | null; }[] | undefined;
    columns: React.ReactNode[];
    rows: RowType[];
    tablePrefix: string;
    data?: { [key: string]: string | bigint | number; }[];
    downloadFileName: string;
    apiEndpoint: string;
}

const C2M2MainSearchTable: React.FC<C2M2MainSearchTableProps> = (props) => {
    const [selectedRows, setSelectedRows] = useState<{ [key: string]: any }[]>([]);
    const [selectedData, setSelectedData] = useState<{ [key: string]: string | bigint | number; }[]>([]);

    const handleRowSelect = (rows: RowType[], selectAll: boolean) => {
        setSelectedRows(rows);

        if (selectAll && props.data) {
            setSelectedData(props.data);
        } else {
            const selectedIndices = rows.map(row => props.rows.indexOf(row));
            const newData = selectedIndices.map(index => props.data![index]);
            setSelectedData(newData);
        }
    };

    return (
        <div>
            {/* Conditionally render DownloadButton and DownloadAllButton side by side */}
            {selectedRows.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}> {/* Flexbox layout for side-by-side alignment */}
                    <DownloadButton
                        data={selectedData}
                        filename={props.downloadFileName}
                        name="DOWNLOAD SELECTED"
                    />
                    <DownloadAllButton
                        apiEndpoint={props.apiEndpoint}
                        filename={props.downloadFileName} // Optional: Specify a filename
                        name="DOWNLOAD ALL"   // Optional: Specify a button name
                        q={props.q ?? ''}
                        t={props.t}
                    />
                </Box>
            )}

            <SearchablePagedTable
                label={props.label}
                q={props.q}
                p={props.p}
                r={props.r}
                count={props.count}
                t={props.t}
                columns={props.columns}
                rows={props.rows}
                tablePrefix={props.tablePrefix}
                onRowSelect={handleRowSelect}
            />
        </div>
    );
};

export default C2M2MainSearchTable;
