import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

// const main_table = 'ffl_biosample_collection_cmp'; // 'ffl_biosample_collection' or 'ffl_biosample_collection_cmp'

/* SELECT DISTINCT COALESCE(${SQL.template`c2m2."${SQL.raw(main_table)}"`}.subject_race_name, 'Unspecified') AS subject_race_name */

export default async function SubjectRaceFilterComponent({ q, filterClause, maxCount, main_table }: { q: string, filterClause: SQL, maxCount: number, main_table: string }) {
  try {
    const query = SQL.template`
      WITH Xres_full AS (
        SELECT DISTINCT COALESCE(subject_race_name, 'Unspecified') AS subject_race_name
        FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} /* c2m2.ffl_biosample_collection */
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        AND (COALESCE(subject_race_name, '') != '')
        /*LIMIT ${maxCount}*/
      ),
      subject_race_name_count AS (
        SELECT subject_race_name, COUNT(*) AS count 
        FROM Xres_full
        GROUP BY subject_race_name
        ORDER BY subject_race_name
      )
      SELECT COALESCE(jsonb_agg(subject_race_name_count.*), '[]'::jsonb) AS subject_race_filters 
      FROM subject_race_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ subject_race_filters: { subject_race_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for SubjectRaceFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].subject_race_filters) {
      return null; // return null if no results found
    }

    const SubjectRaceFilters: FilterObject[] = result[0].subject_race_filters.map((subject_raceFilter) => ({
      id: subject_raceFilter.subject_race_name, // Use subject_race_name as id
      name: subject_raceFilter.subject_race_name,
      count: subject_raceFilter.count,
    }));

    return (
      <FilterSet
        key={`subject_race-filter-set`}
        id={`subject_race`}
        filterList={SubjectRaceFilters}
        filter_title="Subject Race"
        example_query="e.g. Male"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching Subject Race filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Subject Race filters</div>;
  }
}
