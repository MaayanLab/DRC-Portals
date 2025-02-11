import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

// const main_table = 'ffl_biosample_collection_cmp'; // 'ffl_biosample_collection' or 'ffl_biosample_collection_cmp'

/* SELECT DISTINCT COALESCE(${SQL.template`c2m2."${SQL.raw(main_table)}"`}.biofluid_name, 'Unspecified') AS biofluid_name */

export default async function BiofluidFilterComponent({ q, filterClause, maxCount, main_table }: { q: string, filterClause: SQL, maxCount: number, main_table: string }) {
  try {
    const query = SQL.template`
      WITH bioflres_full AS (
        SELECT DISTINCT COALESCE(biofluid_name, 'Unspecified') AS biofluid_name
        FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} /* c2m2.ffl_biosample_collection */
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        AND (COALESCE(biofluid_name, '') != '')
        /*LIMIT ${maxCount}*/
      ),
      biofluid_name_count AS (
        SELECT biofluid_name, COUNT(*) AS count 
        FROM bioflres_full
        GROUP BY biofluid_name
        ORDER BY biofluid_name
      )
      SELECT COALESCE(jsonb_agg(biofluid_name_count.*), '[]'::jsonb) AS biofluid_filters 
      FROM biofluid_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ biofluid_filters: { biofluid_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for BiofluidFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].biofluid_filters) {
      return null; // return null if no results found
    }

    const BiofluidFilters: FilterObject[] = result[0].biofluid_filters.map((biofluidFilter) => ({
      id: biofluidFilter.biofluid_name, // Use biofluid_name as id
      name: biofluidFilter.biofluid_name,
      count: biofluidFilter.count,
    }));

    return (
      <FilterSet
        key={`biofluid-filter-set`}
        id={`biofluid`}
        filterList={BiofluidFilters}
        filter_title="Biofluid"
        example_query="e.g. saliva"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching Biofluid filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Biofluid filters</div>;
  }
}
