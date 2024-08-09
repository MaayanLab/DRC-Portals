// app/api/get-data/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateFilterQueryString } from '@/app/data/c2m2/utils';
import { useSanitizedSearchParams } from "@/app/data/c2m2/utils";
import SQL from '@/lib/prisma/raw';

const prisma = new PrismaClient();

function getSearchParams(url: string): Record<string, string | string[] | undefined> {
  const urlObject = new URL(url);
  const searchParams = new URLSearchParams(urlObject.search);

  // Convert URLSearchParams to a plain object
  const params: Record<string, string | string[] | undefined> = {};
  searchParams.forEach((value, key) => {
    // Handle multiple values for the same key
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  });

  return params;
}

export async function GET(request: Request) {
  try {
    // Extract URL and search params
    const url = new URL(request.url);
    const searchParams = getSearchParams(url.toString());

    // Wrap searchParams in an object with the 'searchParams' property
    const sanitizedParams = useSanitizedSearchParams({ searchParams });

    // Extract `q` from sanitizedParams
    const queryParam = Array.isArray(sanitizedParams.q)
      ? sanitizedParams.q.join(' ')
      : sanitizedParams.q ?? '';

    console.log("QueryParam  = "+queryParam)
    // Generate filter clause
    const filterClause = generateFilterQueryString(sanitizedParams, "ffl_biosample_collection");
    console.log("In route.tsx , filterClause = "+ filterClause);
    const allres_filtered_maxrow_limit = 200000; // Adjust the limit as needed

    // Execute the SQL query
    const [results] = await prisma.$queryRaw<Array<{
      records_full: {
        //rank: number,
        dcc_name: string,
        dcc_abbreviation: string,
        dcc_short_label: string,
        taxonomy_name: string,
        taxonomy_id: string,
        disease_name: string,
        disease: string,
        anatomy_name: string,
        anatomy: string,
        gene_name: string,
        gene: string,
        protein_name: string,
        protein: string,
        compound_name: string,
        compound: string,
        data_type_name: string,
        data_type: string,
        project_name: string,
        project_description: string,
        project_persistent_id: string,
        count: number, // this is based on across all-columns of ffl_biosample
        count_bios: number,
        count_sub: number,
        count_col: number,
        record_info_url: string,
      }[],
    }>>(SQL.template`
      WITH allres_full AS (
        SELECT  c2m2.ffl_biosample_collection.*,
          ts_rank_cd(searchable, websearch_to_tsquery('english', ${queryParam})) as "rank"
          FROM c2m2.ffl_biosample_collection
          WHERE searchable @@ websearch_to_tsquery('english', ${queryParam})
          ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
          ORDER BY rank DESC,  dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, 
          protein_name, compound_name, data_type_name  , subject_local_id, biosample_local_id, collection_local_id
          LIMIT ${allres_filtered_maxrow_limit}     
      ),
      allres AS (
        SELECT 
          allres_full.rank AS rank,
          allres_full.dcc_name AS dcc_name,
          allres_full.dcc_abbreviation AS dcc_abbreviation,
          SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
          COALESCE(allres_full.project_local_id, 'Unspecified') AS project_local_id, /* added Unspecified as needed in record_info_col */
          /* CASE WHEN allres_full.ncbi_taxonomy_name IS NULL THEN 'Unspecified' ELSE allres_full.ncbi_taxonomy_name END AS taxonomy_name, */
          COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
          SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
          /* CASE WHEN allres_full.disease_name IS NULL THEN 'Unspecified' ELSE allres_full.disease_name END AS disease_name, */
          COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
          REPLACE(allres_full.disease, ':', '_') AS disease,
          /* CASE WHEN allres_full.anatomy_name IS NULL THEN 'Unspecified' ELSE allres_full.anatomy_name END AS anatomy_name, */
          COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
          REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
          /* CASE WHEN allres_full.gene_name IS NULL THEN 'Unspecified' ELSE allres_full.gene_name END AS gene_name, */
          COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
          allres_full.gene AS gene,
          COALESCE(allres_full.protein_name, 'Unspecified') AS protein_name,
          allres_full.protein AS protein,
          COALESCE(allres_full.compound_name, 'Unspecified') AS compound_name,
          allres_full.substance_compound AS compound,
          COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
          REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
          /* allres_full.project_name AS project_name, */
          COALESCE(allres_full.project_name, 
            concat_ws('', 'Dummy: Biosample/Collection(s) from ', SPLIT_PART(allres_full.dcc_abbreviation, '_', 1))) AS project_name,
          c2m2.project.description AS project_description,
          allres_full.project_persistent_id as project_persistent_id,
          COUNT(*)::INT AS count,
          COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
          COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
          COUNT(DISTINCT collection_local_id)::INT AS count_col
        FROM allres_full 
        LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
          allres_full.project_local_id = c2m2.project.local_id) 
        /* LEFT JOIN c2m2.project_data_type ON (allres_full.project_id_namespace = c2m2.project_data_type.project_id_namespace AND 
          allres_full.project_local_id = c2m2.project_data_type.project_local_id) keep for some time */
        GROUP BY rank, dcc_name, dcc_abbreviation, dcc_short_label, project_local_id, taxonomy_name, taxonomy_id, 
          disease_name, disease, anatomy_name, anatomy, gene_name, gene, protein_name, protein, compound_name, compound,
          data_type_name, data_type, project_name, project_description, allres_full.project_persistent_id 
        ORDER BY rank DESC, dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, gene_name, 
          protein_name, compound_name, data_type_name
      ),
      allres_filtered_count AS (SELECT count(*)::int as filtered_count FROM allres /*${filterClause}*/),
      allres_filtered AS (
        SELECT allres.*, 
        concat_ws('', '/data/c2m2/search/record_info?q=', ${queryParam}, '&t=', 'dcc_name:', allres.dcc_name, 
        '|', 'project_local_id:', allres.project_local_id, '|', 'disease_name:', allres.disease_name, 
        '|', 'ncbi_taxonomy_name:', allres.taxonomy_name, '|', 'anatomy_name:', allres.anatomy_name, 
        '|', 'gene_name:', allres.gene_name, '|', 'protein_name:', allres.protein_name,
        '|', 'compound_name:', allres.compound_name, '|', 'data_type_name:', allres.data_type_name) AS record_info_url
        FROM allres
        
      )
      
      SELECT
      (SELECT COALESCE(jsonb_agg(allres_filtered.*), '[]'::jsonb) AS records_full FROM allres_filtered )
    `.toPrismaSql())
    console.log("route.ts results length = " + (results ? results.records_full.length : "0" ));
    return NextResponse.json(results ? results.records_full : "");
  } catch (error) {
    console.error('Error executing query:', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}