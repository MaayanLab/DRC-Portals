import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

// const main_table = 'ffl_biosample_collection_cmp'; // 'ffl_biosample_collection' or 'ffl_biosample_collection_cmp'

/* SELECT DISTINCT COALESCE(${SQL.template`c2m2."${SQL.raw(main_table)}"`}.ptm_subtype_name, 'Unspecified') AS ptm_subtype_name */

export default async function PTMSubTypeFilterComponent({ q, filterClause, maxCount, main_table }: { q: string, filterClause: SQL, maxCount: number, main_table: string }) {
    try {
        const query = SQL.template`
      WITH ptmsubres_full AS (
        SELECT DISTINCT COALESCE(ptm_subtype_name, 'Unspecified') AS ptm_subtype_name
        FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} /* c2m2.ffl_biosample_collection */
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        AND (COALESCE(ptm_subtype_name, '') != '')
        /*LIMIT ${maxCount}*/
      ),
      ptm_subtype_name_count AS (
        SELECT ptm_subtype_name, COUNT(*) AS count 
        FROM ptmsubres_full
        GROUP BY ptm_subtype_name
        ORDER BY ptm_subtype_name
      )
      SELECT COALESCE(jsonb_agg(ptm_subtype_name_count.*), '[]'::jsonb) AS ptm_subtype_filters 
      FROM ptm_subtype_name_count;
    `.toPrismaSql();

        const t0: number = performance.now();
        const result = await prisma.$queryRaw<{ ptm_subtype_filters: { ptm_subtype_name: string, count: number }[] }[]>(query);
        const t1: number = performance.now();
        console.log("Elapsed time for PTMSubTypeFilterComponent queries: ", t1 - t0, " milliseconds");

        if (result.length === 0 || !result[0].ptm_subtype_filters) {
            return null; // return null if no results found
        }

        const PTMSubTypeFilters: FilterObject[] = result[0].ptm_subtype_filters.map((ptmTypeFilter) => ({
            id: ptmTypeFilter.ptm_subtype_name, // Use ptm_subtype_name as id
            name: ptmTypeFilter.ptm_subtype_name,
            count: ptmTypeFilter.count,
        }));

        return (
            <FilterSet
                key={`ptmtype-filter-set`}
                id={`ptm_subtype`}
                filterList={PTMSubTypeFilters}
                filter_title="PTM SubType"
                example_query="e.g. protein O-linked glycosylation"
                maxCount={maxCount}
            />
        );
    } catch (error) {
        console.error("Error fetching PTMSubType filters:", error);
        // Handle error gracefully, e.g., show an error message component
        return <div>Error fetching PTMSubType filters</div>;
    }
}
