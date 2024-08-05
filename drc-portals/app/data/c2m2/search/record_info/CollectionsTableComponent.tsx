import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import React from 'react';
import Link from "@/utils/link";
import { isURL, MetadataItem, pruneAndRetrieveColumnNames, generateHashedJSONFilename, addCategoryColumns, getNameFromCollectionTable, Category } from "@/app/data/c2m2/utils";
import ExpandableTable from "../../ExpandableTable";
import { Grid, Typography, Card, CardContent } from "@mui/material";

interface CollectionTableResult {
    collections_table_full: {
        collection_id_namespace: string,
        collection_local_id: string,
        persistent_id: string,
        creation_time: string,
        abbreviation: string,
        name: string,
        description: string,
        has_time_series_data: string
    }[];
    collections_table: {
        collection_id_namespace: string,
        collection_local_id: string,
        persistent_id: string,
        creation_time: string,
        abbreviation: string,
        name: string,
        description: string,
        has_time_series_data: string
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

export default async function CollectionsTableComponent({ searchParams, filterClause, colTblOffset, limit }: { searchParams: any, filterClause: SQL, colTblOffset: number, limit: number }): Promise<JSX.Element> {
    console.log("In CollectionsTableComponent");
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
            collections_table AS (
                SELECT DISTINCT
                    allres_full.collection_id_namespace,
                    allres_full.collection_local_id,
                    c2m2.collection.persistent_id as persistent_id,
                    c2m2.collection.creation_time as creation_time,
                    allres_full.collection_abbreviation as abbreviation,
                    allres_full.collection_name as name,
                    c2m2.collection.description as description,
                    allres_full.collection_has_time_series_data as has_time_series_data
                FROM allres_full
                LEFT JOIN c2m2.collection ON (c2m2.collection.local_id = allres_full.collection_local_id)
            ),
            collections_table_limited AS (
                SELECT * 
                FROM collections_table
                OFFSET ${colTblOffset}
                LIMIT ${limit}
            ),
            count_col AS (
                SELECT count(*)::int as count
                FROM collections_table
            )
            SELECT
                (SELECT count FROM count_col) as count_col,
                (SELECT COALESCE(jsonb_agg(collections_table_limited.*), '[]'::jsonb) FROM collections_table_limited) AS collections_table,
                (SELECT COALESCE(jsonb_agg(collections_table.*), '[]'::jsonb) FROM collections_table) AS collections_table_full
        `.toPrismaSql();

        const t0: number = performance.now();
        const results = await prisma.$queryRaw<CollectionTableResult[]>(query);
        const t1: number = performance.now();
        console.log("Elapsed time for CollectionsTableComponent queries: ", t1 - t0, " milliseconds");

        if (!results || results.length === 0) {
            return <div></div>;
        }

        // Assuming you want to process the first result in the array
        const firstResult = results[0];
        const countCol = firstResult.count_col ?? 0;
        const collectionsTable = firstResult.collections_table ?? [];
        const collectionsTableFull = firstResult.collections_table_full ?? [];

        if (collectionsTable.length === 0 || collectionsTableFull.length === 0) {
            return <div>No collections data found.</div>;
        }

        const collectionTableTitle = "Collections: " + countCol;

        const collections_table_columnsToIgnore: string[] = ['collection_id_namespace']; // don't include 'persistent_id' here
        const {
            prunedData: collectionPrunedData,
            columnNames: collectionColNames,
            dynamicColumns: dynamicCollectionColumns,
            staticColumns: staticCollectionColumns
        } = pruneAndRetrieveColumnNames(
            collectionsTable,
            collectionsTableFull,
            collections_table_columnsToIgnore
        );

        // Add 'id' column with 'row-<index>' format
        const collectionPrunedDataWithId = collectionPrunedData.map((row, index) => ({ ...row, id: index }));
        const collections_table_full_withId =
            collectionsTableFull ? collectionsTableFull.map((row, index) => ({ ...row, id: index }))
                : [];

        const downloadFilename = generateHashedJSONFilename("CollectionTable_", searchParams);
        const categories: Category[] = [];

        addCategoryColumns(staticCollectionColumns, getNameFromCollectionTable, "Collections", categories);
        const category = categories[0];

        return (
            <Grid container spacing={2} direction="column">
                {category && (
                    <Grid item xs={12}>
                        <Card variant="outlined" sx={{ mb: 2 }}>
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
                <Grid item xs={12}>
                    <ExpandableTable
                        data={collectionPrunedDataWithId}
                        full_data={collections_table_full_withId}
                        downloadFileName={downloadFilename}
                        tableTitle={collectionTableTitle}
                        searchParams={searchParams}
                        count={countCol}
                        colNames={dynamicCollectionColumns}
                        dynamicColumns={dynamicCollectionColumns}
                        tablePrefix="colTbl"
                    />
                </Grid>
            </Grid>
        );

    } catch (error) {
        console.error("Error fetching Collections table:", error);
        return <div>Error fetching Collections table: {(error as Error).message}</div>;
    }
}
