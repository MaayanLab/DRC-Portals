#!/usr/bin/perl
##!/usr/local/bin/perl

use strict;

$| = 1;

# PARAMETERS

# 2024/11/26: Update these two paths accordingly
#my $compoundSynList = '../GlyTouCan_preprocessing/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_compound_synonyms.tsv';
my $compoundSynList = '../GlyTouCan-Nov-2024/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_compound_synonyms.tsv';

#my $pubchemCompoundFile = '../PubChem_preprocessing/001_stupidly_large_reference_tables/compound.tsv.gz';
my $pubchemCompoundFile = '../PubChem-Nov-2024/001_stupidly_large_reference_tables/compound.2024-11-12.tsv.gz';

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


