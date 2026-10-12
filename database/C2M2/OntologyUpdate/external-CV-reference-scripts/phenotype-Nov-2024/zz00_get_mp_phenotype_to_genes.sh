#!/bin/bash
# Will generate hp.phenotype_to_genes.txt
#
#Download MPO Gene-Phenotype associations from here:

option=1
if [[ "$option" == 1 ]] ; then
# Before Nov 2024
	wget -nc https://maayanlab.cloud/static/hdfs/harmonizome/data/mgimpo/gene_attribute_edges.txt.gz
	#Reformat to same layout as hp.phenotype_to_genes.txt:
	zcat gene_attribute_edges.txt.gz | perl -ne 'chomp; my @f = split(/\t/); print join("\t", $f[4], $f[3], $f[2], $f[0], $f[1]) . "\n";' > mp.phenotype_to_genes.txt
else
	# In Nov 2024: this is much lesser rows, so, do not use this one
	wget -nc https://maayanlab.cloud/static/hdfs/harmonizome/data/mgiphenotype/gene_attribute_edges.txt.gz
#[mano@sc-cfdewebdev phenotype-Nov-2024]$ zcat mp.gene_attribute_edges.txt.gz |head -n 5
#        Gene    Gene ID Phenotype       Mammalian Phenotype ID
#0       RB1     5925    liver hypoplasia        MP:0000600
	zcat gene_attribute_edges.txt.gz | perl -ne 'chomp; my @f = split(/\t/); print join("\t", $f[4], $f[3], $f[2], $f[1]) . "\n";' > mp.phenotype_to_genes.txt
fi

rm gene_attribute_edges.txt.gz

