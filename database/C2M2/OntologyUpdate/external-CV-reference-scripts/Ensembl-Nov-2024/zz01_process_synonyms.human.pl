#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $inFile = 'Homo_sapiens.gene_info_20220304.txt_conv_wNCBI_AC.txt';

my $outFile = 'Homo_sapiens.gene_info_20220304.txt_conv_wNCBI_AC.ensembl-to-synlist.tsv';

# EXECUTION

open IN, "<$inFile" or die("Can't open $inFile for reading.\n");

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

my $header = <IN>;

my $lineCount = 1;

print OUT "id\tsynonyms\n";

while ( chomp( my $line = <IN> ) ) {
   
   $lineCount++;

   my ( $entrezID, $aliases, $symbol, $name, $ensemblID, $chromosome, $mimIDs, $hgncIDs, $refseqIDs, $uniprotIDs ) = split(/\t/, $line);

   if ( $entrezID !~ /^\d*$/ or $symbol =~ /\|/ or $ensemblID =~ /\|/ ) {
      
      die( join(' || ', $entrezID, $symbol, $ensemblID ) );
   }

   my $synonyms = {};

   $synonyms->{'ENTREZ:' . $entrezID} = 1;

   my @aliasVals = split(/\|/, $aliases);

   foreach my $synonym ( @aliasVals ) {
      
      $synonym =~ s/\\(?!")/\\\\/g;
      $synonym =~ s/(?<!\\)"/\\"/g;

      $synonyms->{$synonym} = 1;
   }

   $symbol =~ s/\\(?!")/\\\\/g;
   $symbol =~ s/(?<!\\)"/\\"/g;

   $synonyms->{$symbol} = 1;

   $name =~ s/\\(?!")/\\\\/g;
   $name =~ s/(?<!\\)"/\\"/g;

   $synonyms->{$name} = 1;

   my @mimVals = split(/\|/, $mimIDs);

   foreach my $synonym ( @mimVals ) {
      
      if ( $synonym !~ /^\d+$/ ) {
         
         die("Bad MIM ID line $lineCount: $synonym\n");
      }

      $synonym =~ s/\\(?!")/\\\\/g;
      $synonym =~ s/(?<!\\)"/\\"/g;

      $synonyms->{'MIM:' . $synonym} = 1;
   }

   my @hgncVals = split(/\|/, $hgncIDs);

   foreach my $synonym ( @hgncVals ) {
      
      if ( $synonym =~ /^\d+$/ ) {
         
         $synonyms->{'HGNC:' . $synonym} = 1;
      }
   }

   my @refseqVals = split(/\|/, $refseqIDs);

   foreach my $synonym ( @refseqVals ) {
      
      $synonym =~ s/\\(?!")/\\\\/g;
      $synonym =~ s/(?<!\\)"/\\"/g;

      $synonyms->{$synonym} = 1;
   }

   print OUT "$ensemblID\t" . '["' . join('", "', keys %$synonyms) . '"]' . "\n";
}

close OUT;

close IN;


