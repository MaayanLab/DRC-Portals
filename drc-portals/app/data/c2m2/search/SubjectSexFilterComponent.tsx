import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

// const main_table = 'ffl_biosample_collection_cmp'; // 'ffl_biosample_collection' or 'ffl_biosample_collection_cmp'

/* SELECT DISTINCT COALESCE(${SQL.template`c2m2."${SQL.raw(main_table)}"`}.subject_sex_name, 'Unspecified') AS subject_sex_name */

export default async function SubjectSexFilterComponent({ q, filterClause, maxCount, main_table }: { q: string, filterClause: SQL, maxCount: number, main_table: string }) {
  try {
    const query = SQL.template`
      WITH Xres_full AS (
        SELECT DISTINCT COALESCE(subject_sex_name, 'Unspecified') AS subject_sex_name
        FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} /* c2m2.ffl_biosample_collection */
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        AND (COALESCE(subject_sex_name, '') != '')
        /*LIMIT ${maxCount}*/
      ),
      subject_sex_name_count AS (
        SELECT subject_sex_name, COUNT(*) AS count 
        FROM Xres_full
        GROUP BY subject_sex_name
        ORDER BY subject_sex_name
      )
      SELECT COALESCE(jsonb_agg(subject_sex_name_count.*), '[]'::jsonb) AS subject_sex_filters 
      FROM subject_sex_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ subject_sex_filters: { subject_sex_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for SubjectSexFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].subject_sex_filters) {
      return null; // return null if no results found
    }

    const SubjectSexFilters: FilterObject[] = result[0].subject_sex_filters.map((subject_sexFilter) => ({
      id: subject_sexFilter.subject_sex_name, // Use subject_sex_name as id
      name: subject_sexFilter.subject_sex_name,
      count: subject_sexFilter.count,
    }));

    return (
      <FilterSet
        key={`subject_sex-filter-set`}
        id={`subject_sex`}
        filterList={SubjectSexFilters}
        filter_title="Subject Sex"
        example_query="e.g. Male"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching Subject Sex filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Subject Sex filters</div>;
  }
}
