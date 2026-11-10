#!/usr/local/bin/perl

use strict;

$| = 1;

# ARGUMENTS

my $numToKeep = shift;

my $inFile = shift;

die("Usage: $0 <max number of (random) synonyms to keep> <infile>\n") if ( not -e $inFile or $numToKeep !~ /^\d+$/ );

# PARAMETERS

my $outFile = $inFile;

if ( $outFile !~ /\.tsv$/ ) {
   
   die("FATAL: This script only processes .tsv inputs. Aborting.\n");

} else {
   
   $outFile =~ s/\.tsv$/.max_${numToKeep}_synonyms_per_term.tsv/;
}

# EXECUTION

open IN, "<$inFile" or die("Can't open $inFile for reading.\n");

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

my $lineCount = 0;

my $header = <IN>;

$lineCount++;

print OUT $header;

while ( chomp( my $line = <IN> ) ) {
   
   $lineCount++;

   my @fields = split(/\t/, $line);

   my $synBlock = $fields[3];

   if ( $synBlock eq '[]' ) {
      
      print OUT "$line\n";

   } else {
      
      $synBlock =~ s/^\["//;

      $synBlock =~ s/"\]$//;

      my @synonyms = split(/(?<!\\)", "/, $synBlock);

      my $synSize = scalar( @synonyms );

      if ( $synSize == 0 ) {
         
         die("WTF, line $lineCount:\n\n$line\n\n");
         
      } elsif ( $synSize <= $numToKeep ) {
         
         print OUT "$line\n";

      } else {
         
         my $upperIndex = $numToKeep - 1;

         my @truncatedSynonyms = @synonyms[0..$upperIndex];

         $synBlock = '["' . join('", "', @truncatedSynonyms) . '"]';

         $fields[3] = $synBlock;

         print OUT join("\t", @fields) . "\n";
      }
   }
}

close OUT;

close IN;


