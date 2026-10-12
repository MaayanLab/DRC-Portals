#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $inDir = '001_stupidly_large_reference_tables';

my $newFile = "$inDir/substance.tsv";

my $failFile = "$inDir/unready_SIDs.tsv";

my $oldFile = "$inDir/substance.tsv.old";

my $header = "$inDir/substance.tsv.one";

my $fileIndex = 0;

# $destroy <- 1 == Don't save intermediate state files:

my $destroy = 0;
#my $destroy = 1;

# EXECUTION

if ( -e $newFile ) {
   
   system("mv $newFile $oldFile");
}

system("rm -f $failFile");

chomp( my $date = `date` );

print STDERR "Beginning concatenations... [$date]\n\n";

system("cat $header > $newFile");

while ( -e "$inDir/substance.tsv.$fileIndex.sorted" ) {
   
   system("cat $inDir/substance.tsv.$fileIndex.sorted >> $newFile");
   
   system("cat $inDir/substance.tsv.$fileIndex.sorted.unready_SIDs.tsv >> $failFile");

   chomp( $date = `date` );

   print STDERR "   chunk " . ( $fileIndex ) . " appended... [$date]\n";

   $fileIndex++;
}

chomp( $date = `date` );

print STDERR "\n...done. [$date]\n\n";

if ( $destroy ) {
   
   system("rm -f $header");

   system("rm -f $oldFile");

   system("rm -f $inDir/substance.tsv.*.sorted");

   system("rm -f $inDir/substance.tsv.*.sorted.unready_SIDs.tsv");
}


