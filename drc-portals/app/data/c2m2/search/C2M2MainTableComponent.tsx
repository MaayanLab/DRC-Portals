
import React, { useState, useEffect } from 'react';; // Ensure React and useState are imported
import prisma from '@/lib/prisma/c2m2';
import SQL from '@/lib/prisma/raw';
import { generateFilterQueryString } from '@/app/data/c2m2/utils';
import { Typography } from '@mui/material'; // Add CircularProgress for loading state
import Link from "@/utils/link";
import { getDCCIcon, getdccCFlink, capitalizeFirstLetter, isURL, generateMD5Hash, sanitizeFilename } from "@/app/data/c2m2/utils";
import { RowType } from '../utils';
import { SearchablePagedTableCellIcon, PreviewButton, Description } from "@/app/data/c2m2/SearchablePagedTable";
import C2M2MainSearchTable from './C2M2MainSearchTable';

interface C2M2SearchResult {
    records: {
        /* searchable: string, */
        rank: number,
        dcc_name: string,
        dcc_abbreviation: string,
        dcc_short_label: string,
        taxonomy_name: string,
        taxonomy_id: string,
        disease_name: string,
        disease: string,
        anatomy_name: string,
        anatomy: string,
        biofluid_name: string,
        biofluid: string,
        gene_name: string,
        gene: string,
        protein_name: string,
        protein: string,
        compound_name: string,
        compound: string,
        data_type_name: string,
        data_type: string,
        assay_type_name: string,
        assay_type: string,
        project_name: string,
        project_persistent_id: string,
        count: number,
        count_bios: number,
        count_sub: number,
        count_col: number,
        record_info_url: string
    }[];
    filter_count: number;
}

