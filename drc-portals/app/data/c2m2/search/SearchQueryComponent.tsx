// SearchQueryComponent.tsx
import { generateFilterQueryString } from '@/app/data/c2m2/utils';
import prisma from '@/lib/prisma/c2m2';
import { useSanitizedSearchParams, generateSelectColumnsStringModified, generateSelectColumnsStringPlain, generateOrderByString } from "@/app/data/c2m2/utils";


import ListingPageLayout from "../ListingPageLayout";
import { Button } from "@mui/material";

import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "@/utils/link";

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


//------ To debug the database connection if needed, include the code from the file debug_db_connection.tsx, once done, delete only that code from here -------
// Do not delete the abive comment line



const allres_filtered_maxrow_limit = 500000; // Not in use after Aug 15
var super_offset = 0;
const super_limit = 500000;



export const main_table = 'ffl_biosample_collection_cmp'; // 'ffl_biosample_collection' or 'ffl_biosample_collection_cmp'

type PageProps = { search: string, searchParams: Record<string, string> }

const selectColumns = generateSelectColumnsStringModified("allres_full");
const selectColumnsPlain = generateSelectColumnsStringPlain();
const orderByClause = generateOrderByString();


// Adding a specialized query for count purpose only.

const doQueryCount = React.cache(async (props: PageProps) => {
  const searchParams = useSanitizedSearchParams({ searchParams: { ...props.searchParams, q: props.search } });
  if (!searchParams.q) return null;

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
          ${SQL.raw(selectColumns)}
      FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} AS allres_full 
      WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q})
          ${!filterClause.isEmpty() ? SQL.template`AND ${filterClause}` : SQL.empty()}
      ORDER BY  ${SQL.raw(orderByClause)}/* rank DESC,  dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, biofluid_name, gene_name, 
          protein_name, compound_name, data_type_name, assay_type_name, subject_ethnicity_name, subject_sex_name, subject_race_name */
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
        ${SQL.raw(selectColumns)}
      FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} as allres_full 
      WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
    ),

    allres AS (
      SELECT DISTINCT 
        rank,
        ${SQL.raw(selectColumnsPlain)}
      FROM allres_exp 
      ORDER BY ${SQL.raw(orderByClause)}/* rank DESC, dcc_short_label, project_name , disease_name, taxonomy_name, anatomy_name, biofluid_name, gene_name, 
        protein_name, compound_name, data_type_name, assay_type_name, subject_ethnicity_name, subject_sex_name, subject_race_name */
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
