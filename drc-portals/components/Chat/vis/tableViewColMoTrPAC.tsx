import React, { useState } from 'react';
import classNames from 'classnames';

export default function TableViewColMoTrPAC({rowData, columns, removeIndexes = [], significance}: {rowData: any, columns?: string[] | null, removeIndexes?: number[], significance?: boolean}) {
    const [currentPage, setCurrentPage] = useState(1);

    console.log(rowData);
    if (rowData.length == 0) {
        return <>No Data.</>
    }

    try {
        var columnNames = columns || Array.from({ length: rowData[0].length }, (_, i) => `Column ${i + 1}`);

        columnNames = columnNames.filter((_, i) => !removeIndexes.includes(i));

        // Define the number of entries to show per page.
        const entriesPerPage = 10;
        // Calculate the range of rows to display based on the current page.
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;

        const tableHeader = columnNames?.map((columnName) => (
            <th key={columnName} className='text-slate-800'>{columnName}</th>
        ));
        const assayDisplayKeys: { [key: string]: string }  = {
            "transcript-rna-seq": "RNA-seq",
            "epigen-atac-seq": "ATAC-seq",
            "epigen-rrbs": "RRBS",
            "immunoassay": "Immunoassay",
            "metab-t-acoa": "Targeted Acyl-CoA",
            "metab-t-amines": "Targeted Amines",
            "metab-t-etamidpos": "Targeted Ethanolamides",
            "metab-t-ka": "Targeted Keto Acids",
            "metab-t-nuc": "Targeted Nucleotides",
            "metab-t-oxylipneg": "Targeted Oxylipins",
            "metab-t-tca": "Targeted Tricarboxylic Acid Cycle",
            "metab-u-hilicpos": "Untargeted HILIC-Positive",
            "metab-u-ionpneg": "Untargeted Ion-Pair Negative",
            "metab-u-lrpneg": "Untargeted Lipidomics Reversed-Phase Negative",
            "metab-u-lrppos": "Untargeted Lipidomics Reversed-Phase Positive",
            "metab-u-rpneg": "Untargeted Reversed-Phase Negative",
            "metab-u-rppos": "Untargeted Reversed-Phase Positive",
            "prot-pr": "Global Proteomics",
            "prot-ph": "Phosphoproteomics",
            "prot-ac": "Acetyl Proteomics",
            "prot-ub": "Protein Ubiquitination",
            "prot-ub-protein-corrected": "Protein Ubiquitination"
          }
        const tableRows = rowData.slice(startIndex, endIndex).map((row: any, i: any) => (
            <tr key={i}>
                {row.filter((_: any, j: number) => !removeIndexes.includes(j)).map((cellValue: any, j: any) => {
                    if (j == 0) {
                        cellValue = cellValue.toUpperCase()//GeneSymbol->All caps
                    } 
                    if(j == 3){
                        cellValue = assayDisplayKeys[cellValue]
                    }
                    const isNumber = !isNaN(parseFloat(cellValue)) && isFinite(cellValue);
                    const formattedValue = isNumber && !Number.isInteger(parseFloat(cellValue)) ? parseFloat(cellValue).toFixed(3) : cellValue;                    
                    if (formattedValue != null)
                        return <td key={j}>{formattedValue}</td>;
                    else
                        return <td key={j}>nan</td>
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
