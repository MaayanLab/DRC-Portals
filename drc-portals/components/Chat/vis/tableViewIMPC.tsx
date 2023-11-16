import React, { useState } from 'react';
import classNames from 'classnames';

export default function TableViewIMPC(rowData: any) {
    const [currentPage, setCurrentPage] = useState(1);

    const columns = [
        'marker_accession_id',
        'mp_term_id',
        'mp_term_name',
        'assertion_type',
        'p_value',
        'percentage_change',
        'statistical_method',
    ]

    if (rowData.rowData.length == 0) {
        return <>No associated phenotypes were found from IMPC.</>
    }

    try {
        const columnNames = columns

        // Define the number of entries to show per page.
        const entriesPerPage = 10;
        // Calculate the range of rows to display based on the current page.
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;

        const tableHeader = columnNames.map((columnName) => (
            <th key={columnName} className='text-slate-800'>{columnName}</th>
        ));

        const tableRows = rowData.rowData.slice(startIndex, endIndex).map((row: any, i: number) => (
            <tr key={i}>
                {columnNames.map((columnName) => {
                    const cellValue = row[columnName];
                    const formattedValue = typeof cellValue === 'number' && !Number.isInteger(cellValue) ? cellValue.toFixed(3) : cellValue;
                    if (formattedValue != null)
                        return <td key={columnName}>{formattedValue}</td>;
                    else
                        return <td key={columnName}>nan</td>
                })}
            </tr>
        ));

        const totalPages = Math.ceil(rowData.rowData.length / entriesPerPage);

        const handlePreviousPage = () => {
            if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        };

        const handleNextPage = () => {
            if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
            }
        };

        return (
            <div className='overflow-x-scroll'>
                <table className="table-xs text-slate-200 border-b-2">
                    <thead>
                        <tr>
                            {tableHeader}
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
                <div className='text-center m-2'>
                    <button className={classNames('btn-sm border rounded opacity-50', { 'font-bold opacity-100': currentPage != 1 })} onClick={handlePreviousPage} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <button className={classNames('btn-sm border rounded opacity-50', { 'font-bold opacity-100': currentPage != totalPages })} onClick={handleNextPage} disabled={currentPage === totalPages}>
                        Next
                    </button>
                    <p className={'text-sm mt-1'}>Page {currentPage} of {totalPages}</p>
                </div>
            </div>
        );
    } catch (e) {
        console.log(e)
        return (<>No data found.</>)
    }
}
