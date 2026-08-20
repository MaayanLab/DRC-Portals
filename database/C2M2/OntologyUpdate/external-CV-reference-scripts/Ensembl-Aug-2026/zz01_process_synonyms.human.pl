#!/usr/bin/perl
# Mano: 2026/08/12: Updated further to pass arguments
use strict;
use warnings;

$| = 1;

# PARAMETERS

my $inFile_default = 'Homo_sapiens.gene_info_20220304.txt_conv_wNCBI_AC.txt';

my $outFile_default = 'Homo_sapiens.gene_info_20220304.txt_conv_wNCBI_AC.ensembl-to-synlist.tsv';

my $inFile  = shift;
my $outFile = shift;

if (!defined $inFile || !defined $outFile) {
    print "Missing arguments! Using defaults instead.\n";
    $inFile  = defined $inFile  ? $inFile  : $inFile_default;
    $outFile = defined $outFile ? $outFile : $outFile_default;
}

# EXECUTION

open IN, "<$inFile" or die("Can't open $inFile for reading.\n");

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

my $header = <IN>;

my $lineCount = 1;

print OUT "id\tsynonyms\n";

#while ( chomp( my $line = <IN> ) ) {
while ( my $line = <IN> ) {
   
   $lineCount++;

   if ($lineCount > 65470000000000000) {
      # Using single quotes around $line helps show if a trailing newline exists
      print "LineCount: $lineCount | Content: '$line'\n";
   }

   chomp($line); # Mano: 2026/08/12: added chomp here instead of in the while condition

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

   if ($lineCount > 65470000000000000) {
      # Using single quotes around $line helps show if a trailing newline exists
      print "Printing at the end of the while block: LineCount: $lineCount | Content: '$line'\n";
   }
}

close OUT;

close IN;


