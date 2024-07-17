import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import React from 'react';
import Link from "next/link";
import { isURL, MetadataItem, reorderStaticCols, get_partial_list_string, pruneAndRetrieveColumnNames, generateHashedJSONFilename, addCategoryColumns, getNameFromFileProjTable, Category } from "@/app/data/c2m2/utils";
import ExpandableTable from "../ExpandableTable";
import { Grid, Typography, Card, CardContent } from "@mui/material";

interface FileColTableResult {
    count_file_col: number;
    file_col_table: {
        file_id_namespace: string,
        file_local_id: string,
        collection_id_namespace: string,
        collection_local_id: string,
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
    file_col_table_full: {
        file_id_namespace: string,
        file_local_id: string,
        collection_id_namespace: string,
        collection_local_id: string,
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
}

const renderMetadataValue = (item: MetadataItem) => {
    if (typeof item.value === 'string' && item.label === 'Persistent ID' && isURL(item.value)) {
        return (
            <Link prefetch={false} href={item.value} className="underline cursor-pointer text-blue-600" target="_blank" rel="noopener noreferrer" key={item.value}>
                {item.value}
            </Link>
        );
    }
    return item.value;
};

export default async function FilesCollectionTableComponent({ searchParams, filterClause, fileColTblOffset, limit, file_count_limit_col }: { searchParams: any, filterClause: SQL, fileColTblOffset: number, limit: number, file_count_limit_col: number }): Promise<JSX.Element> {
    console.log("In FilesColTableComponent");
    console.log("q = " + searchParams.q);
    try {
        const query = SQL.template`
        WITH allres_full AS (
            SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) as "rank"
            FROM c2m2.ffl_biosample_collection
            WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q})
            ${!filterClause.isEmpty() ? `and ${filterClause}` : SQL.empty()}
            ORDER BY rank DESC
        ), 
        unique_info AS (
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
        col_info AS (
            SELECT DISTINCT 
              allres_full.collection_id_namespace,
              allres_full.collection_local_id
            FROM allres_full
          ), 
          file_table_keycol AS (
            SELECT DISTINCT 
                f.id_namespace,
                f.local_id,
                f.project_id_namespace,
                f.project_local_id
            FROM c2m2.file AS f
            INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                                    AND f.project_id_namespace = ui.project_id_namespace
                                    AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) )
          ),
          file_col_table_keycol AS (
              SELECT DISTINCT fdc.file_id_namespace, fdc.file_local_id, fdc.collection_id_namespace, fdc.collection_local_id,
              f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
              f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
              f.file_format, f.compression_format,  f.mime_type, f.dbgap_study_id,
              dt.name AS data_type_name, at.name AS assay_type_name, aty.name AS analysis_type_name
            FROM c2m2.file_describes_in_collection fdc
              INNER JOIN file_table_keycol ftk ON 
              (ftk.local_id = fdc.file_local_id AND ftk.id_namespace = fdc.file_id_namespace)
              INNER JOIN col_info ON 
              (col_info.collection_local_id = fdc.collection_local_id AND col_info.collection_id_namespace = fdc.collection_id_namespace)
              INNER JOIN c2m2.file AS f ON (f.local_id = ftk.local_id AND f.id_namespace = ftk.id_namespace)
              INNER JOIN unique_info ui ON (f.project_local_id = ui.project_local_id 
                AND f.project_id_namespace = ui.project_id_namespace
                AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) )
              LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
              LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id
              LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
            ),
            file_col_table AS (
              SELECT * from file_col_table_keycol
              LIMIT ${file_count_limit_col}    
            ),
            file_col_table_limited AS (
              SELECT * 
              FROM file_col_table
              OFFSET ${fileColTblOffset}
              LIMIT ${limit}
            ),
            count_file_col AS (
              SELECT COUNT(*)::int AS count
              FROM file_col_table_keycol
            )
        SELECT
            (SELECT count FROM count_file_col) AS count_file_col,
            (SELECT COALESCE(jsonb_agg(file_col_table_limited.*), '[]'::jsonb) FROM file_col_table_limited) AS file_col_table,
            (SELECT COALESCE(jsonb_agg(file_col_table.*), '[]'::jsonb) FROM file_col_table) AS file_col_table_full
        `.toPrismaSql();

        const t0: number = performance.now();
        const results = await prisma.$queryRaw<FileColTableResult[]>(query);
        const t1: number = performance.now();
        console.log("Elapsed time for FilesCollectionTableComponent queries: ", t1 - t0, " milliseconds");

        if (!results || results.length === 0) {
            return <></>;
        }

        // Assuming you want to process the first result in the array
        const firstResult = results[0];
        const countFileCol = firstResult.count_file_col ?? 0;    
        const filesColTable = firstResult.file_col_table ?? [];
        const filesColTableFull = firstResult.file_col_table_full ?? [];

        if (filesColTable.length === 0 || filesColTableFull.length === 0) {
            return <></>;
        }

        const filesCol_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'file_id_namespace', 'collection_id_namespace', 'collection_local_id'];
        const { 
            prunedData: fileColPrunedData, 
            columnNames: fileColColNames, 
            dynamicColumns: dynamicFileColColumns,
            staticColumns: staticFileColColumns 
        } = pruneAndRetrieveColumnNames(
            filesColTable ?? [],
            filesColTableFull ?? [], 
            filesCol_table_columnsToIgnore
        );
        // Add 'id' column with 'row-<index>' format
        const fileColPrunedDataWithId = fileColPrunedData.map((row, index) => ({ ...row, id: index }));
        const fileCol_table_full_withId = filesColTableFull
            ? filesColTableFull.map((row, index) => ({ ...row, id: index }))
            : [];

        const priorityFileCols = ['filename', 'local_id', 'assay_type_name', 'analysis_type_name', 'size_in_bytes'];

        const newFileColColumns = priorityFileCols.filter(item => dynamicFileColColumns.includes(item)); 
        const staticPriorityFileCols = priorityFileCols.filter(item => !dynamicFileColColumns.includes(item)); // priority columns that are static, don't change with 

        const remainingDynamicCols = dynamicFileColColumns.filter(item => !newFileColColumns.includes(item)); 
        const finalNewFileColColumns = newFileColColumns.concat(remainingDynamicCols); // concatenate remaining dynamic columns to the final list
        
        const reorderedFileColStaticCols = reorderStaticCols(staticFileColColumns, staticPriorityFileCols);
    
        const fileCol_table_label_base = "Files that describe OR are in collection";
        const downloadFilename = generateHashedJSONFilename("FilesCollectionTable_", searchParams);
        
        const categories: Category[] = [];
    
    
        const count_file_col_table_withlimit = filesColTableFull.length ?? 0;

        addCategoryColumns(reorderedFileColStaticCols, getNameFromFileProjTable, fileCol_table_label_base, categories);
    
        const fileColTableTitle = fileCol_table_label_base + ": " + get_partial_list_string(countFileCol, count_file_col_table_withlimit, file_count_limit_col);
        const category = categories[0];
        return (
            <Grid container spacing={2} direction="column" sx={{ maxWidth: '100%' }}>
                {category && (
                    <Grid item xs={12} sx={{ maxWidth: '100%' }}>
                        <Card variant="outlined" sx={{ mb: 2 }}>
                            <CardContent id={`card-content-${category.title}`}>
                                <Typography variant="h5" component="div">
                                    {category.title + " (Uniform Columns) Count: "+ countFileCol}
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
                {(count_file_col_table_withlimit > 0 ) && (
                    <ExpandableTable
                        data={fileColPrunedDataWithId}
                        full_data={fileCol_table_full_withId}
                        downloadFileName={downloadFilename}
                        drsBundle
                        tableTitle={fileColTableTitle}
                        searchParams={searchParams}
                        count={count_file_col_table_withlimit}
                        colNames={finalNewFileColColumns}
                        dynamicColumns={finalNewFileColColumns}
                        tablePrefix="fileColTbl"
                    />
                )}
                </Grid>
            </Grid>
        );       

    } catch (error) {
        console.error("Error fetching FilesCol table:", error);
        return <div>Error fetching Files related to Collection table: {(error as Error).message}</div>;
    }
}
