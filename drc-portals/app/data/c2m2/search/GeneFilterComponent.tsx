import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function GeneFilterComponent({ q, filterClause, maxCount, main_table }: { q: string, filterClause: SQL, maxCount: number, main_table: string }) {
  try {
    const query = SQL.template`
      WITH generes_full AS (
        SELECT COALESCE(gene_name, 'Unspecified') AS gene_name
        FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} /* c2m2.ffl_biosample_collection */
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        /*LIMIT ${maxCount}*/
      ),
      gene_name_count AS (
        SELECT gene_name, COUNT(*) AS count 
        FROM generes_full
        GROUP BY gene_name
      )
      SELECT COALESCE(jsonb_agg(gene_name_count ORDER BY gene_name_count.gene_name), '[]'::jsonb) AS gene_filters
      FROM gene_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ gene_filters: { gene_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for GeneFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].gene_filters) {
      return null; // return null if no results found
    }

    const GeneFilters: FilterObject[] = result[0].gene_filters.map((geneFilter) => ({
      id: geneFilter.gene_name, // Use gene_name as id
      name: geneFilter.gene_name,
      count: geneFilter.count,
    }));

    return ( 
      <FilterSet
        key={`ID:$gene`}
        id={`gene`}
        filterList={GeneFilters}
        filter_title="Gene"
        example_query="e.g. RPE"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching Gene filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Gene filters</div>;
  }
}
