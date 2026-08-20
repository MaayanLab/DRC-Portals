#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $yesDir = 'success';

my $noDir = 'fail';

# EXECUTION

system("mkdir -p $yesDir") if ( not -d $yesDir );

system("mkdir -p $noDir") if ( not -d $noDir );

opendir DOT, '.' or die("Can't open . for scanning.\n");

my @inFiles = sort { $a cmp $b } grep { /\.gz$/ } readdir DOT;

closedir DOT;

NO: foreach my $inFile ( @inFiles ) {
   
   print STDERR "Processing $inFile...";

   chomp( my $valOne = `md5sum $inFile` );

   chomp( my $valTwo = `cat $inFile.md5` );

   if ( $valOne eq $valTwo ) {
      
      print STDERR "success\n";

      system("mv $inFile $inFile.md5 $yesDir\n");

   } else {
      
      print STDERR "fail\n";

      system("mv $inFile $inFile.md5 $noDir\n");
   }
}



