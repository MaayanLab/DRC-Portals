#!/usr/bin/bash
#
# call syntax: ./zz02_append_new_compound_entries.bash <GlyTouCan_file>
# Example:
# ./zz02_append_new_compound_entries.bash "../GlyTouCan-Aug-2025/003_compound_appendix_for_non-PubChem_GlyTouCan_ACs/compound.GlyTouCan_appendix.tsv"

# 2024/11/26: Update the GlyTouCan file path accordingly
#cat ../GlyTouCan_preprocessing/003_compound_appendix_for_non-PubChem_GlyTouCan_ACs/compound.GlyTouCan_appendix.tsv >> compound.tsv

# If there is extra " in the first and second column of the file compound.GlyTouCan_appendix.tsv, remove it and then do cat.
gtcf="../GlyTouCan-Aug-2025/003_compound_appendix_for_non-PubChem_GlyTouCan_ACs/compound.GlyTouCan_appendix.tsv"

if [[ $# -ge 1 ]]; then
    gtcf="$1";
fi

gtcf2=temp1_compound.GlyTouCan_appendix.tsv

awk -F'\t' -v OFS='\t' '{
    gsub(/"/, "", $1); # Remove all double quotes from the first column
    gsub(/"/, "", $2); # Remove all double quotes from the second column
    print
}' ${gtcf} > ${gtcf2}

cat ${gtcf2} >> compound.tsv

