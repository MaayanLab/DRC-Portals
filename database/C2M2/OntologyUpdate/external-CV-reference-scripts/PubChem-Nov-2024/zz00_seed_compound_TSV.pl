#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $titleFile = '000_raw_PubChem_files/Compound/CID-Title.gz';

my $outDir = '001_stupidly_large_reference_tables';

my $compoundTSV = "$outDir/compound.tsv";

# EXECUTION

# Note: this script (correctly, as of time of writing) assumes
# that the records being parsed from the PubChem input files listed above
# will appear sorted (ascending) by numeric CID

system("mkdir -p $outDir") if ( not -d $outDir );

open OUT, ">$compoundTSV" or die("Can't open $compoundTSV for writing.\n");

print OUT "id\tname\tdescription\tsynonyms\n";

open IN, "zcat $titleFile |" or die("Can't open $titleFile for reading.\n");

while ( chomp( my $line = <IN> ) ) {
   
   my ( $cid, $title ) = split(/\t/, $line);

   print OUT "$cid\t$title\t\t[]\n";
}

close IN;

close OUT;


