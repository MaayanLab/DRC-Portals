#!/usr/bin/perl
##!/usr/local/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $inFile = '001_converted_TSV_lists/gtc_pubchem_xref_status.tsv';

my $outDir = '002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms';

my $compoundOut = "$outDir/add_compound_synonyms.tsv";

my $substanceOut = "$outDir/add_substance_synonyms.tsv";

my $covList = "$outDir/covered_GlyTouCan_ACs.txt";

# EXECUTION

system("mkdir -p $outDir") if ( not -d $outDir );

open IN, "<$inFile" or die("Can't open $inFile for reading.\n");

my $header = <IN>;

my $compoundToSyn = {};

my $substanceToSyn = {};

my $coveredACs = {};

while ( chomp( my $line = <IN> ) ) {
    
    my ( $glytoucan_ac, $pubchem_id, $rel_type ) = split(/\t/, $line);

    if ( $rel_type ne '' ) {
        
        # expected value is one of 'glycan_xref_pubchem_compound' or 'glycan_xref_pubchem_substance'

        if ( $rel_type =~ /compound$/ ) {
            
            $compoundToSyn->{$pubchem_id}->{$glytoucan_ac} = 1;

        } elsif ( $rel_type =~ /substance$/ ) {
            
            $substanceToSyn->{$pubchem_id}->{$glytoucan_ac} = 1;

        } else {
            
            die("Wait, no");
        }

        $coveredACs->{$glytoucan_ac} = 1;
    }
}

close IN;

open OUT, ">$compoundOut" or die("Can't open $compoundOut for writing.\n");

print OUT "PubChem_CID\tsynonym\n";

foreach my $cid ( sort { $a <=> $b } keys %$compoundToSyn ) {
    
    foreach my $gcac ( sort { $a cmp $b } keys %{$compoundToSyn->{$cid}} ) {
        
        print OUT "$cid\t\"$gcac\"\n";
    }
}

close OUT;

open OUT, ">$substanceOut" or die("Can't open $substanceOut for writing.\n");

print OUT "PubChem_SID\tsynonym\n";

foreach my $sid ( sort { $a <=> $b } keys %$substanceToSyn ) {
    
    foreach my $gcac ( sort { $a cmp $b } keys %{$substanceToSyn->{$sid}} ) {
        
        print OUT "$sid\t\"$gcac\"\n";
    }
}

close OUT;

open OUT, ">$covList" or die("Can't open $covList for writing.\n");

foreach my $ac ( sort { $a cmp $b } keys %$coveredACs ) {
    
    print OUT "$ac\n";
}

close OUT;


