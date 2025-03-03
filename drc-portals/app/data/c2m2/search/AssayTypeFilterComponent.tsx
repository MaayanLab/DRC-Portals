import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function AssayTypeFilterComponent({ q, filterClause, maxCount, main_table }: { q: string, filterClause: SQL, maxCount: number, main_table: string }) {
  try {
    const query = SQL.template`
      WITH astres_full AS (
        SELECT DISTINCT COALESCE(assay_type_name, 'Unspecified') AS assay_type_name
        FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} /* c2m2.ffl_biosample_collection */
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        AND (COALESCE(assay_type_name, '') != '')
        /*LIMIT ${maxCount}*/
      ),
      assay_type_name_count AS (
        SELECT assay_type_name, COUNT(*) AS count 
        FROM astres_full
        GROUP BY assay_type_name
      )
      SELECT COALESCE(jsonb_agg(assay_type_name_count ORDER BY assay_type_name_count.assay_type_name), '[]'::jsonb) AS assay_type_filters
      FROM assay_type_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ assay_type_filters: { assay_type_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for AssayTypeFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].assay_type_filters) {
      return null; // return null if no results found
    }

    const AssayTypeFilters: FilterObject[] = result[0].assay_type_filters.map((assayTypeFilter) => ({
      id: assayTypeFilter.assay_type_name, // Use assay_type_name as id
      name: assayTypeFilter.assay_type_name, // Use assay_type_name as name
      count: assayTypeFilter.count,
    }));

    return (
      <FilterSet
        key={`assay-type-filter-set`}
        id={`assay_type`}
        filterList={AssayTypeFilters}
        filter_title="Assay type"
        example_query="e.g. GC-MS"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching Assay Type filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Assay Type filters</div>;
  }
}
