#!/usr/local/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $fileOne = 'sprot_cleaned_output.tsv';

my $fileTwo = 'trembl_cleaned_output.tsv';

my $outFile = 'protein.tsv';

# EXECUTION

die("$fileOne and $fileTwo must both be present to proceed; aborting.\n") if ( not -e $fileOne or not -e $fileTwo );

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

print OUT join("\t", ('id', 'name', 'description', 'synonyms', 'organism')) . "\n";

foreach my $inFile ( $fileOne, $fileTwo ) {
   
   open IN, "<$inFile" or die("Can't open $inFile for reading.\n");

   my $header = <IN>;

   while( my $line = <IN> ) {
      
      print OUT $line;
   }

   close IN;
}

close OUT;

system("gzip $outFile");


