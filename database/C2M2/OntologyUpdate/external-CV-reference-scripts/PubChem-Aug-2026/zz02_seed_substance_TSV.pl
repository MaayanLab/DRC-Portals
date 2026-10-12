#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $subMap = '000_raw_PubChem_files/Compound/CID-SID.gz';

my $outDir = '001_stupidly_large_reference_tables';

my $compoundTSV = "$outDir/compound.tsv";

my $substanceTSV = "$outDir/substance.tsv";

my $failSubstanceTSV = "$outDir/substance.failed_CID_lookups.tsv";

# EXECUTION

# Note: this script (correctly, as of time of writing) assumes
# that the records being parsed from the PubChem input files listed above
# will appear sorted (ascending) by numeric CID

print STDERR "Loading map...";

open IN, "zcat $subMap |" or die("Can't open $subMap for reading.\n");

my $cid = {};

while ( chomp( my $line = <IN> ) ) {
   
   my ( $currentCID, $currentSID, $currentType ) = split(/\t/, $line);

   # Relationship types (we only care about #1):
   # 
   # 1   Standardized Form of the Deposited Substance
   # 2   Component of the Standardized Form
   # 3   Neutralized Form of the Standardized Form

   if ( $currentType == 1 ) {
      
      $cid->{$currentSID} = $currentCID;
   }
}

close IN;

print STDERR "done.\n";

print STDERR "Loading operational CIDs...";

open IN, "<$compoundTSV" or die("Can't open $compoundTSV for reading.\n");

my $header = <IN>;

my $seen = {};

while ( chomp( my $line = <IN> ) ) {
   
   my ( $id, @theRest ) = split(/\t/, $line);

   $seen->{$id} = 1;
}

print STDERR "done.\n";

print STDERR "Seeding $substanceTSV and logging failures...";

open OUT, ">$substanceTSV" or die("Can't open $substanceTSV for writing.\n");

print OUT "id\tname\tdescription\tsynonyms\tcompound\n";

open FAIL, ">$failSubstanceTSV" or die("Can't open $failSubstanceTSV for writing.\n");

print FAIL "SID\tUNFOUND_CID\n";

# Sadly, too bloody expensive
# foreach my $sid ( sort { $a <=> $b } keys %$cid ) {

foreach my $sid ( keys %$cid ) {
   
   print OUT "$sid\t\t\t\[\]\t$cid->{$sid}\n";

   if ( not exists( $seen->{$cid->{$sid}} ) ) {
      
      print FAIL "$sid\t$cid->{$sid}\n";
   }
}

close FAIL;

close OUT;

print STDERR "done.\n";


