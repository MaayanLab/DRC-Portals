#!/usr/bin/perl
##!/usr/local/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $inFile = '000_raw_files_from_GlyGen/glycan_pubchem_status-2026-07-31.csv';

my $outDir = '001_converted_TSV_lists';

my $outFile = "$outDir/gtc_pubchem_xref_status.tsv";

# EXECUTION

system("mkdir -p $outDir") if ( not -d $outDir );

open IN, "<$inFile" or die("Can't open $inFile for reading.\n");

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

while ( chomp( my $line = <IN> ) ) {
    
    $line =~ s/\s+$//;

    my @fields = map { my($nq) = ($_ =~ /^\"?([^"]*)\"?$/); $nq; } split(/\,/, $line);
    
    if ( $fields[0] eq 'glytoucan_ac' ) {
        
        print OUT join("\t", $fields[0], $fields[3], $fields[2] ) . "\n";

    } elsif ( $fields[1] eq 'no' ) {
        
        print OUT "$fields[0]\t\t\n";

    } else {
        
        my ( $id1, $id2 ) = split(/\|/, $fields[3]);

        my ($type1, $type2 ) = split(/\|/, $fields[2]);

        print OUT join("\t", $fields[0], $id1, $type1) . "\n";
        print OUT join("\t", $fields[0], $id2, $type2) . "\n";
    }
}

close OUT;

close IN;

