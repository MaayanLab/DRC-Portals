#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $inDir = '001_stupidly_large_reference_tables';

my $failFile = "$inDir/substance.failed_CID_lookups.tsv";

my $compoundFile = "$inDir/compound.tsv";

my $compoundTemp = "$inDir/compound.tsv.new";

my $debugCidsFound = 'cids_loaded.txt';

my $debugCidsAdded = 'cids_added.txt';

my $debug = 0;

# $destroy <- 1 == Don't save intermediate state files:

#my $destroy = 0;
my $destroy = 1;

# EXECUTION

print STDERR "Loading missing values...";

open IN, "<$failFile" or die("Can't open $failFile for reading.\n");

my $header = <IN>;

my $compoundLineHash = {};

my $substanceLineHash = {};

while ( chomp( my $line = <IN> ) ) {
   
   my ( $sid, $cid ) = split(/\t/, $line);

   # id	name	description	synonyms

   $compoundLineHash->{$cid} = "$cid\tCID $cid\t\t[]\n";

   # id	name	description	synonyms	compound

   $substanceLineHash->{$sid} = "$sid\t\t\t\[\]\t$cid\n";
}

close IN;

my @cidLines = ();

if ( $debug ) {
   
   open OUT, ">$debugCidsFound" or die("Can't open $debugCidsFound for writing.\n");
}

foreach my $cid ( sort { $a <=> $b } keys %$compoundLineHash ) {
   
   push @cidLines, $compoundLineHash->{$cid};

   if ( $debug ) {
      
      print OUT "$cid\n";
   }
}

if ( $debug ) {
   
   close OUT;
}

my @sidLines = ();

foreach my $sid ( sort { $a <=> $b } keys %$substanceLineHash ) {
   
   push @sidLines, $substanceLineHash->{$sid};
}

print STDERR "done.\n";

chomp( my $date = `date` );

print STDERR "Updating $compoundFile... [$date]\n\n";

open IN, "<$compoundFile" or die("Can't open $compoundFile for reading.\n");

open OUT, ">$compoundTemp" or die("Can't open $compoundTemp for writing.\n");

if ( $debug ) {
   
   open ADD, ">$debugCidsAdded" or die("Can't open $debugCidsAdded for writing.\n");
}

my $nextCidLine = shift @cidLines;

my ( $nextCid, @theRest ) = split(/\t/, $nextCidLine);

my $newCidCount = 0;

my $header = <IN>;

print OUT $header;

while ( my $line = <IN> ) {
   
   my ( $currentCid, @currentRest ) = split(/\t/, $line);

   while ( $nextCid != -1 and $currentCid > $nextCid ) {
      
      if ( $nextCidLine ne '' ) {
         
         print OUT $nextCidLine;

         $newCidCount++;

         if ( $debug ) {
            
            print ADD "$nextCid\n";
         }
      }

      if ( scalar( @cidLines ) > 0 ) {
         
         $nextCidLine = shift @cidLines;

         ( $nextCid, @theRest ) = split(/\t/, $nextCidLine);

      } else {
         
         $nextCidLine = '';

         $nextCid = -1;
      }
   }

   print OUT $line;
}

# There might still be some CIDs left to add on the end of the sorted target list.

if ( $nextCidLine ne '' ) {
   
   print OUT $nextCidLine;

   $newCidCount++;

   if ( $debug ) {
      
      print ADD "$nextCid\n";
   }
}

if ( scalar( @cidLines ) > 0 ) {
   
   foreach my $line ( @cidLines ) {
      
      print OUT $line;

      $newCidCount++;

      if ( $debug ) {
         
         ( $nextCid, @theRest ) = split(/\t/, $line);

         print ADD "$nextCid\n";
      }
   }
}

if ( $debug ) {
   
   close ADD;
}

close OUT;

close IN;

if ( $destroy ) {
   
   system("mv $compoundTemp $compoundFile");
}

print STDERR "\n...done updating $compoundFile; added $newCidCount new CIDs (sanity: " . scalar( keys %$compoundLineHash ) . ").\n";

if ( $destroy ) {
   
   system("rm $failFile");
}


