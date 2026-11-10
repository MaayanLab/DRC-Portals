#!/bin/bash
# Call: ./README_and_run_003_final.sh <final_dir>
# Mano: 2025/08/20
#Using the output file Shiva generated, to remove TEC and replace it by "To be experimentally confirmed",
# Mano: 2026/08/12: Updated to use relative path for files, as this script is moved to the parent folder (where other ensembl scripts are).

final_dir="003_final"
if [[ $# -ge 1 ]]; then
    final_dir=$1
fi

C2M2_sub_folder="/mnt/share/mano/CFDE/C2M2_sub"

ymd=$(date +%Y-%m-%d); 

fin="${final_dir}/ensembl_gene_synonyms_resolved.tsv"
fout1="${fin}_clean.tsv"
fout2="${fin}_clean2.tsv"
ffinal="${final_dir}/ensembl_genes.${ymd}.tsv";

sed 's/\t\ttec\t\[/\t\tTo be experimentally confirmed\t\[/Ig' "${fin}" > "${fout1}"

outf="${fout1}"
outf0="${outf}_0"

# Clean synonyms column
# remove last column synonyms_count
cp "$outf" "${outf}_raw.tsv"
tmpf="${outf0}_temp.tsv"
awk -F'\t' 'BEGIN { OFS="\t" } { \
    if (NF >= 4) { \
        sub(/^"\[/, "[", $4); \
        sub(/\]"$/, "]", $4); \
        sub(/^\[""\]$/, "[]", $4); \
        gsub(/""/, "\"", $4); \
    } \
    print $0 \
}' "$outf" > "${tmpf}" && cut -d$'\t' -f1-5 "${tmpf}" > "$outf" && rm "${tmpf}"

echo "Cleaned up the file $outf";


#Cross check: Note the $ sign before single quote in pattern (needed to interpret the tab)
egrep -e $'\tTEC\t.*\t\[' "${fout1}" > "${final_dir}/tmpfile_TEC.tsv"
egrep -e $'\t\tTo be experimentally confirmed\t\[\]' "${fout1}" > "${final_dir}/tmpfile_tobeexp.tsv"
# In Mano's account, DRC-Portals is at: ~/DRC/DRC-Portals
#diff updated_output_clean.tsv ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate/updated_output_raw.tsv
diff "${fin}" "${fout1}"  > "${final_dir}/tmpfile_diff.tsv"

# Cross check the format of the near final file
echo "Going to validate ${fout1}:"
if python3 validate_ensembl_genes_tsv.py "${fout1}"; then
    echo "${fout1}: Validation passed."
else
    echo "${fout1}: Validation failed."
fi

#I had seen a Ca[] type value in [] in synonym column. I may have deleted it manually.
cp "${fout1}" "${fout2}"
echo "Copied ${fout1} to ${fout2}: You can manually review ${fout2}, make any edits (e.g.[] within [] in synonym column), and save.\n"
echo -e "then rename (or cp) ${fout2} to something like ${ffinal}"
cmdstr0="cp \"${fout2}\" \"${ffinal}\""
echo "Command will be:";
echo -e "${cmdstr0}\n";

cmdstr1="cp \"${ffinal}\" \"${C2M2_sub_folder}/scripts/external_CV_reference_files/.\""
echo -e "--------\n[Optional] You can execute the commands below to copy to external_CV_reference_files folder for testing:\n";
echo -e "${cmdstr1}\n";
echo "If you are in a different folder, e.g., the parent folder, adjust the paths accordingly";

