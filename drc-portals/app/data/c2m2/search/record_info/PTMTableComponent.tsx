import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import React from 'react';
import Link from "@/utils/link";
import { isURL, MetadataItem, pruneAndRetrieveColumnNames, generateHashedJSONFilename, addCategoryColumns, getNameFromPTMTable, Category } from "@/app/data/c2m2/utils";
import ExpandableTable from "@/app/data/c2m2/ExpandableTable";
import { Grid, Typography, Card, CardContent } from "@mui/material";
import DownloadButton from "../../DownloadButton";

interface PTMTableResult {
    ptm_table_full: {
        ptm_id: string,
        protein: string,
        site_one: string,
        aa_site_one: string,
        site_two:  string,
        aa_site_two: string
    }[];
    ptm_table: {
        ptm_id: string,
        protein: string,
        site_one: string,
        aa_site_one: string,
        site_two:  string,
        aa_site_two: string
    }[];
    count_col: number;
}

const renderMetadataValue = (item: MetadataItem) => {
    if (typeof item.value === 'string' && item.label === 'Persistent ID' && isURL(item.value)) {
        return (
            <Link href={item.value} className="underline cursor-pointer text-blue-600" target="_blank" rel="noopener noreferrer" key={item.value}>
                {item.value}
            </Link>
        );
    }
    return item.value;
};

export default async function PTMTableComponent({ searchParams, filterClause, ptmTblOffset, limit }: { searchParams: any, filterClause: SQL, ptmTblOffset: number, limit: number }): Promise<JSX.Element> {
    console.log("In PTMTableComponent");
    console.log("q = " + searchParams.q);

    try {
        const query = SQL.template`
            WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q})
                ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
                ORDER BY rank DESC
            ), 
            ptm_table AS (
                SELECT DISTINCT
                    allres_full.collection_id_namespace,
                    allres_full.collection_local_id,
                    
                FROM allres_full
                LEFT JOIN c2m2.collection ON (c2m2.collection.local_id = allres_full.collection_local_id)
            ),
            ptm_table_limited AS (
                SELECT * 
                FROM ptm_table
                OFFSET ${ptmTblOffset}
                LIMIT ${limit}
            ),
            count_col AS (
                SELECT count(*)::int as count
                FROM ptm_table
            )
            SELECT
                (SELECT count FROM count_col) as count_col,
                (SELECT COALESCE(jsonb_agg(ptm_table_limited.*), '[]'::jsonb) FROM ptm_table_limited) AS ptm_table,
                (SELECT COALESCE(jsonb_agg(ptm_table.*), '[]'::jsonb) FROM ptm_table) AS ptm_table_full
        `.toPrismaSql();

        const t0: number = performance.now();
        const results = await prisma.$queryRaw<PTMTableResult[]>(query);
        const t1: number = performance.now();
        console.log("Elapsed time for PTMTableComponent queries: ", t1 - t0, " milliseconds");

        if (!results || results.length === 0) {
            return <div></div>;
        }

        // Assuming you want to process the first result in the array
        const firstResult = results[0];
        const countCol = firstResult.count_col ?? 0;
        const ptmTable = firstResult.ptm_table ?? [];
        const ptmTableFull = firstResult.ptm_table_full ?? [];

        if (ptmTable.length === 0 || ptmTableFull.length === 0) {
            return <div>No ptms data found.</div>;
        }

        const PTMTableTitle = "PTMs: " + countCol;

        const ptm_table_columnsToIgnore: string[] = ['ptm_id_namespace']; // don't include 'persistent_id' here
        const {
            prunedData: ptmPrunedData,
            columnNames: ptmColNames,
            dynamicColumns: dynamicPtmColumns,
            staticColumns: staticPtmColumns
        } = pruneAndRetrieveColumnNames(
            ptmTable,
            ptmTableFull,
            ptm_table_columnsToIgnore
        );

        // Add 'id' column with 'row-<index>' format
        const ptmPrunedDataWithId = ptmPrunedData.map((row, index) => ({ ...row, id: index }));
        const ptm_table_full_withId =
            ptmTableFull ? ptmTableFull.map((row, index) => ({ ...row, id: index }))
                : [];

        const downloadFilename = generateHashedJSONFilename("PTMTable_", searchParams);
        const categories: Category[] = [];

        addCategoryColumns(staticPtmColumns, getNameFromPTMTable, "PTMs", categories);
        const category = categories[0];
        const downloadData = category?.metadata
            ? category.metadata
                .filter(item => item && item.value !== null)  // Only include items with a non-null value
                .map(item => ({ [item.label]: item.value }))  // Create an object with label as the key and value as the value
            : []; // If category is not present, return an empty array


        return (
            <Grid container spacing={0} direction="column">
                {category && (
                    <Grid item xs={12}>
                        <Card variant="outlined" sx={{ mb: 0, borderBottom: "none" }}>
                            <CardContent id={`card-content-${category.title}`}>
                                <Typography variant="h5" component="div">
                                    {category.title + " (Uniform Columns) Count: " + countCol}
                                </Typography>
                                {category.metadata.map((item, i) => (
                                    item && item.value ? (
                                        <Typography key={i} variant="body2">
                                            <strong>{item.label}: </strong>
                                            {renderMetadataValue(item)}
                                        </Typography>
                                    ) : null
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                )}
                {countCol === 1 && (
                    <Grid item xs={12}>
                        <DownloadButton
                            data={downloadData}
                            filename={downloadFilename}
                            name="Download Metadata"
                        />
                    </Grid>
                )}
                <Grid item xs={12}>
                    <ExpandableTable
                        data={ptmPrunedDataWithId}
                        full_data={ptm_table_full_withId}
                        downloadFileName={downloadFilename}
                        tableTitle={PTMTableTitle}
                        searchParams={searchParams}
                        count={countCol}
                        colNames={dynamicPtmColumns}
                        dynamicColumns={dynamicPtmColumns}
                        tablePrefix="ptmTbl"
                    />
                </Grid>
            </Grid>
        );

    } catch (error) {
        console.error("Error fetching PTM table:", error);
        return <div>Error fetching PTM table: {(error as Error).message}</div>;
    }
}
