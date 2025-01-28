#!/bin/bash
#
# Call syntax: be in the correct folder: ....../database/C2M2/SchemaUpdate or another
# ./append_random_biofluid_to_biosample.sh <foldername_without_ending_slash>
# The folder indicated by the argument should exist with the suitable files

echo "                            --------------------- Script $0: Started   ---------------------"

folder="$1"

curdir="$PWD"

append_random_to_biosample=1

#----------------------------------------------
# Work on biosample.tsv
fbase=biosample
fin="${folder}"/${fbase}.tsv
forg="${folder}"/${fbase}_org.tsv
fout="${folder}"/${fbase}.tsv

add_colname=biofluid

cp "${fin}" "${forg}"

# Randomly select from five Uberon IDs
#     value = ( choice == 1 ? "UBERON:0002385" : choice == 2 ? "UBERON:0001969" : choice == 3 ? "UBERON:0001088" : "UBERON:0001988"); 
# If biosample.tsv has the field assay_type, change it to sample_prep_method
# awk 'NR==1 {gsub(/\<assay_type\>/, "sample_prep_method"); $0 = $0 "\tbiofluid"} {print}' input.tsv > output.tsv
#NR == 1 {print $0, "biofluid"}
sed -i '1s/\<assay_type\>/sample_prep_method/' "${forg}"
if [[ "${append_random_to_biosample}" == "1" ]] ; then
    awk -F'\t' -v OFS='\t' 'BEGIN {
        srand(); choices[1] = "UBERON:0002385"; choices[2] = "UBERON:0001969"; 
        choices[3] = "UBERON:0001088"; choices[4] = "UBERON:0001988"; 
        choices[5] = ""; choices[6] = ""; choices[7] = ""; choices[8] = ""; choices[9] = ""; choices[10] = "";
        choices[11] = ""; choices[12] = ""; choices[13] = ""; choices[14] = ""; choices[15] = ""; choices[16] = "";
    }
    NR == 1 {print $0, "biofluid"}
    NR > 1 {choice = int((rand() * 16) + 1); value = choices[choice]; print $0, value}' "${forg}" > "${fout}"
else
    # To use "",
    awk -F'\t' -v OFS='\t' ' NR == 1 {print $0, "biofluid"} NR > 1 {print $0, ""}' ${forg} > ${fout}    
    #awk -F'\t' -v OFS='\t' ' NR == 1 {gsub(/\<assay_type\>/, "sample_prep_method"); $0 = $0 "\tbiofluid"} {print} NR > 1 {print $0, ""}' "${forg}" > "${fout}"
fi

echo "Completed adding ${add_colname} column to ${fout}"

#----------------------------------------------
# Work on collection_biofluid.tsv
# Also work on collection.tsv: add the rows corresponding to collection_biofluid.tsv
fbase=collection_biofluid
fin="${folder}"/${fbase}.tsv
forg="${folder}"/${fbase}_org.tsv
fout="${folder}"/${fbase}.tsv
cp "${fin}" "${forg}"

append_random_to_collection=1

fbase2=collection
fout2="${folder}"/${fbase2}.tsv
#cp ${fin} ${fout} # header row

col_local_id=("COL0000001" "COL0000002" "COL0000003");
col_biofluid=("UBERON:0001988" "UBERON:0000178" "UBERON:0001977");
col_id_namespace="https://www.metabolomicsworkbench.org/"

col_persistent_id=("${col_local_id[@]/%/_persistent}")
col_creation_time=
col_abbreviation=("${col_local_id[@]/%/_shortname}")
col_name=("${col_local_id[@]/%/_name}")
col_description=("${col_local_id[@]/%/_description}")
col_has_time_series_data=

#echo "${col_persistent_id[@]}"

# Using while loop and index
# append newline if not one at the end of the file
# in linux bash Add a newline to the end of a file only if it doesn't exist: 
[ -n "$(tail -c 1 ${fout2})" ] && echo >> "${fout2}"
if [[ "${append_random_to_collection}" == "1" ]] ; then
  i=0
  while [ $i -lt ${#col_local_id[@]} ]
  do
    echo -e "${col_id_namespace}\t${col_local_id[$i]}\t${col_biofluid[$i]}" >> "${fout}"
    echo -e "${col_id_namespace}\t${col_local_id[$i]}\t${col_persistent_id[$i]}\t${col_creation_time}\t${col_abbreviation[$i]}\t${col_name[$i]}\t${col_description[$i]}\t${col_has_time_series_data}" >> "${fout2}"
    ((i++))
  done
  echo "Completed updating ${fout} and ${fout2}"
fi

echo "                            --------------------- Script $0: Completed ---------------------"

#----------------------------------------------
