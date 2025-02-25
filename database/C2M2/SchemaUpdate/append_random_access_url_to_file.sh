#!/bin/bash
#
# Call syntax: be in the correct folder: ....../database/C2M2/SchemaUpdate or another
# ./append_random_access_url_to_file.sh <foldername_without_ending_slash>
# The folder indicated by the argument should exist with the suitable files

echo "                            --------------------- Script $0: Started   ---------------------"

folder="$1"

curdir="$PWD"

append_random_to_file=1

#----------------------------------------------
# Work on biosample.tsv
fbase=file
fin="${folder}"/${fbase}.tsv
forg="${folder}"/${fbase}_org.tsv
fout="${folder}"/${fbase}.tsv

add_colname=acccess_url

cp "${fin}" "${forg}"

# Add empty or from persistent_id
#     value = ( choice == 1 ? "UBERON:0002385" : choice == 2 ? "UBERON:0001969" : choice == 3 ? "UBERON:0001088" : "UBERON:0001988"); 
# If biosample.tsv has the field assay_type, change it to sample_prep_method
# awk 'NR==1 {gsub(/\<assay_type\>/, "sample_prep_method"); $0 = $0 "\tbiofluid"} {print}' input.tsv > output.tsv
#NR == 1 {print $0, "biofluid"}
if [[ "${append_random_to_file}" == "1" ]] ; then
    awk -F'\t' -v OFS='\t' 'BEGIN {
        srand(); 
        choices[1] = ""; choices[2] = "https://www.metabolomicsworkbench.org/studydownload/ST000048.zip"; 
        choices[3] = "https://www.metabolomicsworkbench.org/studydownload/ST000465.zip";  
    }
    NR == 1 {print $0, "access_url"}
    NR > 1 {choice = int((rand() * 3) + 1); value = choices[choice]; print $0, value}' "${forg}" > "${fout}"
else
    # To use "",
    awk -F'\t' -v OFS='\t' ' NR == 1 {print $0, "access_url"} NR > 1 {print $0, ""}' ${forg} > ${fout}    
    #awk -F'\t' -v OFS='\t' ' NR == 1 {gsub(/\<assay_type\>/, "sample_prep_method"); $0 = $0 "\tbiofluid"} {print} NR > 1 {print $0, ""}' "${forg}" > "${fout}"
fi

echo "Completed adding ${add_colname} column to ${fout}"


echo "                            --------------------- Script $0: Completed ---------------------"

#----------------------------------------------
