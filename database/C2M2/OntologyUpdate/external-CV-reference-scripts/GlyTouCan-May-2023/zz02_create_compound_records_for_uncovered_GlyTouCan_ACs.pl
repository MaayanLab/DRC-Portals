#!/usr/local/bin/perl

use strict;

$| = 1;

# PARAMETERS

#my $inDir = '001_converted_TSV_lists';
my $inDir = '000_raw_files_from_GlyGen';

opendir DOT, $inDir or die("Can't open $inDir for scanning.\n");

my $masterFile = "$inDir/" . ( sort grep { /^glycan_masterlist.*\.csv$/ } readdir DOT )[0];

closedir DOT;

my $newTable = '001_converted_TSV_lists/gtc_pubchem_xref_status.tsv';

my $covList = '002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/covered_GlyTouCan_ACs.txt';

my $outDir = '003_compound_appendix_for_non-PubChem_GlyTouCan_ACs';

my $outFile = "$outDir/compound.GlyTouCan_appendix.tsv";

# EXECUTION

system("mkdir -p $outDir") if ( not -d $outDir );

open IN, "<$covList" or die("Can't open $covList for reading.\n");

my $covered = {};

while ( chomp( my $ac = <IN> ) ) {
    
    $covered->{$ac} = 1;
}

close IN;

open IN, "<$masterFile" or die("Can't open $masterFile for reading.\n");

my $header = <IN>;
die "couldn't read header from $masterFile" if ($header =~ /^\s*$/);

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

while ( chomp( my $line = <IN> ) ) {
    
    # glytoucan_ac	glytoucan_type	glycan_mass	glycan_permass	base_composition	composition	topology	monosaccharides	is_motif	missing_score

    my @fields = split(/,/, $line);

    my $ac = $fields[0];

    if ( not exists( $covered->{$ac} ) ) {
        
        print OUT join("\t", (
                                        $ac,
                                        $ac,
                                        "type=$fields[1] mass=$fields[2] permass=$fields[3] monosaccharides=$fields[7] is_motif=$fields[8] missing_score=$fields[9]",
                                        '[]'
                                    )) . "\n";
        
        $covered->{$ac} = 1;
    }
}

close IN;

open IN, "<$newTable" or die("Can't open $newTable for reading.\n");

$header = <IN>;

while ( chomp( my $line = <IN> ) ) {
    
    my ( $ac, @theRest ) = split(/\t/, $line);

    if ( not exists( $covered->{$ac} ) ) {
        
        print OUT join("\t", (
                                        $ac,
                                        $ac,
                                        '',
                                        '[]'
                                    )) . "\n";

    }
}

close IN;

close OUT;


