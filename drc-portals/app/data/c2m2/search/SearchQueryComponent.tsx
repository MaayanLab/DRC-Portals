// SearchQueryComponent.tsx
import { generateFilterQueryString, update_q_to_exclude_gender } from '@/app/data/c2m2/utils';
import prisma from '@/lib/prisma/c2m2';
import { useSanitizedSearchParams } from "@/app/data/c2m2/utils";
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet"

import ListingPageLayout from "../ListingPageLayout";
import { Button } from "@mui/material";
import { redirect } from "next/navigation";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "@/utils/link";
import { getDCCIcon, capitalizeFirstLetter, isURL, generateMD5Hash, sanitizeFilename } from "@/app/data/c2m2/utils";
import SQL from '@/lib/prisma/raw';
import C2M2MainTableComponent from './C2M2MainTableComponent';
import { FancyTab } from '@/components/misc/FancyTabs';
import AssayTypeFilterComponent from './AssayTypeFilterComponent';
import DCCFilterComponent from './DCCFilterComponent';
import DataTypeFilterComponent from './DataTypeFilterComponent';
import CompoundFilterComponent from './CompoundFilterComponent';
import ProteinFilterComponent from './ProteinFilterComponent';
import GeneFilterComponent from './GeneFilterComponent';
import AnatomyFilterComponent from './AnatomyFilterComponent';
import BiofluidFilterComponent from './BiofluidFilterComponent';
import TaxonomyFilterComponent from './TaxonomyFilterComponent';
import DiseaseFilterComponent from './DiseaseFilterComponent';
import SubjectEthnicityFilterComponent from './SubjectEthnicityFilterComponent';
import SubjectSexFilterComponent from './SubjectSexFilterComponent';
import SubjectRaceFilterComponent from './SubjectRaceFilterComponent';
import React, { Suspense } from "react";
import { safeAsync } from '@/utils/safe';
import DownloadAllButton from '../DownloadAllButton';
import c2m2 from '@/lib/prisma/c2m2';

//------ To debug the database connection if needed, include the code from the file debug_db_connection.tsx, once done, delete only that code from here -------
// Do not delete the abive comment line



const allres_filtered_maxrow_limit = 500000; // Not in use after Aug 15
var super_offset = 0;
const super_limit = 500000;



export const main_table = 'ffl_biosample_collection_cmp'; // 'ffl_biosample_collection' or 'ffl_biosample_collection_cmp'

type PageProps = { search: string, searchParams: Record<string, string> }





// Adding a specialized query for count purpose only.

const doQueryCount = React.cache(async (props: PageProps) => {
  const searchParams = useSanitizedSearchParams({ searchParams: { ...props.searchParams, q: props.search } });
  if (!searchParams.q) return null;
  searchParams.q = update_q_to_exclude_gender(searchParams.q);

  // Prepare the filter clause, similar to the original doQuery function
  const filterClause = generateFilterQueryString(searchParams, "allres_full");

  // Query to fetch the count of records only
  const [result] = await prisma.$queryRaw<Array<{
    count: number;
  }>>(SQL.template`
    WITH 
    allres AS (
      SELECT DISTINCT
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
          COALESCE(allres_full.subject_ethnicity_name, 'Unspecified') AS subject_ethnicity_name,
          allres_full.subject_ethnicity AS subject_ethnicity,
          COALESCE(allres_full.subject_sex_name, 'Unspecified') AS subject_sex_name,
          allres_full.subject_sex AS subject_sex,
          COALESCE(allres_full.subject_race_name, 'Unspecified') AS subject_race_name,
          allres_full.subject_race AS subject_race,
          COALESCE(allres_full.project_name, concat_ws('', 'Dummy: Biosample/Collection(s) from ', 
              SPLIT_PART(allres_full.dcc_abbreviation, '_', 1))) AS project_name,
          allres_full.project_persistent_id AS project_persistent_id
      FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} AS allres_full 
      WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q})
          ${!filterClause.isEmpty() ? SQL.template`AND ${filterClause}` : SQL.empty()}
      ORDER BY  rank DESC,  dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, biofluid_name, gene_name, 
          protein_name, compound_name, data_type_name, assay_type_name, subject_ethnicity_name, subject_sex_name, subject_race_name
  ),
    
    
    total_count AS (
      SELECT count(*)::int as count
      FROM allres
    )
    
    SELECT count FROM total_count
  `.toPrismaSql());

  return result?.count ?? 0;
});

