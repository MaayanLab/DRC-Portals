#!/bin/bash
#
# To do a quick check if each DCC has only one valid C2M2 package (or other asset type) listed in the file ingest/DccAssets.tsv
# Change the recent dates or no dates

echo -e "----------- $0 script started: to find list of DCCs with current and valid asset type (e.g., C2M2);\ncurrent date and time: $(date)";

if [[ $# -lt 1 ]]; then
        echo -e "Usage: $0 <ingest/DccAssets.tsv> [C2M2|XMT|\"KG Assertions\"]";
        exit 1;
fi

if [[ $# -lt 2 ]]; then
        asset_type=C2M2
else
        asset_type="$2"
fi

fpath="$1"

# Extract the directory path: # Using `dirname`
dir_path=$(dirname "$fpath")

# Extract the filename: # Using `basename`
f=$(basename "$fpath")

ast_str="${asset_type// /_}"

f1="${dir_path}/Dcc_${ast_str}.tsv"
f2="${dir_path}/validDcc_${ast_str}.tsv"
#head -n 1 $f|cut -d$'\t' -f1,3,8,9 > ${f1} && cat $f | grep C2M2 | egrep -e "202[0-5]-[0-9][0-9]" | cut -d$'\t' -f1,3,8,9|sort >> ${f1}
#awk -F'\t' '$2 == "True" && $3 == "False"' ${f1} > ${f2}
# Include drcapproved and dccapproved too
head -n 1 $fpath|cut -d$'\t' -f1,3,6,7,8,9 > ${f1} && cat $fpath | egrep -e "/${asset_type}/" | egrep -e "202[0-5]-[0-9][0-9]" | cut -d$'\t' -f1,3,6,7,8,9|sort >> ${f1}
head -n 1 ${f1} > ${f2}
if [[ "${asset_type}" == "C2M2" ]]; then
        # current, drcapproved, dccapproved, not deleted
        awk -F'\t' '$2 == "True" && $3 == "True" && $4 == "True" && $5 == "False"' ${f1} >> ${f2}
        echo "List of DCCs with valid ${asset_type} (with respect to current, drcapproved, dccapproved and deleted):"
else
        # current, drcapproved, not deleted
        awk -F'\t' '$2 == "True" && $3 == "True" && $5 == "False"' ${f1} >> ${f2}
        echo "List of DCCs with valid ${asset_type} (with respect to current, drcapproved and deleted):"
fi

# To see which DCCs might have more than one current:
cat ${f2} |cut -d$'\t' -f1|cut -d'/' -f4
echo "";
if [[ "${asset_type}" == "C2M2" ]]; then
        echo -e "If there are DCCs with their names listed more than one, then check the file \n${f2}\n to see which ones for which submission they are marked current=True and deleted=False \nand in the original input file \n${fpath}\n set current to False and/or deleted to True for all but one row per DCC.";
fi
