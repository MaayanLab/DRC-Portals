#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $inFile = 'HPO_MPO_Entrez_gene_IDs_to_EnsEMBL_IDs.raw.tsv';

my $outFile = 'HPO_MPO_Entrez_gene_IDs_to_EnsEMBL_IDs.tsv';

my $geneFile = '../Ensembl_preprocessing/002_all/ensembl_genes.tsv';

# EXECUTION

open IN, "<$geneFile" or die("Can't open $geneFile for reading.\n");

my $header = <IN>;

my $seen = {};

while ( my $line = <IN> ) {
   
   my ( $id, @theRest ) = split(/\t/, $line);

   $seen->{$id} = 1;
}

close IN;

open IN, "<$inFile" or die("Can't open $inFile for reading.\n");

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

$header = <IN>;

print OUT $header;

while ( chomp( my $line = <IN> ) ) {
   
   my ( $entrezID, $ensemblList ) = split(/\t/, $line);

   my @ensemblIDs = split(/\|/, $ensemblList);

   my @passList = ();

   foreach my $i ( 0 .. $#ensemblIDs ) {
      
      if ( $seen->{$ensemblIDs[$i]} ) {
         
         push @passList, $ensemblIDs[$i];
      }
   }

   if ( scalar( @passList ) > 0 ) {
      
      print OUT "$entrezID\t" . join('|', @passList) . "\n";
   }
}

close OUT;

close IN;


