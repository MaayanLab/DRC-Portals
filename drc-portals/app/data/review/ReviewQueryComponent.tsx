import prisma from '@/lib/prisma/c2m2';
import { Accordion, Grid } from '@mui/material/';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import { useSanitizedSearchParams } from "@/app/data/review/utils";
import ReviewDisplay from './ReviewDisplay';
import SchemaFilter from './SchemaFilter';
import TableFilter from './TableFilter';
import { CountDisplay } from './CountDisplay';
import SQL from '@/lib/prisma/raw';
import { schemaToDCC } from './utils';
import { Suspense } from 'react';

type PageProps = { searchParams: Record<string, string>, tab?: boolean };

export async function ReviewQueryComponent(props: PageProps) {
    const searchParams = useSanitizedSearchParams(props);

    console.log("In ReviewQueryComponent");

    if (!searchParams.schema_name) {
        return <SchemaFilter />;
    }

    try {
        const tables_counts = await CountDisplay(searchParams.schema_name)
        const table_names_for_schema = tables_counts?.map(item => ({ table: item.tablename, label: item.tablename }));
        const schemaEntry = schemaToDCC.find(item => item.schema === searchParams.schema_name);
        // const summary_table_name = (schemaEntry ? schemaEntry.label : searchParams.schema_name);
        const schemaName = schemaEntry ? schemaEntry.label : searchParams.schema_name;
        // const summary_table_title = "Count Summary for " + (schemaEntry ? schemaEntry.label : searchParams.schema_name) + " (schema: " + (schemaEntry ? schemaEntry.schema : searchParams.schema_name) + ")";
        const summary_table_title = (
            <>
                Count Summary for <strong>{schemaEntry ? schemaEntry.label : searchParams.schema_name}</strong> (schema: {schemaEntry ? schemaEntry.schema : searchParams.schema_name})
            </>
        );
        if (!searchParams.table_name || !table_names_for_schema.find(t => t.table === searchParams.table_name)) {
            return (
                <>
                    <SchemaFilter selectedFilter={searchParams.schema_name} />
                    {table_names_for_schema && table_names_for_schema.length > 0 && (
                        <>
                            <TableFilter tableNames={table_names_for_schema} selectedValue={table_names_for_schema.find(t => t.table === searchParams.table_name)} />
                            <ReviewDisplay result={tables_counts} title={summary_table_title} />
                        </>
                    )}
                </>
            );
        }

        const results = await fetchReviewQueryResults(searchParams, table_names_for_schema, tables_counts, summary_table_title);
        return results;
    } catch (error) {
        console.error('Error fetching review query results:', error);
        return <SchemaFilter />;
    }
}

async function fetchReviewQueryResults(searchParams: any, tableNames: { table: string, label: string }[], tables_counts: { tablename: string, count: number }[], summary_table_title: string) {
    const schema_name = searchParams.schema_name;
    const table_name = searchParams.table_name;

    console.log("Schema name = " + schema_name);
    console.log("Table name = " + table_name);

    const validSchemas = schemaToDCC.map((item) => item.schema);
    const validTables = tableNames.map((item) => item.table);

    if (!validSchemas.includes(schema_name) || !validTables.includes(table_name)) {
        throw new Error("Invalid schema or table name");
    }

    const query = SQL.template`
        SELECT * FROM "${SQL.assert_in(schema_name, validSchemas)}"."${SQL.assert_in(table_name, validTables)}"
    `.toPrismaSql();

    const selected_table_rows = await prisma.$queryRaw(query);

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <SchemaFilter selectedFilter={schema_name} />
                </Grid>
                <Grid item xs={6}>
                    <TableFilter tableNames={tableNames} selectedValue={tableNames.find(t => t.table === table_name)} />
                </Grid>
            </Grid>
            <br></br>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>{summary_table_title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <ReviewDisplay result={tables_counts}
                        title={""}
                    />
                </AccordionDetails>
            </Accordion>
            <br></br>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>Records from table <strong>{table_name}</strong></Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Suspense fallback={<div>Loading...</div>}>
                        <ReviewDisplay result={selected_table_rows} title={""} />
                    </Suspense>
                </AccordionDetails>
            </Accordion>
        </>
    );
}
