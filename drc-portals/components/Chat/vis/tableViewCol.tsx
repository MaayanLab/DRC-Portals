import React, { useState } from 'react';
import classNames from 'classnames';
import { string } from 'zod';

export default function TableViewCol({rowData, columns, rename, link, linkFragmentRow}: {rowData: any, columns?: string[] | null, rename?: {[key: string]: string}, link?:{[key:string]:string}, linkFragmentRow?:{[key:string]:string}}) {
    const [currentPage, setCurrentPage] = useState(1);

    console.log(rowData);
    if (rowData.length == 0) {
        return <>No Data.</>
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
                    //special renamings and returns
                    if(rename!=null&&rename[columnName]){
                        columnName = rename[columnName]
                    }
                    if(link!=null&&link[columnName]){
                        if(linkFragmentRow&&linkFragmentRow[columnName]&&row[linkFragmentRow[columnName]]){
                            const cellValue = row[columnName];
                            return <td key={columnName}>{<a href={link[columnName]+encodeURIComponent(row[linkFragmentRow[columnName]])} target="_blank">{cellValue}</a>}</td>;
                        }
                        const cellValue = row[columnName];
                        return <td key={columnName}>{<a href={link[columnName]+row[columnName]} target="_blank">{cellValue}</a>}</td>;

                    }
                    //link exceptions
                    if (columnName=="HuBMAP ID"&&row["DOI URL"]){
                        const cellValue = row[columnName];
                        return <td key={columnName}>{<a href={row["DOI URL"]} target="_blank">{cellValue}</a>}</td>;
                    }
                    else if (columnName=="HuBMAP ID"){
                        const cellValue = row[columnName];
                        return <td key={columnName}>{<a href={"https://portal.hubmapconsortium.org/browse/dataset/"+row["uuid"].replace(".","%2E")} target="_blank">{cellValue}</a>}</td>;
                    }
                    if (columnName=="SenNet ID"&&row["DOI URL"]){
                        const cellValue = row[columnName];
                        return <td key={columnName}>{<a href={row["DOI URL"]} target="_blank">{cellValue}</a>}</td>;
                    }
                    else if (columnName=="SenNet ID"){
                        const cellValue = row[columnName];
                        return <td key={columnName}>{<a href={"https://data.sennetconsortium.org/dataset?uuid="+row["uuid"]} target="_blank">{cellValue}</a>}</td>;
                    }
                    if(columnName=="assessed_biomarker_entity_id"){
                        const cellValue = row[columnName];                        
                        const links = cellValue.split(";")
                        const linksList = links.map((link:any,index:any)=>(
                            <span key={index}>
                                <a href={`https://www.glygen.org/global-search-result/${link.trim()}`} target="_blank" rel="noopener noreferrer">
                                    {link.trim()}
                                </a>
                                {index < links.length - 1 && ', '}
                            </span>
                        ))
                        
                        return (
                            <td key={columnName}>
                                {linksList}
                            </td>
                        )
                    }

                    // default return
                    const cellValue = row[columnName];
                    const formattedValue = typeof cellValue === 'number' && !Number.isInteger(cellValue) ? cellValue.toFixed(3) : cellValue; //formats decimals
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
