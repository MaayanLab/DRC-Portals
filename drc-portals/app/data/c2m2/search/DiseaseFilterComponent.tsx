import prisma from "@/lib/prisma";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function DiseaseFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL, maxCount: number }) {
  try {
    const query = SQL.template`
      WITH disres_full AS (
        SELECT DISTINCT c2m2.ffl_biosample_collection.*,
          ts_rank_cd(searchable, websearch_to_tsquery('english', ${q})) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${filterClause}
        LIMIT ${maxCount}
      ),
      disres AS (
        SELECT 
          disres_full.rank AS rank,
          COALESCE(disres_full.project_local_id, 'Unspecified') AS project_local_id,
          COALESCE(disres_full.disease_name, 'Unspecified') AS disease_name
        FROM disres_full 
        LEFT JOIN c2m2.project ON (disres_full.project_id_namespace = c2m2.project.id_namespace AND 
          disres_full.project_local_id = c2m2.project.local_id)
        GROUP BY 
          disres_full.rank,
          disres_full.project_local_id,
          disres_full.disease_name
        ORDER BY rank DESC, disease_name
      ),
      disease_name_count AS (
        SELECT disease_name, COUNT(*) AS count 
        FROM disres
        GROUP BY disease_name ORDER BY disease_name
      )
      SELECT
        COALESCE(jsonb_agg(disease_name_count.*), '[]'::jsonb) AS disease_filters
      FROM disease_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ disease_filters: { disease_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for DiseaseFilterComponent queries: ", t1 - t0, " milliseconds");
    
    if (result.length === 0 || !result[0].disease_filters) {
      return; // do not do anything
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
