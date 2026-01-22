import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/c2m2';
import SQL from '@/lib/prisma/raw'; // Import SQL
import { generateFilterClauseFromtParam, generateFilterStringsForURL, generateSelectColumnsStringModified, generateOrderByString } from '../utils';
import { generate_qWITHt_FTQS } from '@/app/data/c2m2/utils';
import { generateFilterStringsForURL_INCtINq_SQLraw } from '../utils';
import { main_table } from '../search/SearchQueryComponent';

const maxTblCount = 100000;

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
    const FilterStringsForURL = generateFilterStringsForURL();
    const selectColumns = generateSelectColumnsStringModified("allres_full");

    // generateFilterStringsForURL_INCtINq_SQLraw results in speed-up by a factor of 2-200
    const FilterStringsForURL_INCtINq_SQLraw = generateFilterStringsForURL_INCtINq_SQLraw('allres'); // can use it or not (set to '')
    const qWITHt_FTQS = generate_qWITHt_FTQS(q, t);
    console.log("qWITHt_FTQS = " + qWITHt_FTQS);

    const orderByClause = generateOrderByString();

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
        subject_ethnicity_name: string,
        subject_ethnicity: string,
        subject_sex_name: string,
        subject_sex: string,
        subject_race_name: string,
        subject_race: string,
        file_format_name: string,
        file_format: string,
        project_name: string,
        project_persistent_id: string,
        ptm_type_name: string, // PTM Type
        ptm_type: string, // PTM Type
        ptm_type_description: string, // PTM Type Description
        ptm_subtype_name: string, // PTM SubType
        ptm_subtype: string, // PTM SubType
        ptm_subtype_description: string, // PTM SubType Description
        ptm_site_type_name: string, // PTM Site Type
        ptm_site_type: string, // PTM Site Type
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
          /* original: ts_rank_cd(searchable, websearch_to_tsquery('english', ${queryParam})) AS rank, */
          ts_rank_cd(searchable, websearch_to_tsquery('english', ${qWITHt_FTQS})) AS rank,
          ${SQL.raw(selectColumns)}
      FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} AS allres_full 
      /* original: WHERE searchable @@ websearch_to_tsquery('english', ${queryParam}) */
      WHERE searchable @@ websearch_to_tsquery('english', ${qWITHt_FTQS})
          ${!filterClause.isEmpty() ? SQL.template`AND ${filterClause}` : SQL.empty()}
      ORDER BY ${SQL.raw(orderByClause)}
      limit ${maxTblCount}
  ),
      allres_filtered_count AS (SELECT count(*)::int as filtered_count FROM allres),
      allres_filtered AS (
        SELECT allres.*,
        concat_ws('', '/data/c2m2/search/record_info?q=', ${queryParam}, ${FilterStringsForURL_INCtINq_SQLraw}, '&t=', 'dcc_name:', allres.dcc_name,
        ${SQL.raw(FilterStringsForURL)}
      ) AS record_info_url
        FROM allres
      )

      SELECT
      (SELECT COALESCE(jsonb_agg(allres_filtered.*), '[]'::jsonb) AS records_full FROM allres_filtered)
    `.toPrismaSql());

    console.log("route.ts results");
    //console.log(results); // May be long array of json objects
    console.log("results[0]: ", results?.records_full[0] ?? []);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
