import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function ProteinFilterComponent({ q, filterClause, maxCount, main_table }: { q: string, filterClause: SQL, maxCount: number, main_table: string }) {
  try {
    const query = SQL.template`
      WITH protres_full AS (
        SELECT DISTINCT COALESCE(protein_name, 'Unspecified') AS protein_name
        FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} /* c2m2.ffl_biosample_collection */
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        AND (COALESCE(protein_name, '') != '')
        /*LIMIT ${maxCount}*/
      ),
      protein_name_count AS (
        SELECT protein_name, COUNT(*) AS count 
        FROM protres_full
        GROUP BY protein_name
      )
      SELECT COALESCE(jsonb_agg(protein_name_count ORDER BY protein_name_count.protein_name), '[]'::jsonb) AS protein_filters
      FROM protein_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ protein_filters: { protein_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for ProteinFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].protein_filters) {
      return null; // return null if no results found
    }

    const ProteinFilters: FilterObject[] = result[0].protein_filters.map((proteinFilter) => ({
      id: proteinFilter.protein_name, // Use protein_name as id
      name: proteinFilter.protein_name,
      count: proteinFilter.count,
    }));

    return ( 
      <FilterSet
        key={`ID:$protein`}
        id={`protein`}
        filterList={ProteinFilters}
        filter_title="Protein"
        example_query="e.g. A0N4X2"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching Protein filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Protein filters</div>;
  }
}
