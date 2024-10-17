import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function DataTypeFilterComponent({ q, filterClause, maxCount, main_table }: { q: string, filterClause: SQL, maxCount: number, main_table: string }) {
  try {
    const query = SQL.template`
      WITH dtres_full AS (
        SELECT DISTINCT COALESCE(data_type_name, 'Unspecified') AS data_type_name
        FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} /* c2m2.ffl_biosample_collection */
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        AND (COALESCE(data_type_name, '') != '')
        /*LIMIT ${maxCount}*/
      ),
      data_type_name_count AS (
        SELECT data_type_name, COUNT(*) AS count 
        FROM dtres_full
        GROUP BY data_type_name
      )
      SELECT COALESCE(jsonb_agg(data_type_name_count ORDER BY data_type_name_count.data_type_name), '[]'::jsonb) AS data_type_filters
      FROM data_type_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ data_type_filters: { data_type_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for DataTypeFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].data_type_filters) {
      return null; // return null if no results found
    }

    const DataTypeFilters: FilterObject[] = result[0].data_type_filters.map((dataTypeFilter) => ({
      id: dataTypeFilter.data_type_name, // Use data_type_name as id
      name: dataTypeFilter.data_type_name, // Use data_type_name as name
      count: dataTypeFilter.count,
    }));

    return (
      <FilterSet
        key={`data-type-filter-set`}
        id={`data_type`}
        filterList={DataTypeFilters}
        filter_title="Data type"
        example_query="e.g. DNA sequence"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching Data Type filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Data Type filters</div>;
  }
}
