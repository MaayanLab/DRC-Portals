import prisma from "@/lib/prisma";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function DiseaseFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL, maxCount: number }) {
  try {
    const query = SQL.template`
      WITH disres_full AS (
        SELECT DISTINCT COALESCE(c2m2.ffl_biosample_collection.disease_name, 'Unspecified') AS disease_name
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${filterClause}
        /*LIMIT ${maxCount}*/
      ),
      disease_name_count AS (
        SELECT disease_name, COUNT(*) AS count 
        FROM disres_full
        GROUP BY disease_name
      )
      SELECT COALESCE(jsonb_agg(disease_name_count ORDER BY disease_name_count.disease_name), '[]'::jsonb) AS disease_filters
      FROM disease_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ disease_filters: { disease_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for DiseaseFilterComponent queries: ", t1 - t0, " milliseconds");

    if (result.length === 0 || !result[0].disease_filters) {
      return null; // return null if no results found
    }

    const DiseaseFilters: FilterObject[] = result[0].disease_filters.map((diseaseFilter) => ({
      id: diseaseFilter.disease_name, // Use disease_name as id
      name: diseaseFilter.disease_name,
      count: diseaseFilter.count,
    }));

    return ( 
      <FilterSet
        key={`ID:$disease`}
        id={`disease`}
        filterList={DiseaseFilters}
        filter_title="Disease"
        example_query="e.g. diabetes"
        maxCount={maxCount}
      />
    );
  } catch (error) {
    console.error("Error fetching Disease filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Disease filters</div>;
  }
}