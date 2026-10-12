#!/usr/bin/perl
##!/usr/local/bin/perl
#
# Call syntax: ./zz00_make_new_compound_file.pl <compoundSynList_file> <pubchemCompoundFile>
# Example:
# ./zz00_make_new_compound_file.pl "../GlyTouCan-Aug-2025/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_compound_synonyms.tsv" "../PubChem-Aug-2025/001_stupidly_large_reference_tables/compound.2025-08-11.tsv.gz"

use strict;

$| = 1;

# PARAMETERS

# Assign arguments with default values

# 2024/11/26: Update these two paths accordingly
#my $compoundSynList = '../GlyTouCan_preprocessing/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_compound_synonyms.tsv';
# short-hand for default value using // operator
#my $compoundSynList = $ARGV[0] // '../GlyTouCan-Aug-2025/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_compound_synonyms.tsv'; # // is default value operator
my $compoundSynList = '../GlyTouCan-Aug-2026/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_compound_synonyms.tsv';

if (defined $ARGV[0]) {
    $compoundSynList = $ARGV[0];
}

#my $pubchemCompoundFile = '../PubChem_preprocessing/001_stupidly_large_reference_tables/compound.tsv.gz';
my $pubchemCompoundFile = '../PubChem-Aug-2026/001_stupidly_large_reference_tables/compound.2026-07-27.tsv.gz';

if (defined $ARGV[1]) {
    $pubchemCompoundFile = $ARGV[1];
}

my $mainOut = 'compound.tsv';

my $unseenOut = 'unseen_CIDs.txt';

# EXECUTION

open IN, "<$compoundSynList" or die("Can't open $compoundSynList for reading.\n");

my $header = <IN>;

my $targetCompounds = {};

my $unseen = {};

my $synonyms = {};

while ( chomp( my $line = <IN> ) ) {
   
   my ( $cid, $gtcid ) = split(/\t/, $line);

   $targetCompounds->{$cid} = 1;

   $unseen->{$cid} = 1;

   $gtcid =~ s/^\"//;

   $gtcid =~ s/\"$//;

   $synonyms->{$cid}->{$gtcid} = 1;
}

close IN;

open IN, "zcat $pubchemCompoundFile |" or die("Can't open $pubchemCompoundFile for reading.\n");

open OUT, ">$mainOut" or die("Can't open $mainOut for writing.\n");

$header = <IN>;

print OUT $header;

my $modLines = 0;

while ( chomp( my $line = <IN> ) ) {
   
   my @fields = split(/\t/, $line);

   my $cid = $fields[0];

   if ( exists( $targetCompounds->{$cid} ) ) {
      
      my $synBlock = $fields[3];

      if ( $synBlock eq '[]' ) {
         
         $fields[3] = '["' . join("\", \"", sort { $a cmp $b } keys %{$synonyms->{$cid}}) . '"]';

      } else {
         
         $synBlock =~ s/^\[\"//;

         $synBlock =~ s/\"\]$//;

         my @existingSyns = split(/(?<!\\)\", (?<!\\)\"/, $synBlock);

         foreach my $existingSyn ( @existingSyns ) {
            
            if ( exists( $synonyms->{$cid}->{$existingSyn} ) ) {
               
               delete $synonyms->{$cid}->{$existingSyn};
            }
         }

         if ( scalar( keys %{$synonyms->{$cid}} ) > 0 ) {
            
            foreach my $syn ( sort { $a cmp $b } keys %{$synonyms->{$cid}} ) {
               
               push @existingSyns, $syn;
            }
         }

         $fields[3] = '["' . join("\", \"", @existingSyns) . '"]';
      }

      print OUT join("\t", @fields) . "\n";

      delete $unseen->{$cid};

      $modLines++;

   } else {
      
      print OUT "$line\n";
   }
}

close OUT;

close IN;

open OUT, ">$unseenOut" or die("Can't open $unseenOut for writing.\n");

foreach my $cid ( sort keys %$unseen ) {
   
   print OUT "$cid\n";
}

close OUT;

print STDERR "Done. Modified $modLines lines for target CIDs.\n";


