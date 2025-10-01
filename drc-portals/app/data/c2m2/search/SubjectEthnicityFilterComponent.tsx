import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

// const main_table = 'ffl_biosample_collection_cmp'; // 'ffl_biosample_collection' or 'ffl_biosample_collection_cmp'

/* SELECT DISTINCT COALESCE(${SQL.template`c2m2."${SQL.raw(main_table)}"`}.subject_ethnicity_name, 'Unspecified') AS subject_ethnicity_name */

export default async function SubjectEthnicityFilterComponent({ q, filterClause, maxCount, main_table }: { q: string, filterClause: SQL, maxCount: number, main_table: string }) {
  try {
    const query = SQL.template`
      WITH Xres_full AS (
        SELECT DISTINCT COALESCE(subject_ethnicity_name, 'Unspecified') AS subject_ethnicity_name
        FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} /* c2m2.ffl_biosample_collection */
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        AND (COALESCE(subject_ethnicity_name, '') != '')
        /*LIMIT ${maxCount}*/
      ),
      subject_ethnicity_name_count AS (
        SELECT subject_ethnicity_name, COUNT(*) AS count 
        FROM Xres_full
        GROUP BY subject_ethnicity_name
        ORDER BY subject_ethnicity_name
      )
      SELECT COALESCE(jsonb_agg(subject_ethnicity_name_count.*), '[]'::jsonb) AS subject_ethnicity_filters 
      FROM subject_ethnicity_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ subject_ethnicity_filters: { subject_ethnicity_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for SubjectEthnicityFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].subject_ethnicity_filters) {
      return null; // return null if no results found
    }

    const SubjectEthnicityFilters: FilterObject[] = result[0].subject_ethnicity_filters.map((subject_ethnicityFilter) => ({
      id: subject_ethnicityFilter.subject_ethnicity_name, // Use subject_ethnicity_name as id
      name: subject_ethnicityFilter.subject_ethnicity_name,
      count: subject_ethnicityFilter.count,
    }));

    return (
      <FilterSet
        key={`subject_ethnicity-filter-set`}
        id={`subject_ethnicity`}
        filterList={SubjectEthnicityFilters}
        filter_title="Subject Ethnicity"
        example_query="e.g. Hispanic or Latino"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching Subject Ethnicity filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Subject Ethnicity filters</div>;
  }
}
