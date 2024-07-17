import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function DCCFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL, maxCount: number }) {
  try {
    const query = SQL.template`
      WITH dccres_full AS (
        SELECT DISTINCT c2m2.ffl_biosample_collection.dcc_name,
          SPLIT_PART(c2m2.ffl_biosample_collection.dcc_abbreviation, '_', 1) AS dcc_short_label
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${filterClause ? SQL.template`and ${filterClause}` : SQL.empty()}
        /*LIMIT ${maxCount}*/
      ),
      dcc_name_count AS (
        SELECT dcc_name, dcc_short_label, COUNT(*) AS count 
        FROM dccres_full
        GROUP BY dcc_name, dcc_short_label
      )
      SELECT COALESCE(jsonb_agg(dcc_name_count ORDER BY dcc_short_label, dcc_name), '[]'::jsonb) AS dcc_filters
      FROM dcc_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ dcc_filters: { dcc_name: string, dcc_short_label: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for DCCFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].dcc_filters) {
      return null; // return null if no results found
    }

    const DccFilters: FilterObject[] = result[0].dcc_filters.map((dccFilter) => ({
      id: dccFilter.dcc_short_label, // Use dcc_short_label as id
      name: dccFilter.dcc_name, // Use dcc_name as name
      count: dccFilter.count,
    }));

    return (
      <FilterSet
        key={`dcc-filter-set`}
        id={`dcc`}
        filterList={DccFilters}
        filter_title="Common Fund Program"
        example_query="e.g. 4DN"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching DCC filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching DCC filters</div>;
  }
}
