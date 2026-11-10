#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $rawDir = '000_raw';

my $outDir = '001_processed';

my $delFile = "$rawDir/delnodes.dmp";

my $mergedFile = "$rawDir/merged.dmp";

my $nodeFile = "$rawDir/nodes.dmp";

my $nameFile = "$rawDir/names.dmp";

my $outFile = "$outDir/ncbi_taxonomy.tsv";

my $delOut = "$outDir/deleted_IDs.txt";

my $mergedOut = "$outDir/merged_IDs.tsv";

# EXECUTION

system("mkdir -p $outDir") if ( not -e $outDir );

print STDERR "Caching merged and deleted taxIDs...";

my $deleted = {};

open IN, "<$delFile" or die("Can't open $delFile for reading.\n");

while ( chomp( my $line = <IN> ) ) {
   
   my $id = $line;

   $id =~ s/\s.*$//;

   $deleted->{$id} = 1;
}

close IN;

open IN, "<$mergedFile" or die("Can't open $mergedFile for reading.\n");

my $merged = {};

while ( chomp( my $line = <IN> ) ) {
   
   $line =~ s/\s*\|$//;

   my ( $from, $to ) = split(/\s+\|\s+/, $line);

   $merged->{$from}->{$to} = 1;
}

close IN;

print STDERR "done.\n";

print STDERR "Loading name data...";

my $sciName = {};

my $comName = {};

my $synonyms = {};

my $lineCount = 0;

open IN, "<$nameFile" or die("Can't open $nameFile for reading.\n");

while ( chomp( my $line = <IN> ) ) {
   
   $lineCount++;

   $line =~ s/\s*\|$//;

   $line =~ s/\s+\|\s+/\t/g;

   my ( $id, $name, $uniq_var, $class ) = split(/\t/, $line);

   if ( $class eq 'in-part' or $class eq 'authority' or $class eq 'type material'
                            or $class eq 'misnomer' or $class eq 'anamorph'
                            or $class eq 'misspelling' or $class eq 'includes'
                            or $class =~ /^genbank/i ) {
      
      # Ignore it.

   } elsif ( $class eq 'scientific name' ) {
      
      $sciName->{$id} = $name;

   } elsif ( $class eq 'common name' ) {
      
      $comName->{$id} = $name;

   } elsif ( $class eq 'synonym' or $class eq 'acronym' or $class eq 'blast name' or $class eq 'equivalent name'  ) {
      
      $synonyms->{$id}->{$name} = 1;

   } else {
      
      die("FATAL: Undefined name class \"$name\" at $nameFile line $lineCount; aborting.\n");
   }
}

close IN;

print STDERR "done.\n";

print STDERR "Loading rank data...";

open IN, "<$nodeFile" or die("Can't open $nodeFile for reading.\n");

my $rank = {};

while ( chomp( my $line = <IN> ) ) {
   
   $line =~ s/\s*\|$//;

   my ( $id, $parentID, $rankVal, @theRest ) = split(/\s+\|\s+/, $line);

   $rank->{$id} = $rankVal;
}

close IN;

print STDERR "done.\n";

print STDERR "Logging deleted and merged IDs...";

open DEL, ">$delOut" or die("Can't open $delOut for writing.\n");

foreach my $id ( sort { $a cmp $b } keys %$deleted ) {
   
   print DEL "NCBI:txid$id\n";
}

close DEL;

open MERGED, ">$mergedOut" or die("Can't open $mergedOut for writing.\n");

print MERGED "old_id\tnew_id\tnew_id.scientific_name\n";

foreach my $id ( sort { $a cmp $b } keys %$merged ) {
   
   my $targetCount = scalar( keys %{$merged->{$id}} );

   if ( $targetCount != 1 ) {
      
      die("FATAL: Node $id was merged with multiple targets; aborting.\n");

   } else {
      
      my $target = ( keys %{$merged->{$id}} )[0];

      my $targetName = '';

      if ( exists( $sciName->{$target} ) ) {
         
         $targetName = $sciName->{$target};

         print MERGED "NCBI:txid$id\tNCBI:txid$target\t$targetName\n";

      } else {
         
         die("FATAL: New merged ID ($target) for old (obsolete) ID ($id) has no scientific name; aborting.\n");
      }
   }
}

close MERGED;

print STDERR "done.\n";

print STDERR "Writing $outFile...";

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

print OUT "id\tclade\tname\tdescription\tsynonyms\n";

foreach my $id ( sort { $a <=> $b } keys %$sciName ) {
   
   if ( $deleted->{$id} ) {
      
      # Ignore, we already handled these

   } elsif ( exists( $merged->{$id} ) ) {
      
      # Ignore, we already handled these

   } else {
      
      my $currentComName = '';

      if ( exists( $comName->{$id} ) ) {
         
         $currentComName = $comName->{$id};
      }

      my $currentSyns = '';

      my $first = 1;

      if ( $currentComName ne '' ) {
         
         my $synonym = $currentComName;

         $synonym =~ s/(?<!\\)\"/\\\"/g;
         $synonym =~ s/\t/\\t/g;

         $currentSyns = "\"$synonym\"";

         $first = 0;
      }

      my $synCount = scalar( keys %{$synonyms->{$id}} );

      if ( $synCount > 0 ) {
         
         foreach my $synonym ( sort { $a cmp $b } keys %{$synonyms->{$id}} ) {
            
            $synonym =~ s/(?<!\\)\"/\\\"/g;
            $synonym =~ s/\t/\\t/g;

            if ( not $first ) {
               
               $currentSyns .= ', ';

            } else {
               
               $first = 0;
            }

            $currentSyns .= "\"$synonym\"";
         }
      }

      my $currentSciName = $sciName->{$id};

      $currentSciName =~ s/(?<!\\)\"/\\\"/g;
      $currentSciName =~ s/\t/\\t/g;

      print OUT "NCBI:txid$id\t$rank->{$id}\t$currentSciName\t$currentComName\t\[$currentSyns\]\n";

   } # end if ( we're dealing with a merged or deleted node )

} # end foreach ( ID in $sciName )

close OUT;

print STDERR "done.\n";


