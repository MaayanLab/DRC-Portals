#!/usr/local/bin/perl

use strict;

$| = 1;

# ARGUMENTS

my $one = shift;

my $two = shift;

# EXECUTION

my $lineCount = 0;

open ONE, "<$one";

open TWO, "<$two";

while ( my $lineOne = <ONE> ) {
   
   $lineCount++;

   my $lineTwo = <TWO>;

   if ( $lineOne ne $lineTwo ) {
      
      die("Mismatch at line $lineCount. File $one:\n---\n${lineOne}---\nFile $two:\n$lineTwo\n");
   }
}

close TWO;

close ONE;


