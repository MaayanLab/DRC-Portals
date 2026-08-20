#!/usr/local/bin/perl

use strict;

use Bio::EnsEMBL::Registry;

use DBI;

$| = 1;

# PARAMETERS

my $HPO_inFile = 'hp.phenotype_to_genes.txt';

my $MPO_inFile = 'mp.phenotype_to_genes.txt';

my $outFile = 'HPO_MPO_Entrez_gene_IDs_to_EnsEMBL_IDs.raw.tsv';

my $doneCount = 0;

my $displayIncrement = 100;

# EXECUTION

my $registry = "Bio::EnsEMBL::Registry";

$registry->load_all('./.ensembl_init');

my $gene_adaptor = $registry->get_adaptor('Homo sapiens', 'core', 'gene');

my $queryIDs = {};

foreach my $inFile ($HPO_inFile, $MPO_inFile) {

  open IN, "<$inFile" or die("Can't open $inFile for reading.\n");

  my $header = <IN>;

  print STDERR "\nLoading query IDs from phenotype-to-gene map $inFile...";

  while ( my $line = <IN> ) {
   
    my @fields = split(/\t/, $line);

    my $entrezID = $fields[2];
    
    $queryIDs->{$entrezID} = 1;
  }

}

close IN;

my $queryCount = scalar( keys %$queryIDs );

print STDERR "done. Loaded $queryCount Entrez IDs.\n\n";

print STDERR "Loading EnsEMBL IDs for the HPO Entrez ID set...\n\n";

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

print OUT "HPO_entrez_id\tensembl_ids\n";

foreach my $entrezID ( sort { $a <=> $b } keys %$queryIDs ) {
   
   my @genes = @{$gene_adaptor->fetch_all_by_external_name($entrezID)};

   my @resultIDs = ();

   foreach my $gene ( @genes ) {
      
      push @resultIDs, $gene->display_id();
   }

   print OUT "$entrezID\t" . join('|', @resultIDs) . "\n";

   $doneCount++;

   if ( $doneCount % $displayIncrement == 0 ) {
      
      print STDERR "   ...finished $doneCount / $queryCount query IDs...\n";
   }
}

print STDERR "\n...done. Scanned $doneCount / $queryCount Entrez IDs for EnsEMBL equivalents.\n\n";


