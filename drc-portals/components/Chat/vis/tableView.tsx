import React, { useState } from 'react';
import classNames from 'classnames';

export default function TableView(rowData: any) {
    const [currentPage, setCurrentPage] = useState(1);

    try {
    const columnNames = Object.keys(rowData.rowData);
    const rowKeys = Object.keys(rowData.rowData[columnNames[0]]);

    // Define the number of entries to show per page.
    const entriesPerPage = 10;
    
    // Calculate the range of rows to display based on the current page.
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;

    const tableHeader = columnNames.map((columnName) => (
        <th key={columnName}>{columnName}</th>
    ));

    const tableRows = rowKeys.slice(startIndex, endIndex).map((perturbagenName) => (
        <tr key={perturbagenName}>
            {columnNames.map((columnName) => {
                const cellValue = rowData.rowData[columnName][perturbagenName];
                const formattedValue = typeof cellValue === 'number' && !Number.isInteger(cellValue) ? cellValue.toFixed(3) : cellValue;
                return <td key={columnName}>{formattedValue}</td>;
            })}
        </tr>
    ));

    const totalPages = Math.ceil(rowKeys.length / entriesPerPage);

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
        <div className=''>
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
                <button className={classNames('btn-sm mr-1 p-1 border rounded opacity-50', { 'font-extrabold opacity-100': currentPage != 1 })} onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <button className={classNames('btn-sm ml-1 p-1 border rounded opacity-50', { 'font-extrabold opacity-100': currentPage != totalPages })} onClick={handleNextPage} disabled={currentPage === totalPages}>
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
