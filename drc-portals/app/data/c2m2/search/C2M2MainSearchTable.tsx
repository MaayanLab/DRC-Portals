'use client';
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
    const [isSelectAll, setIsSelectAll] = useState(false);

    const handleRowSelect = (rows: RowType[], selectAll: boolean) => {
        setSelectedRows(rows);
        setIsSelectAll(selectAll); // Track whether "Select All" is selected

        if (selectAll && props.data) {
            setSelectedData(props.data); // When all rows are selected
        } else {
            const selectedIndices = rows.map(row => props.rows.indexOf(row));
            const newData = selectedIndices.map(index => props.data![index]);
            setSelectedData(newData); // When specific rows are selected
        }
    };

    return (
        <div>
            {/* Conditionally render DownloadButton and DownloadAllButton based on selected rows */}
            {selectedRows.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <DownloadButton
                        data={selectedData}
                        filename={props.downloadFileName}
                        name="DOWNLOAD SELECTED"
                    />
                    {isSelectAll && ( // Show Download All only when "Select All" is selected
                        <DownloadAllButton
                            apiEndpoint={props.apiEndpoint}
                            filename={props.downloadFileName}
                            name="DOWNLOAD ALL"
                            q={props.q ?? ''}
                            t={props.t}
                        />
                    )}
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
