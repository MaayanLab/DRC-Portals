#!/bin/bash
# Call syntax: ./extract_missing_terms_by_inDBbutnotinMaster.sh <tsv_file> <dbtablename/kw> <dbport>`
# Best to pass tsv_file as an argument, so that relative or absolute paths can be specified
# First find the IDs that are in the DB table but in the master ontology file. Then, extract the 
# full info (id, name, description, synonym) for such missing terms from the DB.
#
# This script is derived (then modified) from a script named /extract_missing_terms.sh that 
# is generally located and was run from the folder which contains the scripts folder 
# (which has the python script file prepare_C2M2_submission.py and the folder external_CV_reference_files). 
# This doesn't require a mock preparation of C2M2 packages based on older prepare_C2M2_submission.py or newer cfde-c2m2 tool.
# This script is now located in the folders where master ontology file is being prepared. 
# If found anywhere else, it is there generally for back up purposes.

set -euo pipefail

if [[ $# -lt 2 ]]; then
        echo -e "Minimum one argument needed: Usage: $0 <tsv_file> <kw> <dbport>";
        exit 1;
fi

tsv_file="$1"
kw=$2

dbport=5434
if [[ $# -ge 3 ]]; then
	dbport=$3
fi

# Ensure kw is a meaningful word as it is also used for name of a db table.
case "$kw" in
    compound|gene|protein|substance) dbtable="$kw" ;;
    *) echo "ERROR: Invalid table name '$kw'. Allowed: compound, gene, protein, substance." >&2; exit 1 ;;
esac

outf0=missing_${kw}s
outf=${outf0}.tsv
outf_nh=${outf0}_noheader.tsv
dbtable=$kw

# If DB port changes, edit it here
dbhost=localhost
dbname=drc
dbusername=drc
dbcon_str="-h ${dbhost} -p ${dbport} -U ${dbusername} -d ${dbname}";
schema_name=c2m2

#------------- Find missing ids: those in the DB table (from the last submission) but not in the master ontology table. ---------
##!/bin/bash

#set -euo pipefail

#tsv_file="${kw}.tsv"

# Temporary files
db_ids=$(mktemp)
tsv_ids=$(mktemp)

cleanup() {
    rm -f "$db_ids" "$tsv_ids"
}
trap cleanup EXIT

echo "Reading IDs from TSV..."

# Extract first column (id), skipping header
tail -n +2 -- "$tsv_file" \
    | cut -f1 \
    | sort -u > "$tsv_ids"

echo "Reading IDs from database..."

psql $dbcon_str -At \
    -c "SELECT id FROM ${schema_name}.${dbtable} ORDER BY id;" \
    | sort -u > "$db_ids"

echo "IDs present in database but missing from TSV:"
#ids=($(comm -23 "$db_ids" "$tsv_ids" ))
# Read one line per array element
mapfile -t ids < <(comm -23 "$db_ids" "$tsv_ids")

echo "Found ${#ids[@]} missing IDs."

echo "Identified the IDs for missing ${kw}";
#echo $ids
echo "${ids[@]}"
#-----------------------------------------------------------------------------------------------------------------------------------------

# Format for use in psql
#ids_string=$(printf "'%s'," "${ids[@]}")
#ids_string=${ids_string%,}  # Remove the trailing comma


# Format for use in SQL: 'id1','id2',...
if ((${#ids[@]} > 0)); then
    ids_string=$(
        printf "%s\n" "${ids[@]}" \
        | sed "s/'/''/g" \
        | sed "s/^/'/; s/$/'/" \
        | paste -sd,
    )
else
    ids_string=""
fi

echo "Formatted string for use in psql:"
echo "$ids_string"

# Fetch such records from the DB which has metadata from the last submission
# Mano: 2025/08/20: Always run the psal command even if ids_string is just '', so that at least the outf is populated and processing downstream continues
# Below, do not put ${dbcon_str} in double quotes, so that its expansion indeed contains spaces to separate the specs for db server, db port, etc.
#psql ${dbcon_str} -c "\copy (SELECT * FROM ${schema_name}.${dbtable} WHERE id IN (${ids_string})) TO '${outf}' WITH (FORMAT csv, DELIMITER E'\t', HEADER);"

if ((${#ids[@]} > 0)); then
    where_clause="id IN (${ids_string})"
else
    where_clause="FALSE"
fi

psql ${dbcon_str} -c "\copy ( SELECT * FROM ${schema_name}.${dbtable} WHERE ${where_clause}) TO '${outf}' WITH (FORMAT csv, DELIMITER E'\t', HEADER);"

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

echo "Cleaned up the file $outf";

#-------------------------------
outf_with_searchable="${outf}"_ws.tsv

# if the file missing_proteins.tsv has searchable column, exclude it.
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
#-------------------------------

# exclude the header
sed '1d' $outf > ${outf_nh}
echo "Prepared the file without header: ${outf_nh}";
echo "All done!";

