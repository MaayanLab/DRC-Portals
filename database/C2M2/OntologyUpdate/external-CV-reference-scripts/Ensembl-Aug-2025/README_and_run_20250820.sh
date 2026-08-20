#!/bin/bash
#
#* source (human): ftp://ftp.ensembl.org/pub/current_gff3/homo_sapiens/
#   --> initial download was of release 104 (Mar 2021): retrieved 2021.11.08
#   --> current (second) download is of release 106 (Mar 2022): retrieved 2022.04.14

#Mano: 2024/11/15
#had to create folder 000_raw_gff3/homo_sapiens: this is where the gff.gz file was downloaded then unpacked

SchemaUpdateFolder="${HOME}/DRC/DRC-Portals/database/C2M2/SchemaUpdate"

maindir="${PWD}"

dir1="000_raw_gff3/homo_sapiens"
mkdir -p "${dir1}"
cd "${dir1}"

#   Mano: 2025/08/20
#   --> On 2025/08/20, downloaded version 114 from the Url: http://ftp.ensembl.org/pub/current_gff3/homo_sapiens/Homo_sapiens.GRCh38.114.gff3.gz
rm *.gz *.gff3
wget -nc http://ftp.ensembl.org/pub/current_gff3/homo_sapiens/Homo_sapiens.GRCh38.114.gff3.gz

#* before preprocessing, don't forget to unzip the GFF3 files
gunzip *.gz

echo "Downloaded and unzipped gff file";

cd "${maindir}"

#	zz00*.pl uses the above gff file
./zz00_process.pl homo_sapiens
echo "Ran zz00*";
#	zz01*.pl uses a file preped by Mano for gene ID conversion tool:
./zz01_process_synonyms.human.pl
echo "Ran zz01*";
#	filename: Homo_sapiens.gene_info_20220304.txt_conv_wNCBI_AC.txt
#	full path (copied the file to the current folder): /var/www/html/geneid/data/Homo_sapiens.gene_info_20220304.txt_conv_wNCBI_AC.txt

#	zz02*.pl
./zz02_add_synonyms.human.pl
echo "Ran zz02*";


#* gene "name" and "description" fields are both nullable

#had to create folder 002_all
#Had to modify the file zz03_aggregate_all.bash a bit
./zz03_aggregate_all.bash
echo "Ran zz03*";

#Then I generate /mnt/share/cfdeworkbench/C2M2/ontology/C2M2_genes.tsv from the latest DB table c2m2.gene.
./get_c2m2_genes_from_db.sh
echo "Ran get_c2m2_genes_from_db.sh";

#Then, I run the script written by Shiva from the folder /home/mano/DRC/DRC-Portals/database/C2M2/SchemaUpdate
#ensembl_genes_pipeline.py
#(after modifying any paths of files listed in that program)
cd "${SchemaUpdateFolder}"
python3 ensembl_genes_pipeline.py

cd "${maindir}"

final_dir="003_final"

#Then, I go to folder 003_final in this folder and follow the instructions in the README there. That final file is dated and used for testing with the python prep script. 
cd "${final_dir}"

echo "Going to do final cleanup in folder ${final_dir}";

./README_and_run_final_20250820.sh

echo "All done."

echo -e "Current folder: ${PWD}\n";

#HPO_MPO_Entrez_gene_IDs_to_EnsEMBL_IDs.tsv	Mano/Srini					Not updated; see info for hp.phenotype_to_genes.txt
#hp.phenotype_to_genes.txt	Mano/Srini					Not updated as one of the scripts did not run; also newer input files from LINCS Harmonizome had lesser rows.

#mp.phenotype_to_genes.txt	Mano/Srini			external-CV-reference-scripts/phenotype-Nov-2024	See the scripts in the folder	Not updated as one of the scripts did not run; also newer input files from LINCS Harmonizome had lesser rows.

