'use client'
import React, { useState } from 'react';
import SearchablePagedTable from '../SearchablePagedTable'; // Adjust the import path as necessary
import DownloadButton from '../DownloadButton'; // Adjust the import path as necessary
import { RowType } from '../utils';
import FormPagination from '../FormPagination'; // Import FormPagination

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
}

const C2M2MainSearchTable: React.FC<C2M2MainSearchTableProps> = (props) => {
    const [selectedRows, setSelectedRows] = useState<{ [key: string]: any }[]>([]);
    const [selectedData, setSelectedData] = useState<{ [key: string]: string | bigint | number; }[]>([]);
    const [currentPage, setCurrentPage] = useState(props.p);

    const handleRowSelect = (rows: RowType[], selectAll: boolean) => {
        setSelectedRows(rows);

        if (selectAll) {
            // Handle 'All' case: fetch or use all data
            if (props.r === 'All' && props.data) {
                setSelectedData(props.data);
            } else {
                // Handle data when not 'All'
                setSelectedData(props.data || []);
            }
        } else {
            // Calculate indices based on current page
            const rowsPerPage = props.r === 'All' ? props.data?.length || 0 : props.r;
            const startIndex = (currentPage - 1) * rowsPerPage;
            const selectedIndices = rows.map(row => props.rows.indexOf(row) + startIndex);
            const newData = selectedIndices.map(index => props.data ? props.data[index] : null).filter(data => data !== null);
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
            <FormPagination 
                p={props.p} 
                r={props.r} 
                count={props.count} 
                tablePrefix={props.tablePrefix} 
                onPageChange={setCurrentPage} // Pass callback to get page information
            />
            <DownloadButton data={selectedData} filename={props.downloadFileName} />
        </div>
    );
};

export default C2M2MainSearchTable;