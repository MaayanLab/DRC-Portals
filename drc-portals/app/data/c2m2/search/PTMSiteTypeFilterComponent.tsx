import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

// const main_table = 'ffl_biosample_collection_cmp'; // 'ffl_biosample_collection' or 'ffl_biosample_collection_cmp'

/* SELECT DISTINCT COALESCE(${SQL.template`c2m2."${SQL.raw(main_table)}"`}.ptm_site_type_name, 'Unspecified') AS ptm_site_type_name */

export default async function PTMSiteTypeFilterComponent({ q, filterClause, maxCount, main_table }: { q: string, filterClause: SQL, maxCount: number, main_table: string }) {
    try {
        const query = SQL.template`
      WITH ptmsubres_full AS (
        SELECT DISTINCT COALESCE(ptm_site_type_name, 'Unspecified') AS ptm_site_type_name
        FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} /* c2m2.ffl_biosample_collection */
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        AND (COALESCE(ptm_site_type_name, '') != '')
        /*LIMIT ${maxCount}*/
      ),
      ptm_site_type_name_count AS (
        SELECT ptm_site_type_name, COUNT(*) AS count 
        FROM ptmsubres_full
        GROUP BY ptm_site_type_name
        ORDER BY ptm_site_type_name
      )
      SELECT COALESCE(jsonb_agg(ptm_site_type_name_count.*), '[]'::jsonb) AS ptm_site_type_filters 
      FROM ptm_site_type_name_count;
    `.toPrismaSql();

        const t0: number = performance.now();
        const result = await prisma.$queryRaw<{ ptm_site_type_filters: { ptm_site_type_name: string, count: number }[] }[]>(query);
        const t1: number = performance.now();
        console.log("Elapsed time for PTMSiteTypeFilterComponent queries: ", t1 - t0, " milliseconds");

        if (result.length === 0 || !result[0].ptm_site_type_filters) {
            return null; // return null if no results found
        }

        const PTMSiteTypeFilters: FilterObject[] = result[0].ptm_site_type_filters.map((ptmSiteTypeFilter) => ({
            id: ptmSiteTypeFilter.ptm_site_type_name, // Use ptm_site_type_name as id
            name: ptmSiteTypeFilter.ptm_site_type_name,
            count: ptmSiteTypeFilter.count,
        }));

        return (
            <FilterSet
                key={`ptmtype-filter-set`}
                id={`ptm_site_type`}
                filterList={PTMSiteTypeFilters}
                filter_title="PTM SiteType"
                example_query="e.g. Defined - faldo: ExactPosition"
                maxCount={maxCount}
            />
        );
    } catch (error) {
        console.error("Error fetching PTMSiteType filters:", error);
        // Handle error gracefully, e.g., show an error message component
        return <div>Error fetching PTMSiteType filters</div>;
    }
}
