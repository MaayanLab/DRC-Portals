// ExpandableTable.tsx
import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordionDetails } from '@mui/material';
import SearchablePagedTable, { Description } from "@/app/data/c2m2/SearchablePagedTable";
import DownloadButton from "./DownloadButton";

interface ExpandableTableProps {
    data?: { [key: string]: string | bigint; }[];
    full_data?: { [key: string]: string | bigint; }[];
    downloadFileName?: string;
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
  }
  

  const ExpandableTable: React.FC<ExpandableTableProps> = ({
    data,
    full_data,
    downloadFileName,
    tableTitle,
    searchParams,
    count,
    colNames,
    dynamicColumns,
    getNameFromTable,
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
                //q={searchParams.q ?? ''}
                p={searchParams.p}
                r={searchParams.r}
                count={count}
                columns={colNames.map(column => (
                    getNameFromTable ? getNameFromTable(column) : column
                ))}
                rows={data.map(row => (
                  dynamicColumns.map(column => (
                    // Ensure bigint values are converted to string
                    <Description description={row[column] !== null ? String(row[column]) : 'NA'} key={column} />
                  ))
                ))}
              />
              <DownloadButton data={full_data} filename={downloadFileName}/>
            </AccordionDetails>
          </Accordion>
        )}
      </>
    );
  };
  
  
 
  
  export default ExpandableTable;

