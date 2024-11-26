import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import SQL from '@/lib/prisma/raw'; // Import SQL
import { generateFilterClauseFromtParam } from '../utils';
import { main_table } from '../search/SearchQueryComponent';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { q, t, limit, offset } = await request.json();

    // Ensure `limit` is provided and is a valid number
    // const maxLimit = typeof limit === 'number' && limit > 0 ? limit : 200000; // Default to 200,000 if limit is invalid

    // Ensure `offset` is provided and is a valid number
    // const maxOffset = typeof offset === 'number' && offset >= 0 ? offset : 0; // Default to 0 if offset is invalid

    // Validate q and filterClause
    const queryParam = typeof q === 'string' ? q : '';
    console.log("queryParam = " + queryParam);
    const filterClause = generateFilterClauseFromtParam(t, "allres_full"); // Adjust tablename as needed

    // Execute the SQL query
    const [results] = await prisma.$queryRaw<Array<{
      records_full: {
        // Define structure as before
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
        record_info_url: string,
      }[],
    }>>(SQL.template`
    WITH 
    allres AS (
      SELECT DISTINCT
          ts_rank_cd(searchable, websearch_to_tsquery('english', ${queryParam})) AS rank,
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
      WHERE searchable @@ websearch_to_tsquery('english', ${queryParam})
          ${!filterClause.isEmpty() ? SQL.template`AND ${filterClause}` : SQL.empty()}
      ORDER BY rank DESC, dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, biofluid_name, gene_name, 
          protein_name, compound_name, data_type_name, assay_type_name
  ),
      allres_filtered_count AS (SELECT count(*)::int as filtered_count FROM allres),
      allres_filtered AS (
        SELECT allres.*,
        concat_ws('', '/data/c2m2/search/record_info?q=', ${queryParam}, '&t=', 'dcc_name:', allres.dcc_name,
        '|', 'project_local_id:', allres.project_local_id, '|', 'disease_name:', allres.disease_name,
        '|', 'ncbi_taxonomy_name:', allres.taxonomy_name, '|', 'anatomy_name:', allres.anatomy_name,
        '|', 'biofluid_name:', allres.biofluid_name,
        '|', 'gene_name:', allres.gene_name, '|', 'protein_name:', allres.protein_name,
        '|', 'compound_name:', allres.compound_name, '|', 'data_type_name:', allres.data_type_name) AS record_info_url
        FROM allres
      )
      SELECT
      (SELECT COALESCE(jsonb_agg(allres_filtered.*), '[]'::jsonb) AS records_full FROM allres_filtered)
    `.toPrismaSql());

    console.log("route.ts results");
    console.log(results);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
