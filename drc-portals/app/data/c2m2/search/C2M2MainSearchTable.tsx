// C2M2MainSearchTable.jsx
'use client'
import React, { useState } from 'react';
import SearchablePagedTable from '../SearchablePagedTable'; // Adjust the import path as necessary
import DownloadButton from '../DownloadButton'; // Adjust the import path as necessary

interface C2M2MainSearchTableProps {
    label?: string;
    q?: string;
    p: number;
    r: number;
    count?: number;
    t?: { type: string; entity_type: string | null; }[] | undefined;
    columns: React.ReactNode[];
    rows: { [key: string]: any }[];
    tablePrefix: string;
    data?: { [key: string]: string | bigint | number; }[];
    downloadFileName: string;
}

const C2M2MainSearchTable: React.FC<C2M2MainSearchTableProps> = (props) => {
    const [selectedRows, setSelectedRows] = useState<{ [key: string]: any }[]>([]);
    const [selectedData, setSelectedData] = useState<{ [key: string]: string | bigint | number; }[]>([]);

    const handleRowSelect = (rows: { [key: string]: any }[]) => {
        setSelectedRows(rows);

        // Logging indices of selected rows
        const selectedIndices = rows.map(row => props.rows.indexOf(row));
        console.log('Selected rows indices:', selectedIndices);

        // Filter the data array based on selected rows indices
        if (props.data) {
            const newData = selectedIndices.map(index => props.data![index]);
            setSelectedData(newData);
        }
    };

    return (
        <div>
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
            <DownloadButton data={selectedData} filename={props.downloadFileName} />
        </div>
    );
};

export default C2M2MainSearchTable;