import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function AnatomyFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL, maxCount: number }) {
  try {
    const query = SQL.template`
      WITH anares_full AS (
        SELECT DISTINCT COALESCE(c2m2.ffl_biosample_collection.anatomy_name, 'Unspecified') AS anatomy_name
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        /*LIMIT ${maxCount}*/
      ),
      anatomy_name_count AS (
        SELECT anatomy_name, COUNT(*) AS count 
        FROM anares_full
        GROUP BY anatomy_name
        ORDER BY anatomy_name
      )
      SELECT COALESCE(jsonb_agg(anatomy_name_count.*), '[]'::jsonb) AS anatomy_filters 
      FROM anatomy_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ anatomy_filters: { anatomy_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for AnatomyFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].anatomy_filters) {
      return null; // return null if no results found
    }

    const AnatomyFilters: FilterObject[] = result[0].anatomy_filters.map((anatomyFilter) => ({
      id: anatomyFilter.anatomy_name, // Use anatomy_name as id
      name: anatomyFilter.anatomy_name,
      count: anatomyFilter.count,
    }));

    return (
      <FilterSet
        key={`anatomy-filter-set`}
        id={`anatomy`}
        filterList={AnatomyFilters}
        filter_title="Anatomy"
        example_query="e.g. brain"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching Anatomy filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Anatomy filters</div>;
  }
}
