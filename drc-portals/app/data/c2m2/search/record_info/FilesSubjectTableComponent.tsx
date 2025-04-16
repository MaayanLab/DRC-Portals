import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import React from 'react';
import Link from "@/utils/link";
import { isURL, MetadataItem, reorderStaticCols, get_partial_list_string, pruneAndRetrieveColumnNames, generateHashedJSONFilename, addCategoryColumns, getNameFromFileProjTable, Category } from "@/app/data/c2m2/utils";
import ExpandableTable from "@/app/data/c2m2/ExpandableTable";
import { Grid, Typography, Card, CardContent } from "@mui/material";
import DownloadButton from "../../DownloadButton";
import { generateSelectColumnsForFileQuery } from "@/app/data/c2m2/utils";

interface FileSubTableResult {
    file_sub_table: {
        file_id_namespace: string,
        file_local_id: string,
        subject_id_namespace: string,
        subject_local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        persistent_id: string,
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
        access_url: string,
        file_format_name: string,
        compression_format_name: string,
        data_type_name: string,
        assay_type_name: string,
        analysis_type_name: string
    }[];
    file_sub_table_full: {
        file_id_namespace: string,
        file_local_id: string,
        subject_id_namespace: string,
        subject_local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        persistent_id: string,
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
        access_url: string,
        file_format_name: string,
        compression_format_name: string,
        data_type_name: string,
        assay_type_name: string,
        analysis_type_name: string
    }[];
    count_file_sub: number;
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

export default async function FilesSubjectTableComponent({ searchParams, filterClause, fileSubTblOffset, limit, file_count_limit_sub }: { searchParams: any, filterClause: SQL, fileSubTblOffset: number, limit: number, file_count_limit_sub: number }): Promise<JSX.Element> {
    console.log("In FilesSubTableComponent");
    console.log("q = " + searchParams.q);

    const ColumnsForFileQuery = generateSelectColumnsForFileQuery("allres_full");
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
            unique_info AS ( /* has extra fields, but OK in case needed later*/
            SELECT DISTINCT ${SQL.raw(ColumnsForFileQuery)} FROM allres_full
            ),
            sub_info AS (
                SELECT DISTINCT 
                allres_full.subject_id_namespace,
                allres_full.subject_local_id
                FROM allres_full
            ), /* 2024/03/07 */
            file_table_keycol AS (
                /* SELECT DISTINCT f.id_namespace, f.local_id, f.project_id_namespace, f.project_local_id */
                SELECT DISTINCT f.*
                FROM c2m2.file AS f
                INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                                        AND f.project_id_namespace = ui.project_id_namespace
                                        AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/ /* 2024/03/07 match data type */
                                        AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL))  /****/
                                        AND ((f.file_format = ui.file_format) OR (f.file_format IS NULL AND ui.file_format IS NULL)) ) /****/
                ),
                file_sub_table_keycol AS (
                  SELECT DISTINCT fds.*,
                  f.project_id_namespace, f.project_local_id, f.persistent_id, f.creation_time,
                  f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
                  f.file_format, f.compression_format,  f.data_type, f.assay_type, f.analysis_type, 
                  f.mime_type, f.bundle_collection_id_namespace, f. bundle_collection_local_id, f.dbgap_study_id, f.access_url, 
                  ff.name AS file_format_name, fff.name AS compression_format_name,
                  ui.data_type_name, ui.assay_type_name, aty.name AS analysis_type_name
                FROM c2m2.file_describes_subject fds
                  /**? INNER JOIN file_table_keycol ftk ON (ftk.local_id = fds.file_local_id AND ftk.id_namespace = fds.file_id_namespace) */
                  INNER JOIN file_table_keycol f ON (f.local_id = fds.file_local_id AND f.id_namespace = fds.file_id_namespace)
                  INNER JOIN sub_info ON 
                  (sub_info.subject_local_id = fds.subject_local_id AND sub_info.subject_id_namespace = fds.subject_id_namespace) /* 2024/03/07 match subject */    /** limit ${file_count_limit_sub}     **/
                  /* Mano: even though columns of ftk are from f only, # rows ftk << #rows f */
                  /**? NOT NEEDED--dueto-file_table_keycol INNER JOIN c2m2.file AS f ON (f.local_id = ftk.local_id AND f.id_namespace = ftk.id_namespace) */
                  INNER JOIN unique_info ui ON 
                  ((f.project_local_id = ui.project_local_id)
                    AND (f.project_id_namespace = ui.project_id_namespace)
                    AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/
                    AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
                  /**** LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
                  LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id ****/
                LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
                LEFT JOIN c2m2.file_format AS ff ON f.file_format = ff.id
                LEFT JOIN c2m2.file_format AS fff ON f.compression_format = fff.id
                  ), /* Mano */
                file_sub_table AS (
                  SELECT * from file_sub_table_keycol
                  limit ${file_count_limit_sub}    
                ),
                file_sub_table_limited as (
                  SELECT * 
                  FROM file_sub_table
                  OFFSET ${fileSubTblOffset}
                  LIMIT ${limit}
                ), /* Mano */
                count_file_sub AS (
                  select count(*)::int as count
                  from file_sub_table_keycol
                ) /* Mano */
                SELECT
                (SELECT count FROM count_file_sub) as count_file_sub,
                (SELECT COALESCE(jsonb_agg(file_sub_table_limited.*), '[]'::jsonb) FROM file_sub_table_limited) AS file_sub_table,
                (SELECT COALESCE(jsonb_agg(file_sub_table.*), '[]'::jsonb) FROM file_sub_table) AS file_sub_table_full
        `.toPrismaSql();

        const t0: number = performance.now();
        const results = await prisma.$queryRaw<FileSubTableResult[]>(query);
        const t1: number = performance.now();
        console.log("------------ Elapsed time for FilesSubjectTableComponent queries: ", t1 - t0, " milliseconds");

        if (!results || results.length === 0) {
            return <></>;
        }

        // Assuming you want to process the first result in the array
        const firstResult = results[0];
        const countFileSub = firstResult.count_file_sub ?? 0;


        const filesSubTable = firstResult.file_sub_table ?? [];
        const filesSubTableFull = firstResult.file_sub_table_full ?? [];

        if (filesSubTable.length === 0 || filesSubTableFull.length === 0) {
            return <></>;
        }


        const filesSub_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'file_id_namespace', 'subject_id_namespace', 'md5', 'sha256', 'file_format', 'compression_format', 'assay_type', 'analysis_type', 'data_type']; // added md5 and sha256 to ignore columns
        const {
            prunedData: fileSubPrunedData,
            columnNames: fileSubColNames,
            dynamicColumns: dynamicFileSubColumns,
            staticColumns: staticFileSubColumns
        } = pruneAndRetrieveColumnNames(
            filesSubTable ?? [],
            filesSubTableFull ?? [],
            filesSub_table_columnsToIgnore
        );
        // Add 'id' column with 'row-<index>' format
        const fileSubPrunedDataWithId = fileSubPrunedData.map((row, index) => ({ ...row, id: index }));
        const fileSub_table_full_withId = filesSubTableFull
            ? filesSubTableFull.map((row, index) => ({ ...row, id: index }))
            : [];

        const priorityFileCols = ['filename', 'file_local_id', 'data_type_name', 'assay_type_name', 'analysis_type_name', 'size_in_bytes', 'persistent_id']; // priority columns to show up early

        const newFileSubColumns = priorityFileCols.filter(item => dynamicFileSubColumns.includes(item));
        const staticPriorityFileCols = priorityFileCols.filter(item => !dynamicFileSubColumns.includes(item)); // priority columns that are static, don't change with 

        const remainingDynamicCols = dynamicFileSubColumns.filter(item => !newFileSubColumns.includes(item));
        const finalNewFileSubColumns = newFileSubColumns.concat(remainingDynamicCols); // concatenate remaining dynamic columns to the final list

        const reorderedFileSubStaticCols = reorderStaticCols(staticFileSubColumns, staticPriorityFileCols);


        const fileSub_table_label_base = "Files that describe subject";
        const count_file_sub_table_withlimit = filesSubTableFull.length ?? 0;

        const downloadFilename = generateHashedJSONFilename("FilesSubjectTable_", searchParams);
        const categories: Category[] = [];


        addCategoryColumns(reorderedFileSubStaticCols, getNameFromFileProjTable, fileSub_table_label_base, categories);

        const category = categories[0];
        const fileSubTableTitle = fileSub_table_label_base + ": " + get_partial_list_string(countFileSub, count_file_sub_table_withlimit, file_count_limit_sub);
        const downloadData = category?.metadata
            ? category.metadata
                .filter(item => item && item.value !== null)  // Only include items with a non-null value
                .map(item => ({ [item.label]: item.value }))  // Create an object with label as the key and value as the value
            : []; // If category is not present, return an empty array

        return (
            <Grid container spacing={0} direction="column" sx={{ maxWidth: '100%' }}>
                {category && (
                    <Grid item xs={12} sx={{ maxWidth: '100%' }}>
                        <Card variant="outlined" sx={{ mb: 0, borderBottom: "none" }}>
                            <CardContent id={`card-content-${category.title}`}>
                                <Typography variant="h5" component="div">
                                    {category.title + " (Uniform Columns) Count: " + countFileSub}
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
                {countFileSub === 1 && (
                    <Grid item xs={12}>
                        <DownloadButton
                            data={downloadData}
                            filename={downloadFilename}
                            name="Download Metadata"
                        />
                    </Grid>
                )}
                <Grid item xs={12} sx={{ maxWidth: '100%' }}>
                    {(count_file_sub_table_withlimit > 0) && (
                        <ExpandableTable
                            data={fileSubPrunedDataWithId}
                            full_data={fileSub_table_full_withId}
                            downloadFileName={downloadFilename} // {recordInfoHashFileName + "_FilesSubTable.json"}
                            drsBundle
                            tableTitle={fileSubTableTitle}
                            searchParams={searchParams}
                            count={count_file_sub_table_withlimit} // Provide count directly as a prop
                            colNames={finalNewFileSubColumns}
                            dynamicColumns={finalNewFileSubColumns}
                            tablePrefix="fileSubTbl"
                        />
                    )}
                </Grid>
            </Grid>
        );




    } catch (error) {
        console.error("Error fetching FilesSub table:", error);
        return <div>Error fetching Files related to Subject table: {(error as Error).message}</div>;
    }
}