// THis has the original query
const doQueryTotalFilteredCount = React.cache(async (searchParams: any) => {
  searchParams.q = update_q_to_exclude_gender(searchParams.q);
  console.log("In doQueryTotalFilteredCount");

  if (!searchParams.q) return;

  const currentPage = searchParams.C2M2MainSearchTbl_p ? +searchParams.C2M2MainSearchTbl_p : 1;
  const offset = (currentPage - 1) * searchParams.r;
  const limit = searchParams.r;

  const filterClause = generateFilterQueryString(searchParams, "allres_full");
  console.log("FILTER CLAUSE = " + JSON.stringify(filterClause));

  const t0: number = performance.now();
  const [results] = await prisma.$queryRaw<Array<{
    filtered_count: number,
  }>>(SQL.template`
    WITH 
    allres_exp AS (
      SELECT /* DISTINCT */
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
        COALESCE(allres_full.subject_ethnicity_name, 'Unspecified') AS subject_ethnicity_name,
        allres_full.subject_ethnicity AS subject_ethnicity,
        COALESCE(allres_full.subject_sex_name, 'Unspecified') AS subject_sex_name,
        allres_full.subject_sex AS subject_sex,
        COALESCE(allres_full.subject_race_name, 'Unspecified') AS subject_race_name,
        allres_full.subject_race AS subject_race,
        COALESCE(allres_full.project_name,    concat_ws('', 'Dummy: Biosample/Collection(s) from ', 
          SPLIT_PART(allres_full.dcc_abbreviation, '_', 1)) ) AS project_name,
        allres_full.project_persistent_id as project_persistent_id
      FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} as allres_full 
      WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
    ),

    allres AS (
      SELECT DISTINCT 
        rank,
        dcc_name,
        dcc_abbreviation,
        dcc_short_label,
        project_local_id,
        taxonomy_name,
        taxonomy_id,
        disease_name,
        disease,
        anatomy_name,
        anatomy,
        biofluid_name,
        biofluid,
        gene_name,
        gene,
        protein_name,
        protein,
        compound_name,
        compound,
        data_type_name,
        data_type,
        assay_type_name,
        assay_type,
        subject_ethnicity_name,
        subject_ethnicity,
        subject_sex_name,
        subject_sex,
        subject_race_name,
        subject_race,
        project_name,
        project_persistent_id
      FROM allres_exp 
      ORDER BY rank DESC, dcc_short_label, project_name , disease_name, taxonomy_name, anatomy_name, biofluid_name, gene_name, 
        protein_name, compound_name, data_type_name, assay_type_name, subject_ethnicity_name, subject_sex_name, subject_race_name
      OFFSET ${super_offset}
      LIMIT ${super_limit} 
    ),

    allres_filtered_count AS (SELECT count(*)::int as filtered_count FROM allres )
    
    
    SELECT 
    (SELECT filtered_count FROM allres_filtered_count) as filtered_count
  `.toPrismaSql());

  return results;
});



/* export async function SearchQueryComponentTab(props: { search: string }) {
  const results = await safeAsync(() => doQueryCount({ ...props, searchParams: {} }))
  if (results.error) console.error(results.error)
  if (!results.data) return <FancyTab id="c2m2" priority={Infinity} label={<>Cross-Cut Metadata</>} hidden />
  return <FancyTab id="c2m2" priority={Infinity} label={<>Cross-Cut Metadata<br />{results.data.all_count ? BigInt(results.data.all_count).toLocaleString() : null }</>} hidden={results.data.all_count === 0} />
} */

