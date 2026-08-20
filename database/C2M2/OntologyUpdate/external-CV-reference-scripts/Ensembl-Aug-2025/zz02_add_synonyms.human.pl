#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $mapFile = 'Homo_sapiens.gene_info_20220304.txt_conv_wNCBI_AC.ensembl-to-synlist.tsv';

my $inFile = '001_processed_by_species/homo_sapiens/homo_sapiens.tsv';

my $archiveFile = '001_processed_by_species/homo_sapiens/homo_sapiens.tsv.old';

my $outFile = '001_processed_by_species/homo_sapiens/homo_sapiens.tsv.new';

# EXECUTION

open IN, "<$mapFile" or die("Can't open $mapFile for reading.\n");

my $header = <IN>;

my $synonyms = {};

while ( chomp( my $line = <IN> ) ) {
   
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
         
while ( chomp( my $line = <IN> ) ) {
   
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


