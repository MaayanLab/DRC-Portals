#!/bin/bash
#
# Mano: 2025/08/20
#Using the output file Shiva generated, to remove TEC and replace it by "To be experimentally confirmed",
#Linux bash command:
#being in the folder where ther file ensembl_gene_synonyms_resolved.tsv is:

C2M2_sub_folder="/mnt/share/mano/CFDE/C2M2_sub"

ymd=$(date +%Y-%m-%d); 

fin=ensembl_gene_synonyms_resolved.tsv
fout1="${fin}_clean.tsv"
fout2="${fin}_clean2.tsv"
ffinal="ensembl_genes.${ymd}.tsv";

sed 's/\t\ttec\t\[/\t\tTo be experimentally confirmed\t\[/Ig' "${fin}" > "${fout1}"

outf="${fout1}"

# Clean synonyms column
# remove last column synonyms_count
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
}' "$outf" > "${tmpf}" && cut -d$'\t' -f1-5 "${tmpf}" > "$outf" && rm "${tmpf}"

echo "Cleaned up the file $outf";


#Cross check: Note the $ sign before single quote in pattern (needed to interpret the tab)
egrep -e $'\tTEC\t.*\t\[' "${fout1}" > tmpfile_TEC.tsv
egrep -e $'\t\tTo be experimentally confirmed\t\[\]' "${fout1}" > tmpfile_tobeexp.tsv
# In Mano's account, DRC-Portals is at: ~/DRC/DRC-Portals
#diff updated_output_clean.tsv ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate/updated_output_raw.tsv
diff "${fin}" "${fout1}"  > tmpfile_diff.tsv

#I had seen a Ca[] type value in [] in synonym column. I may have deleted it manually.
cp "${fout1}" "${fout2}"
echo "Copied ${fout1} to ${fout2}: You can manually review ${fout2}, make any edits (e.g.[] within [] in synonym column), and save.\n"
echo -e "then rename ${fout2} to something like ensembl_genes.${ymd}.tsv"

cmdstr1="cp \"${ffinal}\" \"${C2M2_sub_folder}/scripts/external_CV_reference_files/.\""
echo -e "--------\nYou can execute the commands below to copy to external_CV_reference_files folder for testing:\n";
echo -e "${cmdstr1}\n";
echo "If you are in a different folder, e.g., the parent folder, adjust the paths accordingly";

