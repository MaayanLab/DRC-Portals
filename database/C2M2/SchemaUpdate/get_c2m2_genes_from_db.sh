#!/bin/bash
# Call syntax: ./get_c2m2_genes_from_db.sh
#
# This file is generally in an ontology update related folder such as: /mnt/share/cfdeworkbench/C2M2/ontology/external-CV-reference-scripts/Ensembl-Aug-2025
# If elsewhere, e.g., in /home/mano/DRC/DRC-Portals/database/C2M2/SchemaUpdate, it is there generally for back up.

# If DB port changes, edit it here
dbcon_str="-h localhost -p 5433 -U drc -d drc";
dbtable=gene
outf=C2M2_genes.tsv

# Fetch all gene info from db
# Below, do not put ${dbcon_str} in double quotes, so that its expansion indeed contains spaces to separate the specs for db server, db port, etc.
psql ${dbcon_str} -c "\copy (SELECT * FROM c2m2.${dbtable}) TO '${outf}' WITH (FORMAT csv, DELIMITER E'\t', HEADER);"
echo "Fetched these records from the DB";
# clean synonym column of $outf
cp $outf ${outf}_raw.tsv
tmpf=${outf0}_temp.tsv
awk -F'\t' 'BEGIN { OFS="\t" } { \
    if (NF >= 4) { \
        sub(/^"\[/, "[", $4); \
        sub(/\]"$/, "]", $4); \
        sub(/^\[""\]$/, "[]", $4); \
        gsub(/""/, "\"", $4); \
    } \
    print $0 \
}' $outf > ${tmpf} && mv ${tmpf} $outf

#-------------------------------
outf_with_searchable="${outf}"_ws.tsv

# if the file has searchable column, exclude it.
cp "${outf}" "${outf_with_searchable}"

# Apparently, csvkit package does it as: csvcut -t -C searchable protein.tsv > protein_no_searchable.tsv
awk -F'\t' '
NR==1 {
    for (i=1; i<=NF; i++) if ($i=="searchable") skip=i
}
{
    first=1
    for (i=1; i<=NF; i++) if (i != skip) {
        if (!first) printf "\t"
        printf "%s", $i
        first=0
    }
    print ""
}
' "${outf_with_searchable}" > "${outf}"

rm "${outf_with_searchable}"
echo "Excluded the searchable column if it was present";
echo "Final file: ${outf}";

