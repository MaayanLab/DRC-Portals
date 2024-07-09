import prisma from "@/lib/prisma";
import SQL from '@/lib/prisma/raw';
import React from 'react';
import Link from "next/link";
import { isURL, MetadataItem, pruneAndRetrieveColumnNames, generateHashedJSONFilename, addCategoryColumns, getNameFromSubjectTable, Category } from "@/app/data/c2m2/utils";
import ExpandableTable from "../ExpandableTable";
import { Grid, Typography, Card, CardContent } from "@mui/material";

interface SubjectTableResult {
    subjects_table_full: {
        subject_id_namespace: string,
        subject_local_id: string,
        subject_race_name: string,
        subject_granularity_name: string,
        subject_sex_name: string,
        subject_ethnicity_name: string,
        subject_role_name: string,
        subject_age_at_enrollment: string
    }[];
    subjects_table: {
        subject_id_namespace: string,
        subject_local_id: string,
        subject_race_name: string,
        subject_granularity_name: string,
        subject_sex_name: string,
        subject_ethnicity_name: string,
        subject_role_name: string,
        subject_age_at_enrollment: string
    }[];
    count_sub: number;
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

export default async function SubjectsTableComponent({ searchParams, filterClause, subTblOffset, limit }: { searchParams: any, filterClause: SQL, subTblOffset: number, limit: number }): Promise<JSX.Element> {
    console.log("In SubjectsTableComponent");
    console.log("q = " + searchParams.q);

    try {
        const query = SQL.template`
            WITH allres_full AS (
                SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                    ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) as "rank"
                FROM c2m2.ffl_biosample_collection
                WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q}) ${filterClause}
                ORDER BY rank DESC
            ), 
            subjects_table AS (
                SELECT DISTINCT
                  allres_full.subject_id_namespace,
                  allres_full.subject_local_id,
                  allres_full.subject_race_name,
                  allres_full.subject_granularity_name,
                  allres_full.subject_sex_name,
                  allres_full.subject_ethnicity_name,
                  allres_full.subject_role_name,
                  allres_full.subject_age_at_enrollment
                FROM allres_full
            ),
            subjects_table_limited AS (
                SELECT * 
                FROM subjects_table
                OFFSET ${subTblOffset}
                LIMIT ${limit}
            ),
            count_sub AS (
                SELECT count(*)::int as count
                FROM subjects_table
            )
            SELECT
                (SELECT count FROM count_sub) as count_sub,
                (SELECT COALESCE(jsonb_agg(subjects_table_limited.*), '[]'::jsonb) FROM subjects_table_limited) AS subjects_table,
                (SELECT COALESCE(jsonb_agg(subjects_table.*), '[]'::jsonb) FROM subjects_table) AS subjects_table_full
        `.toPrismaSql();

        const t0: number = performance.now();
        const results = await prisma.$queryRaw<SubjectTableResult[]>(query);
        const t1: number = performance.now();
        console.log("Elapsed time for SubjectsTableComponent queries: ", t1 - t0, " milliseconds");

        if (!results || results.length === 0) {
            return <div></div>;
        }

        // Assuming you want to process the first result in the array
        const firstResult = results[0];
        const countSub = firstResult.count_sub ?? 0;
        const subjectsTable = firstResult.subjects_table ?? [];
        const subjectsTableFull = firstResult.subjects_table_full ?? [];

        if (subjectsTable.length === 0 || subjectsTableFull.length === 0) {
            return <div>No subjects data found.</div>;
        }

        const subjectTableTitle = "Subjects: " + countSub;
        const subject_table_columnsToIgnore: string[] = ['subject_id_namespace'];

        const {
            prunedData: subjectPrunedData,
            columnNames: subjectColNames,
            dynamicColumns: dynamicSubjectColumns,
            staticColumns: staticSubjectColumns
        } = pruneAndRetrieveColumnNames(
            subjectsTable,
            subjectsTableFull,
            subject_table_columnsToIgnore
        );

        // Add 'id' column with 'row-<index>' format
        const subjectPrunedDataWithId = subjectPrunedData.map((row, index) => ({ ...row, id: index }));
        const subjects_table_full_withId = subjectsTableFull
            ? subjectsTableFull.map((row, index) => ({ ...row, id: index }))
            : [];

        const downloadFilename = generateHashedJSONFilename("SubjectTable_", searchParams);
        const categories: Category[] = [];


        addCategoryColumns(staticSubjectColumns, getNameFromSubjectTable, "Subjects", categories);
        const category = categories[0];

        return (
            <Grid container spacing={2} direction="column">
                {category && (
                    <Grid item xs={12}>
                        <Card variant="outlined" sx={{ mb: 2 }}>
                            <CardContent id={`card-content-${category.title}`}>
                                <Typography variant="h5" component="div">
                                    {category.title + " (Uniform Columns) Count: " + countSub}
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
                        data={subjectPrunedDataWithId}
                        full_data={subjects_table_full_withId}
                        downloadFileName={downloadFilename}
                        tableTitle={subjectTableTitle}
                        searchParams={searchParams}
                        count={countSub}
                        colNames={dynamicSubjectColumns}
                        dynamicColumns={dynamicSubjectColumns}
                        tablePrefix="subTbl"
                    />
                </Grid>
            </Grid>
        );

    } catch (error) {
        console.error("Error fetching Subjects table:", error);
        return <div>Error fetching Subjects table: {(error as Error).message}</div>;
    }
}
