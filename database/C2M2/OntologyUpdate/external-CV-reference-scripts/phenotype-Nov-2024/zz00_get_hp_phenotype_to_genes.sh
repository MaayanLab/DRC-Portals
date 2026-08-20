#!/bin/bash
#
# Will generate hp.phenotype_to_genes.txt
#Download HPO Gene-Phenotype associations from here:

# In Nov 2024
wget -nc https://maayanlab.cloud/static/hdfs/harmonizome/data/hpo/gene_attribute_edges.txt.gz

#Reformat as neeed, can change if the above file format changes

# The columns needed are:
#hpo_id  hpo_name        ncbi_gene_id    gene_symbol
#Column names could be different but their meaning should be the same across versions
#[mano@sc-cfdewebdev phenotype-Nov-2024]$ zcat hp.gene_attribute_edges.txt.gz |head -n 20
#source  source_desc     source_id       target  target_desc     target_id       weight
#GeneSym NA      GeneID  Phenotype       HPOID   NA      weight
#RAG1    na      5896    severe t lymphocytopenia        HP:0005379      -666    1.000000

#zcat gene_attribute_edges.txt.gz | perl -ne 'chomp; my @f = split(/\t/); print join("\t", $f[4], $f[3], $f[2], $f[0], $f[1]) . "\n";' > hp.phenotype_to_genes.txt
zcat gene_attribute_edges.txt.gz | perl -ne 'chomp; my @f = split(/\t/); print join("\t", $f[4], $f[3], $f[2], $f[0]) . "\n";' > hp.phenotype_to_genes.txt

rm gene_attribute_edges.txt.gz

