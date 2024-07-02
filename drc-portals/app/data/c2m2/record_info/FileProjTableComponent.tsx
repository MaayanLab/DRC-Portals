import prisma from "@/lib/prisma";
import SQL from '@/lib/prisma/raw';
import React from 'react';
import Link from "next/link";
import { isURL, MetadataItem, reorderStaticCols, get_partial_list_string, pruneAndRetrieveColumnNames, generateHashedJSONFilename, addCategoryColumns, getNameFromFileProjTable, Category } from "@/app/data/c2m2/utils";
import ExpandableTable from "../ExpandableTable";
import { Grid, Typography, Card, CardContent } from "@mui/material";

interface FileProjTableResult {
    file_table_full: {
        id_namespace: string,
        local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        persistent_id: string,
        access_url: string,
        creation_time: string,
        size_in_bytes: bigint,
        uncompressed_size_in_bytes: bigint,
        sha256: string,
        md5: string,
        filename: string,
        file_format: string,
        compression_format: string,
        data_type: string,
        assay_type: string,
        analysis_type: string,
        mime_type: string,
        bundle_collection_id_namespace: string,
        bundle_collection_local_id: string,
        dbgap_study_id: string,
        data_type_name: string,
        assay_type_name: string,
        analysis_type_name: string
    }[];
    file_table: {
        id_namespace: string,
        local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        persistent_id: string,
        access_url: string,
        creation_time: string,
        size_in_bytes: bigint,
        uncompressed_size_in_bytes: bigint,
        sha256: string,
        md5: string,
        filename: string,
        file_format: string,
        compression_format: string,
        data_type: string,
        assay_type: string,
        analysis_type: string,
        mime_type: string,
        bundle_collection_id_namespace: string,
        bundle_collection_local_id: string,
        dbgap_study_id: string,
        data_type_name: string,
        assay_type_name: string,
        analysis_type_name: string
    }[];

