import React, { useState } from 'react';
import classNames from 'classnames';

export default function TableViewIMPC({rowData, columns}: {rowData: any, columns?: string[] | null}) {
    const [currentPage, setCurrentPage] = useState(1);


    if (rowData.length == 0) {
        return <>No associated phenotypes were found from IMPC.</>
    }

    try {
        var columnNames = columns;

        if (!columns) {
            columnNames = Object.keys(rowData[0]);
        }


        // Define the number of entries to show per page.
        const entriesPerPage = 10;
        // Calculate the range of rows to display based on the current page.
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;

        const tableHeader = columnNames?.map((columnName) => (
            <th key={columnName} className='text-slate-800'>{columnName}</th>
        ));

        const tableRows = rowData.slice(startIndex, endIndex).map((row: any, i: number) => (
            <tr key={i}>
                {columnNames?.map((columnName) => {
                    const cellValue = row[columnName];
                    const formattedValue = typeof cellValue === 'number' && !Number.isInteger(cellValue) ? cellValue.toFixed(3) : cellValue;
                    if (formattedValue != null)
                        return <td key={columnName}>{formattedValue}</td>;
                    else
                        return <td key={columnName}>nan</td>
                })}
            </tr>
        ));

        const totalPages = Math.ceil(rowData.length / entriesPerPage);

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
            <div className='overflow-x-auto'>
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
                <div className='text-center m-2 space-x-2'>
                    <button className={classNames('px-2 btn-sm border rounded', { 'font-extrabold opacity-100 border-2': currentPage != 1 })} onClick={handlePreviousPage} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <button className={classNames('px-2 btn-sm border rounded', { 'font-extrabold opacity-100 border-2 ': currentPage != totalPages })} onClick={handleNextPage} disabled={currentPage === totalPages}>
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
