#!/usr/bin/perl
##!/usr/local/bin/perl
#
# Call syntax: ./zz01_make_new_substance_file.pl <substanceSynList_file> <pubchemSubstanceFile>
# Example:
# ./zz01_make_new_substance_file.pl "../GlyTouCan-Aug-2025/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_substance_synonyms.tsv" "../PubChem-Aug-2025/001_stupidly_large_reference_tables/substance.2025-08-11.tsv.gz"

use strict;

$| = 1;

# PARAMETERS

# 2024/11/26: Update these two paths accordingly
#my $substanceSynList = '../GlyTouCan_preprocessing/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_substance_synonyms.tsv';
my $substanceSynList = '../GlyTouCan-Aug-2025/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_substance_synonyms.tsv';
if (defined $ARGV[0]) {
    $substanceSynList = $ARGV[0];
}

#my $pubchemSubstanceFile = '../PubChem_preprocessing/001_stupidly_large_reference_tables/substance.tsv.gz';
my $pubchemSubstanceFile = '../PubChem-Aug-2025/001_stupidly_large_reference_tables/substance.2025-08-11.tsv.gz';
if (defined $ARGV[1]) {
    $pubchemSubstanceFile = $ARGV[1];
}

my $mainOut = 'substance.tsv';

my $unseenOut = 'unseen_SIDs.txt';

# EXECUTION

open IN, "<$substanceSynList" or die("Can't open $substanceSynList for reading.\n");

my $header = <IN>;

my $targetSubstances = {};

my $unseen = {};

my $synonyms = {};

while ( chomp( my $line = <IN> ) ) {
   
   my ( $sid, $gtcid ) = split(/\t/, $line);

   $targetSubstances->{$sid} = 1;

   $unseen->{$sid} = 1;

   $gtcid =~ s/^\"//;

   $gtcid =~ s/\"$//;

   $synonyms->{$sid}->{$gtcid} = 1;
}

close IN;

open IN, "zcat $pubchemSubstanceFile |" or die("Can't open $pubchemSubstanceFile for reading.\n");

open OUT, ">$mainOut" or die("Can't open $mainOut for writing.\n");

$header = <IN>;

print OUT $header;

my $modLines = 0;

while ( chomp( my $line = <IN> ) ) {
   
   my @fields = split(/\t/, $line);

   my $sid = $fields[0];

   if ( exists( $targetSubstances->{$sid} ) ) {
      
      my $synBlock = $fields[3];

      if ( $synBlock eq '[]' ) {
         
         $fields[3] = '["' . join("\", \"", sort { $a cmp $b } keys %{$synonyms->{$sid}}) . '"]';

      } else {
         
         $synBlock =~ s/^\[\"//;

         $synBlock =~ s/\"\]$//;

         my @existingSyns = split(/(?<!\\)\", (?<!\\)\"/, $synBlock);

         foreach my $existingSyn ( @existingSyns ) {
            
            if ( exists( $synonyms->{$sid}->{$existingSyn} ) ) {
               
               delete $synonyms->{$sid}->{$existingSyn};
            }
         }

         if ( scalar( keys %{$synonyms->{$sid}} ) > 0 ) {
            
            foreach my $syn ( sort { $a cmp $b } keys %{$synonyms->{$sid}} ) {
               
               push @existingSyns, $syn;
            }
         }

         $fields[3] = '["' . join("\", \"", @existingSyns) . '"]';
      }

      print OUT join("\t", @fields) . "\n";

      delete $unseen->{$sid};

      $modLines++;

   } else {
      
      print OUT "$line\n";
   }
}

close OUT;

close IN;

open OUT, ">$unseenOut" or die("Can't open $unseenOut for writing.\n");

foreach my $sid ( sort keys %$unseen ) {
   
   print OUT "$sid\n";
}

close OUT;

print STDERR "Done. Modified $modLines lines for target SIDs.\n";


