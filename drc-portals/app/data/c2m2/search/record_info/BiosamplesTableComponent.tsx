import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import React from 'react';
import Link from "@/utils/link";
import { isURL, MetadataItem, pruneAndRetrieveColumnNames, generateHashedJSONFilename, addCategoryColumns, getNameFromBiosampleTable, Category } from "@/app/data/c2m2/utils";
import ExpandableTable from "@/app/data/c2m2/ExpandableTable";
import { Paper, Grid, Typography, Card, CardContent } from "@mui/material";
import DownloadButton from "../../DownloadButton";
import { update_q_to_exclude_gender } from "@/app/data/c2m2/utils";

interface BiosampleTableResult {
    biosamples_table_full: {
        biosample_id_namespace: string,
        biosample_local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        biosample_persistent_id: string,
        biosample_creation_time: string,
        sample_prep_method_name: string,
        anatomy_name: string,
        biofluid_name: string,
        disease_name: string,
        disease_association_type_name: string,
        subject_id_namespace: string,
        subject_local_id: string,
        biosample_age_at_sampling: string,
        gene_name: string,
        substance_name: string
    }[];
    biosamples_table: {
        biosample_id_namespace: string,
        biosample_local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        biosample_persistent_id: string,
        biosample_creation_time: string,
        sample_prep_method_name: string,
        anatomy_name: string,
        biofluid_name: string,
        disease_name: string,
        disease_association_type_name: string,
        subject_id_namespace: string,
        subject_local_id: string,
        biosample_age_at_sampling: string,
        gene_name: string,
        substance_name: string
    }[];
    count_bios: number;
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

export default async function BiosamplesTableComponent({ searchParams, filterClause, bioSamplTblOffset, limit }: { searchParams: any, filterClause: SQL, bioSamplTblOffset: number, limit: number }): Promise<JSX.Element> {
    searchParams.q = update_q_to_exclude_gender(searchParams.q);
    console.log("In BiosampleTableComponent");
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
            biosamples_table AS (
                SELECT DISTINCT
                    allres_full.biosample_id_namespace,
                    allres_full.biosample_local_id,
                    allres_full.project_id_namespace,
                    allres_full.project_local_id,
                    allres_full.biosample_persistent_id,
                    allres_full.biosample_creation_time,
                    allres_full.sample_prep_method_name,
                    allres_full.anatomy_name,
                    allres_full.biofluid_name,
                    allres_full.disease_name,
                    allres_full.disease_association_type_name,
                    allres_full.subject_id_namespace,
                    allres_full.subject_local_id,
                    allres_full.biosample_age_at_sampling,
                    allres_full.gene_name,
                    allres_full.substance_name
                FROM allres_full
            ),
            biosamples_table_limited AS (
                SELECT * 
                FROM biosamples_table
                OFFSET ${bioSamplTblOffset}
                LIMIT ${limit}
            ),
            count_bios AS (
                SELECT COUNT(*)::INT AS count
                FROM biosamples_table
            )
            SELECT
                (SELECT count FROM count_bios) AS count_bios,
                (SELECT COALESCE(jsonb_agg(biosamples_table_limited.*), '[]'::jsonb) FROM biosamples_table_limited) AS biosamples_table,
                (SELECT COALESCE(jsonb_agg(biosamples_table.*), '[]'::jsonb) FROM biosamples_table) AS biosamples_table_full
        `.toPrismaSql();

        const t0: number = performance.now();
        const results = await prisma.$queryRaw<BiosampleTableResult[]>(query);
        const t1: number = performance.now();
        console.log("Elapsed time for BiosamplesTableComponent queries: ", t1 - t0, " milliseconds");

        if (!results || results.length === 0) {
            return <div></div>;
        }

        // Assuming you want to process the first result in the array
        const firstResult = results[0];

        const countBios = firstResult.count_bios ?? 0;
        const biosamplesTable = firstResult.biosamples_table ?? [];
        const biosamplesTableFull = firstResult.biosamples_table_full ?? [];

        if (biosamplesTable.length === 0 || biosamplesTableFull.length === 0) {
            return <div>No biosamples data found.</div>;
        }

        const biosample_table_columnsToIgnore: string[] = [
            'anatomy_name', 'biofluid_name', 'disease_name', 'project_local_id',
            'project_id_namespace', 'subject_local_id',
            'subject_id_namespace', 'biosample_id_namespace'
        ];

        const biosampleTableTitle = "Biosamples: " + countBios;

        const {
            prunedData: biosamplePrunedData,
            columnNames: bioSampleColNames,
            dynamicColumns: dynamicBiosampleColumns,
            staticColumns: staticBiosampleColumns
        } = pruneAndRetrieveColumnNames(
            biosamplesTable,
            biosamplesTableFull,
            biosample_table_columnsToIgnore
        );

        // Add 'id' column with 'row-<index>' format
        const biosamplePrunedDataWithId = biosamplePrunedData.map((row, index) => ({ ...row, id: index }));
        const biosamples_table_full_withId = biosamplesTableFull
            ? biosamplesTableFull.map((row, index) => ({ ...row, id: index }))
            : [];

        const downloadFilename = generateHashedJSONFilename("BiosampleTable_", searchParams);
        const categories: Category[] = [];
        

        addCategoryColumns(staticBiosampleColumns, getNameFromBiosampleTable, "Biosamples", categories);
        const category = categories[0];
        const downloadData = category?.metadata
            ? category.metadata
                .filter(item => item && item.value !== null)  // Only include items with a non-null value
                .map(item => ({ [item.label]: item.value }))  // Create an object with label as the key and value as the value
            : []; // If category is not present, return an empty array


        console.log("Biosample Category = " + category);

        return (
            <Grid container spacing={0} direction="column">
                {category && (
                    <Grid item xs={12}>
                        <Card variant="outlined" sx={{ mb: 0, borderBottom: "none" }}>
                            <CardContent id={`card-content-${category.title}`}>
                                <Typography variant="h5" component="div">
                                    {category.title + " (Uniform Columns) Count: " + countBios}
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
                {/* Conditionally render DownloadButton if biosamplePrunedDataWithId is empty */}
                {countBios === 1 && (
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
                        data={biosamplePrunedDataWithId}
                        full_data={biosamples_table_full_withId}
                        downloadFileName={downloadFilename}
                        tableTitle={biosampleTableTitle}
                        searchParams={searchParams}
                        count={countBios}
                        colNames={dynamicBiosampleColumns}
                        dynamicColumns={dynamicBiosampleColumns}
                        tablePrefix="bioSamplTbl"
                    />
                </Grid>
            </Grid>
        );

    } catch (error) {
        console.error("Error fetching Biosamples table:", error);
        return <div>Error fetching Biosamples table: {(error as Error).message}</div>;
    }

}
