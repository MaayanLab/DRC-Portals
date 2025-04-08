#!/bin/bash
#
# Call syntax: be in the correct folder: C2M2
# ./gen_sql_select_count_delete_statements.sh <infile.txt> <outfile.sql>
# ./gen_sql_select_count_delete_statements.sh fk_referenced_tables.txt sql_select_count_delete_keywords_statements.sql

if [[ $# -lt 2 ]]; then
        echo -e "Usage: $0 <infile.txt> <outfile.sql>";
        exit 1;
fi

inf="$1"
outf="$2"

echo "set statement_timeout = 0;" > "${outf}"
echo "set max_parallel_workers to 4;" >> "${outf}"

echo "" >> "${outf}"

while read -r table; do
    echo "DELETE FROM c2m2.$table WHERE searchable @@ websearch_to_tsquery('english', :'keywords');"
done < "${inf}" >> "${outf}"

echo "" >> "${outf}"

while read -r table; do
    echo "SELECT COUNT(*) FROM c2m2.$table WHERE searchable @@ websearch_to_tsquery('english', :'keywords');"
done < "${inf}" >> "${outf}"

echo "" >> "${outf}"

while read -r table; do
    echo "SELECT * FROM c2m2.$table WHERE searchable @@ websearch_to_tsquery('english', :'keywords');"
done < "${inf}" >> "${outf}"

echo -e "\nset max_parallel_workers to 0;" >> "${outf}"
