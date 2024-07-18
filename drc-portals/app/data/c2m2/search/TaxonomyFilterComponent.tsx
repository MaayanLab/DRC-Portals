import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function TaxonomyFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL, maxCount: number }) {
  try {
    const query = SQL.template`
      WITH taxres_full AS (
        SELECT COALESCE(c2m2.ffl_biosample_collection.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name 
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        /*LIMIT ${maxCount}*/
      ),
      taxonomy_name_count AS (
        SELECT taxonomy_name, COUNT(*) AS count 
        FROM taxres_full
        GROUP BY taxonomy_name
      )
      SELECT COALESCE(jsonb_agg(taxonomy_name_count ORDER BY taxonomy_name_count.taxonomy_name), '[]'::jsonb) AS taxonomy_filters
      FROM taxonomy_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ taxonomy_filters: { taxonomy_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for TaxonomyFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].taxonomy_filters) {
      return null; // return null if no results found
    }

    const TaxonomyFilters: FilterObject[] = result[0].taxonomy_filters.map((taxonomyFilter) => ({
      id: taxonomyFilter.taxonomy_name, // Use taxonomy_name as id
      name: taxonomyFilter.taxonomy_name,
      count: taxonomyFilter.count,
    }));

    return ( 
      <FilterSet
        key={`ID:$taxonomy`}
        id={`ncbi_taxonomy`}
        filterList={TaxonomyFilters}
        filter_title="Species"
        example_query="e.g. Mus musculus"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching Taxonomy filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Taxonomy filters</div>;
  }
}