export async function SearchQueryComponentTab(props: { search: string }) {

  const t0: number = performance.now();

  // Call doQueryCount to get the count of records
  const results = await safeAsync(() => doQueryCount({ ...props, searchParams: {} }));

  const t1: number = performance.now();
  console.log("---- Elapsed time for C2M2 Tab count DB queries: ", t1 - t0, " milliseconds");

  // Error handling
  if (results.error) {
    console.error(results.error);
    return <FancyTab id="c2m2" priority={Infinity} label={<>Cross-Cut Metadata</>} hidden />;
  }

  // If no data is returned, or count is 0, hide the tab
  if (!results.data || results.data === 0) {
    return <FancyTab id="c2m2" priority={Infinity} label={<>Cross-Cut Metadata</>} hidden />;
  }
  console.log("Count from doQueryCount " + results.data);
  // Render the tab with the count formatted as a localized string
  return (
    <FancyTab
      id="c2m2"
      priority={Infinity}
      label={<>Cross-Cut Metadata<br />{results.data ? BigInt(results.data).toLocaleString() : null}</>}
      hidden={results.data === 0}
    />
  );
}


/* export async function SearchQueryComponentTab(props: { search: string }) {
  //const results = await safeAsync(() => doQuery({ ...props, searchParams: {} }))
  //if (results.error) console.error(results.error)
  //if (!results.data) return <FancyTab id="c2m2" priority={Infinity} label={<>Cross-Cut Metadata</>} hidden />
  return <FancyTab id="c2m2" priority={Infinity} label={<>Cross-Cut Metadata<br /></>}  />
} */
// Adding this query asynchronously to get filtered counts for Results found section





export async function SearchQueryComponent(props: PageProps) {
  const searchParams = useSanitizedSearchParams({ searchParams: { ...props.searchParams, q: props.search } });
  if (!searchParams.q) return

  searchParams.q = update_q_to_exclude_gender(searchParams.q);

  //const filterClause = generateFilterQueryString(searchParams, "ffl_biosample_collection");
  const filterClause = generateFilterQueryString(searchParams, main_table);

  const currentPage = searchParams.C2M2MainSearchTbl_p ? +searchParams.C2M2MainSearchTbl_p : 1;
  const offset = (currentPage - 1) * searchParams.r;
  console.log("CALCULATED currentPage in SearchQueryComponent = " + currentPage);
  console.log("CALCULATED OFFSET in SearchQueryComponent = " + offset);



  // this is for filters count limit, passed to various filters for lazy loading
  const maxCount = 1000;
  try {

    const t0: number = performance.now();

    // Call the doQueryTotalFilteredCount function and handle the result
    const qryCnt_res = await doQueryTotalFilteredCount(searchParams);

    const t1: number = performance.now();
    console.log("---- Elapsed time for filtered count DB queries: ", t1 - t0, " milliseconds");

    console.log("doQueryTotal filtered_count = " + qryCnt_res?.filtered_count);


    return (
      <ListingPageLayout
        //count={qryCnt_res.data?.count ?? 0}   This matches with #records in the table on the right (without limit)
        filtered_count={qryCnt_res?.filtered_count ?? 0}
        all_count_limit={super_limit}
        searchText={searchParams.q}
        filters={
          <>
            <React.Suspense fallback={<>Loading..</>}>
              <DiseaseFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <TaxonomyFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <AnatomyFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <BiofluidFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <GeneFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <ProteinFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <CompoundFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <DataTypeFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <AssayTypeFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <SubjectEthnicityFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <SubjectSexFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <SubjectRaceFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>

            <React.Suspense fallback={<>Loading..</>}>
              <DCCFilterComponent q={searchParams.q ?? ''} filterClause={filterClause} maxCount={maxCount} main_table={main_table} />
            </React.Suspense>


          </>
        }
        footer={
          <Link href="/data">
            <Button
              sx={{ textTransform: "uppercase" }}
              color="primary"
              variant="contained"
              startIcon={<Icon path={mdiArrowLeft} size={1} />}>
              BACK TO SEARCH
            </Button>
          </Link>
        }
      >
        {/* Search tags are part of SearchablePagedTable. No need to send the selectedFilters as string instead we send searchParams.t*/}

        <C2M2MainTableComponent
          searchParams={searchParams}
          main_table={main_table}
        />

      </ListingPageLayout>
    )


  } catch (error) {
    console.error('Error fetching query results:', error);
    return <>
      <div className="mb-10">Error fetching query results.</div>
      <Link href="/data">
        <Button
          sx={{ textTransform: "uppercase" }}
          color="primary"
          variant="contained"
          startIcon={<Icon path={mdiArrowLeft} size={1} />}>
          BACK TO SEARCH
        </Button>
      </Link>
    </>
  }


}
