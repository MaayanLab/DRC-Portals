#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $inDir = '001_stupidly_large_reference_tables';

my $inFile = "$inDir/substance.tsv";
my $tempOne = "$inDir/substance.tsv.one";
my $tempTwo = "$inDir/substance.tsv.two";

my $increment = 10000000;

my $lowVal = 1;

my $lessThan = $increment + 1;

my $fileIndex = -1;

# EXECUTION

my $nothingFound = 0;

print STDERR "Copying $inFile before destructive processing...";

system("cp $inFile $tempOne");

chomp( my $date = `date` );

print STDERR "done. [$date]\n\n";

while ( not $nothingFound ) {
   
   $nothingFound = 1;
   
   open IN, "<$tempOne" or die("Can't open $tempOne for reading.\n");

   open CACHE, ">$tempTwo" or die("Can't open $tempTwo for writing.\n");

   my $header = <IN>;

   print CACHE $header;

   $fileIndex++;

   my $outFile = "$inFile.$fileIndex";

   open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

   while ( my $line = <IN> ) {
      
      my ( $id, @theRest ) = split(/\t/, $line);

      if ( $id >= $lowVal and $id < $lessThan ) {
         
         $nothingFound = 0;

         print OUT $line;

      } else {
         
         print CACHE $line;
      }
   }

   close OUT;

   close CACHE;

   close IN;

   $lowVal += $increment;

   $lessThan += $increment;

   system("mv $tempTwo $tempOne");

   chomp( $date = `date` );

   print STDERR "   pass " . ( $fileIndex + 1 ) . " complete... [$date]\n";
}

chomp( $date = `date` );

print STDERR "\n...done. [$date]\n\n";


