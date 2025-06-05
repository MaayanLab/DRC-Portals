import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import React from 'react';
import Link from "@/utils/link";
import { isURL, MetadataItem, pruneAndRetrieveColumnNames, generateHashedJSONFilename, addCategoryColumns, getNameFromBiosampleSubjectTable, Category } from "@/app/data/c2m2/utils";
import ExpandableTable from "@/app/data/c2m2/ExpandableTable";
import { Paper, Grid, Typography, Card, CardContent } from "@mui/material";

/* Even though subject information is also included, the variables names are still based on the string Biosample or biosample*/
interface BiosampleSubjectTableResult {
    biosamples_sub_table_full: {
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
        substance_name: string,
        subject_race_name: string,
        subject_granularity_name: string,
        subject_sex_name: string,
        subject_ethnicity_name: string,
        subject_role_name: string,
        subject_age_at_enrollment: string
    }[];
    biosamples_sub_table: {
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
        substance_name: string,
        subject_race_name: string,
        subject_granularity_name: string,
        subject_sex_name: string,
        subject_ethnicity_name: string,
        subject_role_name: string,
        subject_age_at_enrollment: string
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

export default async function BiosamplesSubjectTableComponent({ searchParams, filterClause, bioSamplSubTblOffset, limit }: { searchParams: any, filterClause: SQL, bioSamplSubTblOffset: number, limit: number }): Promise<JSX.Element> {
    console.log("In BiosampleSubjectTableComponent");
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
            biosamples_sub_table AS (
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
                    allres_full.substance_name,
                    allres_full.subject_race_name,
                    allres_full.subject_granularity_name,
                    allres_full.subject_sex_name,
                    allres_full.subject_ethnicity_name,
                    allres_full.subject_role_name,
                    allres_full.subject_age_at_enrollment
                FROM allres_full
            ),
            biosamples_sub_table_limited AS (
                SELECT * 
                FROM biosamples_sub_table
                OFFSET ${bioSamplSubTblOffset}
                LIMIT ${limit}
            ),
            count_bios AS (
                SELECT COUNT(*)::INT AS count
                FROM biosamples_sub_table
            )
            SELECT
                (SELECT count FROM count_bios) AS count_bios,
                (SELECT COALESCE(jsonb_agg(biosamples_sub_table_limited.*), '[]'::jsonb) FROM biosamples_sub_table_limited) AS biosamples_sub_table,
                (SELECT COALESCE(jsonb_agg(biosamples_sub_table.*), '[]'::jsonb) FROM biosamples_sub_table) AS biosamples_sub_table_full
        `.toPrismaSql();

        const t0: number = performance.now();
        const results = await prisma.$queryRaw<BiosampleSubjectTableResult[]>(query);
        const t1: number = performance.now();
        console.log("Elapsed time for BiosamplesSubjectTableComponent queries: ", t1 - t0, " milliseconds");

        if (!results || results.length === 0) {
            return <div></div>;
        }

        // Assuming you want to process the first result in the array
        const firstResult = results[0];

        const countBios = firstResult.count_bios ?? 0;
        const biosamplesSubTable = firstResult.biosamples_sub_table ?? [];
        const biosamplesSubTableFull = firstResult.biosamples_sub_table_full ?? [];

        if (biosamplesSubTable.length === 0 || biosamplesSubTableFull.length === 0) {
            return <div>No biosamples/subject data found.</div>;
        }

        const biosample_sub_table_columnsToIgnore: string[] = [
            'anatomy_name', 'biofluid_name', 'disease_name', 'project_local_id',
            'project_id_namespace',  'subject_id_namespace', 'biosample_id_namespace'
        ];

        

        const biosampleSubjectTableTitle = "Biosamples and Subjects: " + countBios;

        const {
            prunedData: biosampleSubPrunedData,
            columnNames: bioSampleSubColNames,
            dynamicColumns: dynamicBiosampleSubColumns,
            staticColumns: staticBiosampleSubColumns
        } = pruneAndRetrieveColumnNames(
            biosamplesSubTable,
            biosamplesSubTableFull,
            biosample_sub_table_columnsToIgnore
        );

        // Add 'id' column with 'row-<index>' format
        const biosampleSubjectPrunedDataWithId = biosampleSubPrunedData.map((row, index) => ({ ...row, id: index }));
        const biosamples_sub_table_full_withId = biosamplesSubTableFull
            ? biosamplesSubTableFull.map((row, index) => ({ ...row, id: index }))
            : [];

        const downloadFilename = generateHashedJSONFilename("BiosampleSubjectTable_", searchParams);
        const categories: Category[] = [];


        addCategoryColumns(staticBiosampleSubColumns, getNameFromBiosampleSubjectTable, "Biosamples/Subjects", categories);
        const category = categories[0];

        console.log("Biosample Subject Category = " + category);

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
                <Grid item xs={12}>
                    <ExpandableTable
                        data={biosampleSubjectPrunedDataWithId}
                        full_data={biosamples_sub_table_full_withId}
                        downloadFileName={downloadFilename}
                        tableTitle={biosampleSubjectTableTitle}
                        searchParams={searchParams}
                        count={countBios}
                        colNames={dynamicBiosampleSubColumns}
                        dynamicColumns={dynamicBiosampleSubColumns}
                        tablePrefix="bioSamplSubTbl"
                    />
                </Grid>
            </Grid>
        );

    } catch (error) {
        console.error("Error fetching Biosamples/Subjects table:", error);
        return <div>Error fetching Biosamples and Subjects table: {(error as Error).message}</div>;
    }

}
