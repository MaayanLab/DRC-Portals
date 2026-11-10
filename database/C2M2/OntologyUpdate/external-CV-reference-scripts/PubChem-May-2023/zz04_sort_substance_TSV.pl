#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $inDir = '001_stupidly_large_reference_tables';

my $fileIndex = 0;

# $destroy <- 1 == Don't save intermediate state files:

#my $destroy = 0;
my $destroy = 1;

# EXECUTION

chomp( my $date = `date` );

print STDERR "Beginning sort subprocs... [$date]\n\n";

while ( -e "$inDir/substance.tsv.$fileIndex" ) {
   
   my $inFile = "$inDir/substance.tsv.$fileIndex";

   my $outFile = "$inDir/substance.tsv.$fileIndex.sorted";

   system("cat $inFile | sort -n > $outFile");

   chomp( $date = `date` );

   print STDERR "   pass " . ( $fileIndex + 1 ) . " complete... [$date]\n";

   if ( $destroy ) {
      
      system("rm $inFile");
   }

   $fileIndex++;
}

chomp( $date = `date` );

print STDERR "\n...done. [$date]\n\n";