export default async function C2M2MainSearchTableComponent({ searchParams, main_table }: { searchParams: any, main_table: string }): Promise<JSX.Element> {
    console.log("In C2M2MainTableComponent");
    console.log("q = " + searchParams.q);

    try {
        if (!searchParams.q) return <Typography>No query specified</Typography>;


        const currentPage = searchParams.C2M2MainSearchTbl_p ? +searchParams.C2M2MainSearchTbl_p : 1;
        const offset = (currentPage - 1) * searchParams.r;
        const limit = searchParams.r;

        const filterClause = generateFilterQueryString(searchParams, "allres_full");
        console.log("DONE WITH filterClause generation " + JSON.stringify(filterClause));
        const query = SQL.template`
            WITH 
            allres AS (
                SELECT DISTINCT
                    /* allres_full.searchable AS searchable, */
                    ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) AS rank,
                    allres_full.dcc_name AS dcc_name,
                    allres_full.dcc_abbreviation AS dcc_abbreviation,
                    SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
                    COALESCE(allres_full.project_local_id, 'Unspecified') AS project_local_id,
                    COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
                    SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
                    COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
                    REPLACE(allres_full.disease, ':', '_') AS disease,
                    COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
                    REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
                    COALESCE(allres_full.biofluid_name, 'Unspecified') AS biofluid_name,
                    REPLACE(allres_full.biofluid, ':', '_') AS biofluid,
                    COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
                    allres_full.gene AS gene,
                    COALESCE(allres_full.protein_name, 'Unspecified') AS protein_name,
                    allres_full.protein AS protein,
                    COALESCE(allres_full.compound_name, 'Unspecified') AS compound_name,
                    allres_full.substance_compound AS compound,
                    COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
                    REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
                    COALESCE(allres_full.assay_type_name, 'Unspecified') AS assay_type_name,
                    REPLACE(allres_full.assay_type_id, ':', '_') AS assay_type,
                    COALESCE(allres_full.project_name, concat_ws('', 'Dummy: Biosample/Collection(s) from ', 
                        SPLIT_PART(allres_full.dcc_abbreviation, '_', 1))) AS project_name,
                    allres_full.project_persistent_id AS project_persistent_id
                FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} AS allres_full 
                WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q})
                    ${!filterClause.isEmpty() ? SQL.template`AND ${filterClause}` : SQL.empty()}
                ORDER BY rank DESC, dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, biofluid_name, gene_name, 
                    protein_name, compound_name, data_type_name, assay_type_name
                OFFSET ${offset} 
                LIMIT 100
            ),

            allres_filtered AS (
                SELECT allres.*,
                /* SELECT distinct allres.* except rank, DID NOT WORK ; difference of 0.002 vs 0.00204 is leading to two identical records being listed */ 
                concat_ws('', '/data/c2m2/search/record_info?q=', ${searchParams.q}, '&t=', 'dcc_name:', allres.dcc_name, 
                '|project_local_id:', allres.project_local_id, 
                '|disease_name:', allres.disease_name, 
                '|ncbi_taxonomy_name:', allres.taxonomy_name, 
                '|anatomy_name:', allres.anatomy_name, 
                '|biofluid_name:', allres.biofluid_name,
                '|gene_name:', allres.gene_name, 
                '|protein_name:', allres.protein_name,
                '|compound_name:', allres.compound_name, 
                '|data_type_name:', allres.data_type_name, 
                '|assay_type_name:', allres.assay_type_name) AS record_info_url
                FROM allres
            ),
            filtered_count AS (
                SELECT count(*)::int AS count
                FROM allres_filtered
            ),
            allres_limited AS (
                SELECT *
                FROM allres_filtered
                LIMIT ${limit}
            )
            
            
            
            SELECT
            (SELECT COALESCE(jsonb_agg(allres_limited.*), '[]'::jsonb) AS records FROM allres_limited), 
            (SELECT count FROM filtered_count) AS filter_count
        `.toPrismaSql();

        const t0: number = performance.now();
        const results = await prisma.$queryRaw<C2M2SearchResult[]>(query);
        const t1: number = performance.now();
        console.log("------------- Elapsed time for C2M2MainTableComponent DB queries: ", t1 - t0, " milliseconds");



        // Assuming you want to process the first result in the array
        const result = results[0];
        const records = result?.records ?? [];

        // For debug:
        console.log("records: ", records);

        if (records.length === 0) {
            return <div><Typography>No results found</Typography></div>;
        }

        // Generate dynamic filename based on q and t

        const qString = JSON.stringify(searchParams.q);
        const tString = JSON.stringify(searchParams.t);

        // Concatenate qString and tString into a single string
        const concatenatedString = `${qString}${tString}`;
        const searchHashFileName = generateMD5Hash(concatenatedString);
        const qStringClean = sanitizeFilename(qString, '__');

        const downloadFileName = "CFDEC2M2MainSearchTable_" + qStringClean + "_" + searchHashFileName;



        const tableRows: RowType[] = records.map((res, index) => ({
            id: `row-${index}`, // Generate an ID using the index, prefixed for clarity
            previewButton: <PreviewButton href={res.record_info_url} alt="More details about this result" />,
            //dccIcon: <SearchablePagedTableCellIcon href={`/info/dcc/${res.dcc_short_label}`} src={getDCCIcon(res.dcc_short_label)} alt={res.dcc_short_label} />,
            dccIcon: <SearchablePagedTableCellIcon href={`/info/dcc/${getdccCFlink(res.dcc_short_label)}`} src={getDCCIcon(res.dcc_short_label)} alt={res.dcc_short_label} />,
            projectName: (res.project_persistent_id && isURL(res.project_persistent_id))
                ? <Typography color="secondary"><Link href={`${res.project_persistent_id}`} className="underline cursor-pointer" target="_blank"><u>{res.project_name}</u></Link></Typography>
                : <Description description={res.project_name} />,
            attributes: (
                <>
                    {res.taxonomy_name !== "Unspecified" && (
                        <>
                            <span>Species: </span>
                            <Link href={`https://www.ncbi.nlm.nih.gov/taxonomy/?term=${res.taxonomy_id}`} target="_blank"><i><u>{res.taxonomy_name}</u></i></Link>
                            <br />
                        </>
                    )}
                    {res.disease_name !== "Unspecified" && (
                        <>
                            <span>Disease: </span>
                            <Link href={`http://purl.obolibrary.org/obo/${res.disease}`} target="_blank"><i><u>{capitalizeFirstLetter(res.disease_name)}</u></i></Link>
                            <br />
                        </>
                    )}
                    {res.anatomy_name !== "Unspecified" && (
                        <>
                            <span>Sample source: </span>
                            <Link href={`http://purl.obolibrary.org/obo/${res.anatomy}`} target="_blank"><i><u>{capitalizeFirstLetter(res.anatomy_name)}</u></i></Link>
                            <br />
                        </>
                    )}
                    {res.biofluid_name !== "Unspecified" && (
                        <>
                            <span>Biofluid: </span>
                            <Link href={`http://purl.obolibrary.org/obo/${res.biofluid}`} target="_blank"><i><u>{capitalizeFirstLetter(res.biofluid_name)}</u></i></Link>
                            <br />
                        </>
                    )}
                    {res.gene_name !== "Unspecified" && (
                        <>
                            <span>Gene: </span>
                            <Link href={`http://www.ensembl.org/id/${res.gene}`} target="_blank"><i><u>{res.gene_name}</u></i></Link>
                            <br />
                        </>
                    )}
                    {res.protein_name !== "Unspecified" && (
                        <>
                            <span>Protein: </span>
                            <Link href={`https://www.uniprot.org/uniprotkb/${res.protein}`} target="_blank"><i><u>{res.protein_name}</u></i></Link>
                            <br />
                        </>
                    )}
                    {res.compound_name !== "Unspecified" && (
                        <>
                            <span>Compound: </span>
                            <Link href={`https://pubchem.ncbi.nlm.nih.gov/compound/${res.compound}`} target="_blank"><i><u>{res.compound_name}</u></i></Link>
                            <br />
                        </>
                    )}
                    {res.data_type_name !== "Unspecified" && (
                        <>
                            <span>Data type: </span>
                            <Link href={res.data_type.startsWith("ILX") || res.data_type.startsWith("ILX_")
                                ? `https://scicrunch.org/scicrunch/interlex/view/${res.data_type}`
                                : `http://edamontology.org/${res.data_type}`
                            } target="_blank">
                                <i><u>{capitalizeFirstLetter(res.data_type_name)}</u></i>
                            </Link>
                            <br />
                        </>
                    )}

                    {res.assay_type_name !== "Unspecified" && (
                        <>
                            <span>Assay type: </span>
                            <Link href={`http://purl.obolibrary.org/obo/${res.assay_type}`} target="_blank"><i><u>{capitalizeFirstLetter(res.assay_type_name)}</u></i></Link>
                            <br />
                        </>
                    )}
                </>
            ),
            /* assets: (
              <>
                Subjects: {res.count_sub}<br />
                Biosamples: {res.count_bios}<br />
                Collections: {res.count_col}<br />
              </>
            ) */
        }));


        const filterCount = result?.filter_count;
        console.log("Main Table Filter count: " + filterCount);
        console.log("tableRows length = " + tableRows.length);

        const apiEndpoint = '/data/c2m2/get-data'; // Replace with your actual API endpoint

        // Prepare the table columns
        const tableCols = [
            <>View</>,
            <>DCC</>,
            <>Project Name</>,
            <>Attributes</>,
        ];


        return (
            <div>
                <C2M2MainSearchTable
                    q={searchParams.q ?? ''}
                    p={searchParams.p}
                    r={searchParams.r}
                    count={filterCount + offset}
                    t={searchParams.t}
                    columns={tableCols}
                    rows={tableRows}
                    tablePrefix="C2M2MainSearchTbl"
                    data={records}
                    downloadFileName={downloadFileName}
                    apiEndpoint={apiEndpoint}
                />
            </div>

        );

    } catch (error) {
        console.error("Error fetching C2M2 Main table:", error);

        // Check if the error is a timeout error
        if (error instanceof Error && error.message.includes("Timed out")) {
            console.error("");
            return <div>Error fetching C2M2 Main table: This error was caused by a timeout. Please narrow down your search.</div>;
        }

        // General error handling
        return <div>Error fetching C2M2 Main table: {(error as Error).message}</div>;
    }

}
