import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import React from 'react';
import Link from "@/utils/link";
import { isURL, MetadataItem, reorderStaticCols, get_partial_list_string, pruneAndRetrieveColumnNames, generateHashedJSONFilename, addCategoryColumns, getNameFromFileProjTable, Category } from "@/app/data/c2m2/utils";
import ExpandableTable from "@/app/data/c2m2/ExpandableTable";
import { Grid, Typography, Card, CardContent } from "@mui/material";

interface FileBiosTableResult {
    file_bios_table_full: {
        file_id_namespace: string,
        file_local_id: string,
        biosample_id_namespace: string,
        biosample_local_id: string,
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
    file_bios_table: {
        file_id_namespace: string,
        file_local_id: string,
        biosample_id_namespace: string,
        biosample_local_id: string,
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
    count_file_bios: number;
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

export default async function FilesBiosampleTableComponent({ searchParams, filterClause, fileBiosTblOffset, limit, file_count_limit_bios }: { searchParams: any, filterClause: SQL, fileBiosTblOffset: number, limit: number, file_count_limit_bios: number }): Promise<JSX.Element> {
    console.log("In FilesBiosTableComponent");
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
                allres_full.biofluid_name,
                allres_full.biofluid,
                allres_full.gene, 
                allres_full.gene_name,
                allres_full.protein, 
                allres_full.protein_name,
                allres_full.substance_compound as compound, 
                allres_full.compound_name,
                allres_full.data_type_id AS data_type, 
                allres_full.data_type_name,
                allres_full.assay_type_id AS assay_type, /****/
                allres_full.assay_type_name /****/
            FROM allres_full
            ),
            bios_info AS (
                SELECT DISTINCT 
                  allres_full.biosample_id_namespace,
                  allres_full.biosample_local_id
                FROM allres_full
            ), /* 2024/03/07 */
            file_table_keycol AS (
                SELECT DISTINCT 
                    f.id_namespace,
                    f.local_id,
                    f.project_id_namespace,
                    f.project_local_id
                FROM c2m2.file AS f
                INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                                        AND f.project_id_namespace = ui.project_id_namespace
                                        AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/ /* 2024/03/07 match data type */
                                        AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
            ),
            file_bios_table_keycol AS (
                SELECT DISTINCT fdb.*,
                f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
                f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
                f.file_format, ff.name AS compression_format,  f.mime_type, f.dbgap_study_id,
                ui.data_type_name, ui.assay_type_name, aty.name AS analysis_type_name /****/
                /**** dt.name AS data_type_name, at.name AS assay_type_name, aty.name AS analysis_type_name ****/
                FROM c2m2.file_describes_biosample fdb
                INNER JOIN file_table_keycol ftk ON 
                (ftk.local_id = fdb.file_local_id AND ftk.id_namespace = fdb.file_id_namespace)
                INNER JOIN bios_info ON 
                (bios_info.biosample_local_id = fdb.biosample_local_id AND bios_info.biosample_id_namespace = fdb.biosample_id_namespace) /* 2024/03/07 match biosample */
                INNER JOIN c2m2.file AS f ON (f.local_id = ftk.local_id AND f.id_namespace = ftk.id_namespace)
                INNER JOIN unique_info ui ON (f.project_local_id = ui.project_local_id 
                  AND f.project_id_namespace = ui.project_id_namespace
                  AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) /****/
                  AND ((f.assay_type = ui.assay_type) OR (f.assay_type IS NULL AND ui.assay_type IS NULL)) ) /****/
                /**** LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
                LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id ****/
                LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
                LEFT JOIN c2m2.file_format AS ff ON f.compression_format = ff.id
                ), /* Mano */
                file_bios_table AS (
                    SELECT * from file_bios_table_keycol
                    limit ${file_count_limit_bios}    
                ),
                file_bios_table_limited as (
                    SELECT * 
                    FROM file_bios_table
                    OFFSET ${fileBiosTblOffset}
                    LIMIT ${limit}
                ), /* Mano */
                count_file_bios AS (
                    select count(*)::int as count
                        from file_bios_table_keycol
                ) /* Mano */ 
                SELECT
                (SELECT count FROM count_file_bios) as count_file_bios,
                (SELECT COALESCE(jsonb_agg(file_bios_table_limited.*), '[]'::jsonb) FROM file_bios_table_limited) AS file_bios_table,
                (SELECT COALESCE(jsonb_agg(file_bios_table.*), '[]'::jsonb) FROM file_bios_table) AS file_bios_table_full
        `.toPrismaSql();
        const t0: number = performance.now();
        const results = await prisma.$queryRaw<FileBiosTableResult[]>(query);
        const t1: number = performance.now();
        console.log("Elapsed time for FilesBiosampleTableComponent queries: ", t1 - t0, " milliseconds");

        if (!results || results.length === 0) {
            return <></>;
        }

        // Assuming you want to process the first result in the array
        const firstResult = results[0];
        const countFileBios = firstResult.count_file_bios ?? 0;
        const filesBiosTable = firstResult.file_bios_table ?? [];
        const filesBiosTableFull = firstResult.file_bios_table_full ?? [];

        if (filesBiosTable.length === 0 || filesBiosTableFull.length === 0) {
            return <></>;
        }


        const filesBios_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'file_id_namespace', 'biosample_id_namespace', 'md5', 'sha256']; // added md5 and sha256 to ignore columns
        const {
            prunedData: fileBiosPrunedData,
            columnNames: fileBiosColNames,
            dynamicColumns: dynamicFileBiosColumns,
            staticColumns: staticFileBiosColumns } = pruneAndRetrieveColumnNames(
                filesBiosTable ?? [],
                filesBiosTableFull ?? [],
                filesBios_table_columnsToIgnore
            );

        // Add 'id' column with 'row-<index>' format
        const fileBiosPrunedDataWithId = fileBiosPrunedData.map((row, index) => ({ ...row, id: index }));
        const fileBios_table_full_withId = filesBiosTableFull
            ? filesBiosTableFull.map((row, index) => ({ ...row, id: index }))
            : [];

        const priorityFileCols = ['filename', 'file_local_id', 'assay_type_name', 'analysis_type_name', 'size_in_bytes', 'persistent_id']; // priority columns to show up early

        const newFileBiosColumns = priorityFileCols.filter(item => dynamicFileBiosColumns.includes(item));
        const staticPriorityFileCols = priorityFileCols.filter(item => !dynamicFileBiosColumns.includes(item)); // priority columns that are static, don't change with 

        const remainingDynamicCols = dynamicFileBiosColumns.filter(item => !newFileBiosColumns.includes(item));
        const finalNewFileBiosColumns = newFileBiosColumns.concat(remainingDynamicCols); // concatenate remaining dynamic columns to the final list

        const reorderedFileBiosStaticCols = reorderStaticCols(staticFileBiosColumns, staticPriorityFileCols);

        // console.log("STATIC FILE BIOS COLS", staticFileBiosColumns);
        // console.log("DYNAMIC FILE BIOS COLS", dynamicFileBiosColumns);
        // console.log("NEW FILE BIOS COLS", finalNewFileBiosColumns);
        // console.log("STATIC PRIORITY FILE COLS", staticPriorityFileCols);


        const fileBios_table_label_base = "Files that describe biosample";

        const count_file_bios_table_withlimit = filesBiosTableFull.length ?? 0;

        const downloadFilename = generateHashedJSONFilename("FilesBiosampleTable_", searchParams);
        const categories: Category[] = [];
        addCategoryColumns(reorderedFileBiosStaticCols, getNameFromFileProjTable, fileBios_table_label_base, categories);
        const category = categories[0];
        const fileBiosTableTitle = fileBios_table_label_base + ": " + get_partial_list_string(countFileBios, count_file_bios_table_withlimit, file_count_limit_bios);

        return (
            <Grid container spacing={0} direction="column" sx={{ maxWidth: '100%' }}>
                {category && (
                    <Grid item xs={12} sx={{ maxWidth: '100%' }}>
                        <Card variant="outlined" sx={{ mb: 0, borderBottom: "none" }}>
                            <CardContent id={`card-content-${category.title}`}>
                                <Typography variant="h5" component="div">
                                    {category.title + " (Uniform Columns) Count: " + countFileBios}
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
                    {(count_file_bios_table_withlimit > 0) && (
                        <ExpandableTable
                            data={fileBiosPrunedDataWithId}
                            full_data={fileBios_table_full_withId}
                            downloadFileName={downloadFilename} // {recordInfoHashFileName + "_FilesBiosTable.json"}
                            drsBundle
                            tableTitle={fileBiosTableTitle}
                            searchParams={searchParams}
                            //count={results?.count_file_bios ?? 0} // Provide count directly as a prop
                            //count={results?.file_bios_table_full.length ?? 0} // Provide count directly as a prop
                            count={count_file_bios_table_withlimit} // Provide count directly as a prop
                            colNames={finalNewFileBiosColumns}
                            dynamicColumns={finalNewFileBiosColumns}
                            tablePrefix="fileBiosTbl"
                        //getNameFromTable={getNameFromFileProjTable}
                        />
                    )}
                </Grid>
            </Grid>
        );


    } catch (error) {
        console.error("Error fetching FilesBios table:", error);
        return <div>Error fetching Files related to Biosamples table: {(error as Error).message}</div>;
    }
}

