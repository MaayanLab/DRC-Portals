#!/bin/bash
#
#* source (human): ftp://ftp.ensembl.org/pub/current_gff3/homo_sapiens/
#   --> initial download was of release 104 (Mar 2021): retrieved 2021.11.08
#   --> current (second) download is of release 106 (Mar 2022): retrieved 2022.04.14

#Mano: 2024/11/15
#had to create folder 000_raw_gff3/homo_sapiens: this is where the gff.gz file was downloaded then unpacked

# Mano: updated: 2026/08/12

set -Eeuo pipefail

# For Ensembl download
species=homo_sapiens
speciesFC=Homo_sapiens
genome_version=38
gff_version=116
# Additional source for getting synonyms
zz01_inF="${speciesFC}.gene_info_20220304.txt_conv_wNCBI_AC.txt"
zz01_outF="${speciesFC}.gene_info_20220304.txt_conv_wNCBI_AC.ensembl-to-synlist.tsv"
# For DB
dbport=5434
# For python script that combines several things
ontologyPathStr="/mnt/share/cfdeworkbench/C2M2/ontology"
last_master_relpath="external_CV_reference_files_202509/ensembl_genes.2025-08-20.tsv"
ens_proc_rel_dir="external-CV-reference-scripts/Ensembl-Aug-2026"

# Parameters less likely to change
SchemaUpdateFolder="${HOME}/DRC/DRC-Portals/database/C2M2/SchemaUpdate"

maindir="${PWD}"
# SCRIPT_DIR may be more robust
#SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"; cd "$SCRIPT_DIR"

date

#---------------------------------------------------------------------------------------------------------
dir0="000_raw_gff3/${species}"
mkdir -p "${dir0}"
cd "${dir0}"

#   Mano: 2025/08/20
#   --> On 2025/08/20, downloaded version 114 from the Url: http://ftp.ensembl.org/pub/current_gff3/homo_sapiens/Homo_sapiens.GRCh38.114.gff3.gz
rm -f -- *.gz *.gff3
gff_URL="http://ftp.ensembl.org/pub/current_gff3/${species}/${speciesFC}.GRCh${genome_version}.${gff_version}.gff3.gz"
#wget -nc "${gff_URL}"
wget -nc "${gff_URL}" || {
    echo "Download failed."
    exit 1
}

#* before preprocessing, don't forget to unzip the GFF3 files
#gunzip *.gz
gunzip -f ./*.gz

echo "Downloaded and unzipped gff file";

cd "${maindir}"
#---------------------------------------------------------------------------------------------------------
#       zz01*.pl uses a file preped by Mano for gene ID conversion tool:
#./zz01_process_synonyms.human.pl
# Mano: 2026/08/12: now passing inFile and outFile as arguments; else default values used in the script
dir1="001_processed_by_species/${species}"
mkdir -p "${dir1}"
rm -f -- "${dir1}"/"${species}"*.tsv*

dir2="002_all"
mkdir -p "${dir2}"
rm -f -- "${dir2}"/ensembl_genes*.tsv*

final_dir="003_final"
mkdir -p "${final_dir}"
rm -f -- "${final_dir}"/*.tsv

#---------------------------------------------------------------------------------------------------------
#	zz00*.pl uses the above gff file
./zz00_process.pl ${species}
#echo "Ran zz00*";
printf '[%s] Finished zz00_process.pl\n' "$(date '+%F %T')"

#---------------------------------------------------------------------------------------------------------
./zz01_process_synonyms.human.pl "${zz01_inF}" "${zz01_outF}"
#echo "Ran zz01*";
printf '[%s] Finished zz01_process_synonyms.human.pl\n' "$(date '+%F %T')"
#	filename: Homo_sapiens.gene_info_20220304.txt_conv_wNCBI_AC.txt
#	full path (copied the file to the current folder): /var/www/html/geneid/data/Homo_sapiens.gene_info_20220304.txt_conv_wNCBI_AC.txt

#---------------------------------------------------------------------------------------------------------
#had to create folder 002_all
#	zz02*.pl

#./zz02_add_synonyms.human.pl
# Mano: 2026/08/12: now passing mapFile as argument; else default value used in the script
./zz02_add_synonyms.human.pl "${zz01_outF}"
#echo "Ran zz02*";
printf '[%s] Finished zz02_add_synonyms.human.pl\n' "$(date '+%F %T')"


#* gene "name" and "description" fields are both nullable

#---------------------------------------------------------------------------------------------------------

#Had to modify the file zz03_aggregate_all.bash a bit
./zz03_aggregate_all.bash
#echo "Ran zz03*";
printf '[%s] Finished zz03_aggregate_all.bash\n' "$(date '+%F %T')"

#Then I generate /mnt/share/cfdeworkbench/C2M2/ontology/C2M2_genes.tsv from the latest DB table c2m2.gene.
# Mano: 2026/08/12: add dbport as argument
./get_c2m2_genes_from_db.sh ${dbport}
#echo "Ran get_c2m2_genes_from_db.sh";
printf '[%s] Finished get_c2m2_genes_from_db.sh\n' "$(date '+%F %T')"

#Then, I run the script written by Shiva from the folder /home/mano/DRC/DRC-Portals/database/C2M2/SchemaUpdate
#ensembl_genes_pipeline.py
#(after modifying any paths of files listed in that program)
cd "${SchemaUpdateFolder}"
#Mano: 2026/08/12: now passing arguments
python3 ensembl_genes_pipeline.py "$ontologyPathStr" "$last_master_relpath" "$ens_proc_rel_dir"

cd "${maindir}"

#Then, I go to folder 003_final in this folder and follow the instructions in the README there. That final file is dated and used for testing with the python prep script. 
#cd "${final_dir}"

echo "Going to do final cleanup in folder ${final_dir}";
# Mano: 2026/04/12: Now I pass $final_dir as an argument, which is used in file paths in the script now residing in the maindir itself
./README_and_run_003_final.sh "${final_dir}"

echo "All done."

echo -e "Current folder: ${PWD}\n";

#HPO_MPO_Entrez_gene_IDs_to_EnsEMBL_IDs.tsv	Mano/Srini					Not updated; see info for hp.phenotype_to_genes.txt
#hp.phenotype_to_genes.txt	Mano/Srini					Not updated as one of the scripts did not run; also newer input files from LINCS Harmonizome had lesser rows.

#mp.phenotype_to_genes.txt	Mano/Srini			external-CV-reference-scripts/phenotype-Nov-2024	See the scripts in the folder	Not updated as one of the scripts did not run; also newer input files from LINCS Harmonizome had lesser rows.

