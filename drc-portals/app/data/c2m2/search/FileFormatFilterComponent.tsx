import prisma from "@/lib/prisma/c2m2";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function FileFormatFilterComponent({ q, filterClause, maxCount, main_table }: { q: string, filterClause: SQL, maxCount: number, main_table: string }) {
    try {
        const query = SQL.template`
      WITH fileformat_full AS (
        SELECT DISTINCT COALESCE(file_format_name, 'Unspecified') AS file_format_name
        FROM ${SQL.template`c2m2."${SQL.raw(main_table)}"`} /* c2m2.ffl_biosample_collection */
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        AND (COALESCE(file_format_name, '') != '')
        /*LIMIT ${maxCount}*/
      ),
      file_format_name_count AS (
        SELECT file_format_name, COUNT(*) AS count 
        FROM fileformat_full
        GROUP BY file_format_name
      )
      SELECT COALESCE(jsonb_agg(file_format_name_count ORDER BY file_format_name_count.file_format_name), '[]'::jsonb) AS fileformat_filters
      FROM file_format_name_count;
    `.toPrismaSql();
        const t0: number = performance.now();
        const result = await prisma.$queryRaw<{ fileformat_filters: { file_format_name: string, count: number }[] }[]>(query);
        const t1: number = performance.now();
        console.log("Elapsed time for FileFormatFilterComponent queries: ", t1 - t0, " milliseconds");
        if (result.length === 0 || !result[0].fileformat_filters) {
            return null; // return null if no results found
        }

        const FileFormatFilters: FilterObject[] = result[0].fileformat_filters.map((fileFormatFilter) => ({
            id: fileFormatFilter.file_format_name, // Use file_format_name as id
            name: fileFormatFilter.file_format_name, // Use file_format_name as name
            count: fileFormatFilter.count,
        }));
        return (
            <FilterSet
                key={`fileformat-filter-set`}
                id={`file_format`}
                filterList={FileFormatFilters}
                filter_title="File Format"
                example_query="e.g. FASTQ"
                maxCount={maxCount}
            />
        );
    } catch (error) {
        console.error("Error fetching File Format filters:", error);
        // Handle error gracefully, e.g., show an error message component
        return <div>Error fetching File Format filters</div>;
    }
}



