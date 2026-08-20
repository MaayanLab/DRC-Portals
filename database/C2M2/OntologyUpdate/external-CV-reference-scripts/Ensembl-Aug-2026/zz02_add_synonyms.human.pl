#!/usr/bin/perl
# Mano: 2026/08/12: Updated further to pass argument

use strict;
use warnings;

$| = 1;

# PARAMETERS

my $mapFile_default = 'Homo_sapiens.gene_info_20220304.txt_conv_wNCBI_AC.ensembl-to-synlist.tsv';

my $mapFile  = shift;

if (!defined $mapFile) {
    print "Missing argument! Using default instead.\n";
    $mapFile  = $mapFile_default;
}

my $inFile = '001_processed_by_species/homo_sapiens/homo_sapiens.tsv';

my $archiveFile = '001_processed_by_species/homo_sapiens/homo_sapiens.tsv.old';

my $outFile = '001_processed_by_species/homo_sapiens/homo_sapiens.tsv.new';

# EXECUTION

open IN, "<$mapFile" or die("Can't open $mapFile for reading.\n");

my $header = <IN>;

my $synonyms = {};

#while ( chomp( my $line = <IN> ) ) {
while ( my $line = <IN> ) {
   chomp($line); # Mano: 2026/08/12: added chomp here instead of in the while condition

   my ( $id, $synBlock ) = split(/\t/, $line);

   if ( $id ne 'NA' ) {
      
      if ( $synBlock =~ /^\[\"(.*)\"\]$/ ) {
         
         $synBlock = $1;

         my @syns = split(/(?!<\\)\", (?!<\\)\"/, $synBlock);

         foreach my $syn ( @syns ) {
            
            $synonyms->{$id}->{'"' . $syn . '"'} = 1;
         }
      }
   }
}

close IN;

open IN, "<$inFile" or die("Can't open $inFile for reading.\n");

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

$header = <IN>;

print OUT $header;
         
#while ( chomp( my $line = <IN> ) ) {
while ( my $line = <IN> ) {
   chomp($line); # Mano: 2026/08/12: added chomp here instead of in the while condition
   
   my ( $id, $name, $desc, $synBlock, $org ) = split(/\t/, $line);

   if ( not exists( $synonyms->{$id} ) ) {
      
      print OUT "$line\n";

   } else {
      
      my $mergedSyns = {};

      if ( $synBlock ne '[]' ) {
         
         $synBlock =~ s/^\[\"//;

         $synBlock =~ s/\"\]$//;

         my @syns = split(/(?!<\\)\", (?!<\\)\"/, $synBlock);

         foreach my $syn ( @syns ) {
            
            $mergedSyns->{'"' . $syn . '"'} = 1;
         }
      }

      foreach my $syn ( keys %{$synonyms->{$id}} ) {
         
         $mergedSyns->{$syn} = 1;
      }

      print OUT join("\t",
                           $id, $name, $desc,
                           '[' . join(', ', (sort keys %$mergedSyns)) . ']',
                           $org) . "\n";
   }
}

close OUT;

close IN;

system("mv $inFile $archiveFile");

system("mv $outFile $inFile");


