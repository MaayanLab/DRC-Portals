#!/usr/bin/perl

use strict;

$| = 1;

# ARGUMENTS

my $species_name = shift;

die("Usage: $0 <species_name>\n") if ( $species_name eq '' );

# PARAMETERS

my $inDir = "000_raw_gff3/$species_name";

my $outDir = "001_processed_by_species/$species_name";

my $outFile = "$outDir/$species_name.tsv";

my $idMap = 'ensembl_organism_name_to_ncbi_taxonomy_id.tsv';

my $coordMap = "$outDir/$species_name.coords.tsv";

# EXECUTION

if ( not -d $inDir ) {
    
    die("Can't open $inDir for scanning.\n");
}

my $taxID = '';

open IN, "<$idMap" or die("Can't open $idMap for reading.\n");

my $found = 0;

while ( not $found and chomp( my $line = <IN> ) ) {
    
    my ( $spName, $txID ) = split(/\t/, $line);

    if ( $spName eq $species_name ) {
        
        $found = 1;

        $taxID = $txID;
    }
}

if ( not $found ) {
    
    die("Couldn't load \"$species_name\" taxon ID from \'$idMap\'; aborting.\n");
}

print STDERR "Removing old output...";

if ( system("rm -rf $outDir") != 0 ) {
    
    die("\n    ...couldn't remove old directory \"$outDir\"; aborting.\n");
}

if ( system("mkdir -p $outDir") != 0 ) {
    
    die("\n    ...Can't create $outDir; aborting.\n");
}

print STDERR "done.\n";

print STDERR "Parsing GFF3 files for $species_name ($taxID)...\n\n";

opendir DOT, $inDir or die("Can't open $inDir for scanning.\n");

my @inFiles = sort grep { /\.gff3$/i } readdir DOT;

closedir DOT;

my $name = {};

my $description = {};

my $synonyms = {};

my $organism = {};

my $coords = {};

foreach my $file ( @inFiles ) {
    
    print STDERR "    ...loading $file...\n";

    my $inFile = "$inDir/$file";

    open IN, "<$inFile" or die("Can't open $inFile for reading.\n");

    while ( chomp( my $line = <IN> ) ) {
        
        if ( length( $line ) > 0 and $line !~ /^#/ ) {
            
            my ( $seq, $src, $type, $start, $end, $score, $strand, $phase, $notes ) = split(/\t/, $line);

            if ( $type eq 'gene' ) {
                
                if ( $notes =~ /;gene_id=([^;]+);/ ) {
                    
                    my $geneID = $1;

                    $name->{$geneID} = '';

                    $description->{$geneID} = '';

                    $synonyms->{$geneID} = {};

                    $organism->{$geneID} = $taxID;

                    my @noteFields = split(/;/, $notes);

                    foreach my $keyVal ( @noteFields ) {
                        
                        if ( $keyVal =~ /^Name\=(.+)/ ) {
                            
                            $name->{$geneID} = $1;

                        } elsif ( $keyVal =~ /^description=(.+)/ ) {
                            
                            my $urlDecodedDesc = $1;

                            # These two seem to be the only URL-encoded values used in this database.

                            $urlDecodedDesc =~ s/\%2C/,/g;

                            $urlDecodedDesc =~ s/\%3B/;/g;

                            $description->{$geneID} = $urlDecodedDesc;
                        }
                    }

                    my $coordSeq = $seq;

                    if ( $seq eq 'MT' ) {
                         
                        $coordSeq = 'M';
                    }

                    $coords->{$geneID}->{$coordSeq}->{$start}->{$end} = 1;

                } else {
                    
                    die("WHY? ::: $notes\n");
                }
            }
        }
    }

    close IN;
}

print STDERR "\n...done.\n";

print STDERR "Caching gene coordinates...";

open OUT, ">$coordMap" or die("Can't open $coordMap for writing.\n");

print OUT "id\tchr\tstart\tend\n";

foreach my $geneID ( sort { $a cmp $b } keys %$coords ) {
    
    foreach my $chrID ( sort { $a cmp $b } keys %{$coords->{$geneID}} ) {
        
        foreach my $start ( sort { $a <=> $b } keys %{$coords->{$geneID}->{$chrID}} ) {
            
            foreach my $end ( sort { $a <=> $b } keys %{$coords->{$geneID}->{$chrID}->{$start}} ) {
                
                print OUT "$geneID\t$chrID\t$start\t$end\n";
            }
        }
    }
}

close OUT;

print STDERR "done.\n";

print STDERR "Writing full C2M2-formatted gene.tsv...";

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

print OUT "id\tname\tdescription\tsynonyms\torganism\n";

foreach my $geneID ( sort { $a cmp $b } keys %$organism ) {
    
    print OUT "$geneID\t$name->{$geneID}\t$description->{$geneID}\t[";

    print OUT join(',', ( sort { $a cmp $b } keys %{$synonyms->{$geneID}} ));
        
    print OUT "]\t$organism->{$geneID}\n";
}

close OUT;

print STDERR "done. TSV for $species_name ($taxID) is ready in $outDir\n";