    count_file: number;

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

export default async function FilesProjTableComponent({ searchParams, filterClause, fileProjTblOffset, limit, file_count_limit_proj }: { searchParams: any, filterClause: SQL, fileProjTblOffset: number, limit: number, file_count_limit_proj: number }): Promise<JSX.Element> {
    console.log("In FilesProjTableComponent");
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
            unique_info AS ( /* has extra fields, but OK in case needed later*/
            SELECT DISTINCT 
                allres_full.dcc_name,
                allres_full.dcc_abbreviation,
                allres_full.project_local_id, 
                allres_full.project_id_namespace,
                allres_full.ncbi_taxonomy_name as taxonomy_name,
                allres_full.subject_role_taxonomy_taxonomy_id as taxonomy_id,
                allres_full.disease_name,
                allres_full.disease,
                allres_full.anatomy_name,
                allres_full.anatomy,
                allres_full.gene, 
                allres_full.gene_name,
                allres_full.protein, 
                allres_full.protein_name,
                allres_full.substance_compound as compound, 
                allres_full.compound_name,
                allres_full.data_type_id AS data_type, 
                allres_full.data_type_name
            FROM allres_full
        ),
            /* create file_table_keycol */
            /* Mano: 2024/05/03: below using file_table_keycol instead of file_table (since file_count_limit is applied) */
             /* For some DCCs, e.g., hubmap, it may list many many files (> 1M) for some projects */
            file_table_keycol AS (
            SELECT DISTINCT 
                f.id_namespace,
                f.local_id,
                f.project_id_namespace,
                f.project_local_id
            FROM c2m2.file AS f
            INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                                    AND f.project_id_namespace = ui.project_id_namespace
                                    AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) ) /* 2024/03/07 match data type */
            ),
            file_table AS (
            SELECT DISTINCT 
                f.id_namespace,
                f.local_id,
                f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
                f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
                f.file_format, f.compression_format,  f.mime_type, f.dbgap_study_id,
                dt.name AS data_type_name, at.name AS assay_type_name, aty.name AS analysis_type_name
                FROM c2m2.file AS f INNER JOIN unique_info ui ON (f.project_local_id = ui.project_local_id 
                AND f.project_id_namespace = ui.project_id_namespace
                AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) )
                LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
                LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id
                LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
            limit ${file_count_limit_proj}
            )
            , 
            file_table_limited as (
            SELECT * 
            FROM file_table
            OFFSET ${fileProjTblOffset}
            LIMIT ${limit}
            ), /* Mano */
            count_file AS (
            select count(*)::int as count
                from file_table_keycol
            )
            SELECT
            (SELECT count FROM count_file) as count_file,
            (SELECT COALESCE(jsonb_agg(file_table_limited.*), '[]'::jsonb) FROM file_table_limited) AS file_table,
            (SELECT COALESCE(jsonb_agg(file_table.*), '[]'::jsonb) FROM file_table) AS file_table_full
        `.toPrismaSql();

        const t0: number = performance.now();
        const results = await prisma.$queryRaw<FileProjTableResult[]>(query);
        const t1: number = performance.now();
        console.log("Elapsed time for FilesProjTableComponent queries: ", t1 - t0, " milliseconds");

        if (!results || results.length === 0) {
            return <div></div>;
        }

        // Assuming you want to process the first result in the array
        const firstResult = results[0];
        const countFile = firstResult.count_file ?? 0;


        const filesProjTable = firstResult.file_table ?? [];
        const filesProjTableFull = firstResult.file_table_full ?? [];

        if (filesProjTable.length === 0 || filesProjTableFull.length === 0) {
            return <div>No files in project data found.</div>;
        }

        const fileProj_table_label_base = "Project associated files with specified data type";
        const count_file_table_withlimit = filesProjTableFull.length ?? 0;


        const fileProjTableTitle = fileProj_table_label_base + ": " + get_partial_list_string(countFile ?? 0, count_file_table_withlimit, file_count_limit_proj);


        const priorityFileCols = ['filename', 'file_local_id', 'assay_type_name', 'analysis_type_name', 'size_in_bytes', 'persistent_id']; // priority columns to show up early


        const filesProj_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'bundle_collection_id_namespace'];
        const {
            prunedData: fileProjPrunedData,
            columnNames: fileProjColNames,
            dynamicColumns: dynamicFileProjColumns,
            staticColumns: staticFileProjColumns
        } = pruneAndRetrieveColumnNames(
            filesProjTable ?? [],
            filesProjTableFull ?? [],
            filesProj_table_columnsToIgnore
        );
        // Add 'id' column with 'row-<index>' format
        const fileProjPrunedDataWithId = fileProjPrunedData.map((row, index) => ({ ...row, id: index }));
        //console.log("fileProjPrundedDataWithId = "+fileProjPrunedDataWithId);
        const filesProj_table_full_withId = filesProjTableFull
            ? filesProjTableFull.map((row, index) => ({ ...row, id: index }))
            : [];

        const newFileProjColumns = priorityFileCols.filter(item => dynamicFileProjColumns.includes(item));
        const staticPriorityFileCols = priorityFileCols.filter(item => !dynamicFileProjColumns.includes(item)); // priority columns that are static, don't change with 

        const remainingDynamicCols = dynamicFileProjColumns.filter(item => !newFileProjColumns.includes(item));
        const finalNewFileProjColumns = newFileProjColumns.concat(remainingDynamicCols); // concatenate remaining dynamic columns to the final list

        const reorderedFileProjStaticCols = reorderStaticCols(staticFileProjColumns, staticPriorityFileCols);

        const downloadFilename = generateHashedJSONFilename("FilesProjTable_", searchParams);
        const categories: Category[] = [];

        addCategoryColumns(reorderedFileProjStaticCols, getNameFromFileProjTable, fileProj_table_label_base, categories);

        const category = categories[0];

        return (
            <Grid container spacing={2} direction="column" sx={{ maxWidth: '100%' }}>
                {category && (
                    <Grid item xs={12} sx={{ maxWidth: '100%' }}>
                        <Card variant="outlined" sx={{ mb: 2 }}>
                            <CardContent id={`card-content-${category.title}`}>
                                <Typography variant="h5" component="div">
                                    {category.title + " (Uniform Columns) Count: " + countFile}
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
                <Grid item xs={12} sx={{ maxWidth: '100%' }}>
                    {(count_file_table_withlimit > 0) && (
                        <ExpandableTable
                            data={fileProjPrunedDataWithId}
                            full_data={filesProj_table_full_withId}
                            downloadFileName={downloadFilename}
                            drsBundle
                            tableTitle={fileProjTableTitle}
                            searchParams={searchParams}
                            count={count_file_table_withlimit}
                            colNames={finalNewFileProjColumns}
                            dynamicColumns={finalNewFileProjColumns}
                            tablePrefix="fileProjTbl"

                        />
                    )}
                </Grid>
            </Grid>

        );

    } catch (error) {
        console.error("Error fetching FilesProj table:", error);
        return <div>Error fetching FilesProj table: {(error as Error).message}</div>;
    }
}
