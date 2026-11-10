#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $inDir = '000_raw_PubChem_files/Substance';

my $outDir = '001_stupidly_large_reference_tables';

my $substanceTSV = "$outDir/substance.tsv";

my $outFile = "$outDir/substance.tsv.new";

my $unfoundFile = "$outDir/unready_SIDs.tsv";

my $subFile = 'subbed_synonyms.zz06.txt';

my $unsubFile = 'unsubbed_quote_synonyms.zz06.txt';

# $destroy <- 1 == Don't save intermediate state files:

#my $destroy = 0;
my $destroy = 1;

# EXECUTION

opendir DOT, "$inDir" or die("Can't open $inDir for scanning.\n");

my @inFiles = sort { $a cmp $b } grep { /^Substance.*\.gz$/ } readdir DOT;

closedir DOT;

my $currentFileCount = 0;

my $totalFileCount = scalar( @inFiles );

open MAIN, "<$substanceTSV" or die("Can't open $substanceTSV for reading.\n");

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

my $header = <MAIN>;

print OUT $header;

chomp( my $mainLine = <MAIN> );

my ( $mainID, @theRest ) = split(/\t/, $mainLine);

my $missingLines = {};

chomp( my $date = `date` );

print STDERR "[$date] Beginning substitution pass...\n\n";

my $unsubbed_values = {};

my $subbed_values = {};

foreach my $inFile ( @inFiles ) {
   
#   if ( $inFile eq 'Substance_000000001_000500000.xml.gz' ) {
      
   my $lineCount = 0;

   my $currentID = '';

   my $title = {};

   my $synonyms = {};

   my $listening = 0;

   my $cid = {};

   open IN, "zcat $inDir/$inFile |" or die("Can't open $inDir/$inFile for reading.\n");

   while ( chomp( my $line = <IN> ) ) {
      
      $lineCount++;

      if ( $line =~ /<PC\-ID_id>(\d+)<\/PC\-ID_id>/ ) {
         
         $currentID = $1;

      } elsif ( $line =~ /<PC\-ID_id>/ ) {
         
         die("ACK! $line\n");
      
      } elsif ( $line =~ /<PC\-Substance_synonyms_E>\s*(.*)\s*<\/PC\-Substance_synonyms_E>/ ) {
         
         my $synonym = $1;

         my $tempSyn = $synonym;

         $synonym =~ s/(?<!\\)"/\\"/g;

         if ( $tempSyn ne $synonym ) {
            
            $subbed_values->{$synonym} = 1;

         } elsif ( $synonym =~ /\"/ ) {
            
            $unsubbed_values->{$synonym} = 1;
         }

         if ( not exists( $synonyms->{$currentID} ) ) {
            
            $synonyms->{$currentID} = [];

            $title->{$currentID} = $synonym;
         }

         push @{$synonyms->{$currentID}}, $synonym;

      } elsif ( $line =~ /<PC\-Substance_synonyms_E>/ ) {
         
         die("OH NO! $line\n");

      } elsif ( $line =~ /<PC\-CompoundType_type value="standardized">1<\/PC\-CompoundType_type>/ ) {
         
         $listening = 1;

      } elsif ( $line =~ /<PC\-CompoundType_type value=/ ) {
         
         $listening = 0;

      } elsif ( $line =~ /<PC\-CompoundType_id_cid>(.+)<\/PC\-CompoundType_id_cid>/ ) {
         
         if ( $listening ) {
            
            $cid->{$currentID} = $1;
         }
      }

   } # end while ( line iterator on current input XML.gz )

   close IN;

   chomp( $date = `date` );

   print STDERR "   (" . ++$currentFileCount . "/" . $totalFileCount . ") [$date] loaded $inFile; inserting synonyms...";

   # Insert the new synonyms (in SID order) into the main table.

   foreach my $sid ( sort { $a <=> $b } keys %$title ) {
      
      while ( not eof(MAIN) and $mainLine ne '' and $mainID < $sid ) {
         
         print OUT "$mainLine\n";

         if ( chomp( $mainLine = <MAIN> ) ) {
            
            ( $mainID, @theRest ) = split(/\t/, $mainLine);

         } else {
            
            # We fell off the end of the file.

            $mainLine = '';
         }
      }

      if ( $mainID == $sid ) {
         
         my $currentCID = $theRest[3];

         print OUT "$sid\t$title->{$sid}\t\t[\"" . join( '", "', @{$synonyms->{$sid}} ) . "\"]\t$currentCID\n";

         if ( $currentCID ne $cid->{$sid} ) {
            
            die("Good grief! [$sid] $currentCID != $cid->{$sid} ; aborting.\n");
         }

         # Advance to the next input line in substance.tsv to avoid record duplication (we just wrote a new version of the current line)

         if ( chomp( $mainLine = <MAIN> ) ) {
            
            ( $mainID, @theRest ) = split(/\t/, $mainLine);

         } else {
            
            # We fell off the end of the file.

            $mainLine = '';
         }

      } elsif ( $mainID > $sid ) {
         
         # This SID isn't in the input file.

         my $currentCID = 'NOT_ASSIGNED';

         if ( exists( $cid->{$sid} ) ) {
            
            $currentCID = $cid->{$sid};
         }

         $missingLines->{$sid} = "$sid\t$title->{$sid}\t\t[\"" . join( '", "', @{$synonyms->{$sid}} ) . "\"]\t$currentCID\n";

      } else {
         
         # We fell off the end of the input file.

         my $currentCID = 'NOT_ASSIGNED';

         if ( exists( $cid->{$sid} ) ) {
            
            $currentCID = $cid->{$sid};
         }

         $missingLines->{$sid} = "$sid\t$title->{$sid}\t\t[\"" . join( '", "', @{$synonyms->{$sid}} ) . "\"]\t$currentCID\n";
      }

   } # end foreach ( $sid for which synonyms were loaded from $inFile )

   chomp( $date = `date` );

   print STDERR "done. [$date]\n";
   
#   } # end if ( we're in the test file )
}

chomp( $date = `date` );

print STDERR "\n...done with substitution pass. [$date]\nCleaning up...";

# If we haven't yet fallen off the end of the input file, copy the rest of it.

if ( $mainLine ne '' ) {
   
   print OUT "$mainLine\n";
}

while ( $mainLine = <MAIN> ) {
   
   print OUT $mainLine;
}

close OUT;

close MAIN;

open OUT, ">$unfoundFile" or die("Can't open $unfoundFile for writing.\n");

foreach my $sid ( sort { $a <=> $b } keys %$missingLines ) {
   
   print OUT $missingLines->{$sid};
}

close OUT;

print STDERR "Caching subbed and unsubbed synonyms with quote chars...";

open OUT, ">$subFile" or die("Can't open $subFile for writing.\n");

foreach my $synonym ( keys %$subbed_values ) {
   
   print OUT "$synonym\n";
}

close OUT;

open OUT, ">$unsubFile" or die("Can't open $unsubFile for writing.\n");

foreach my $synonym ( keys %$unsubbed_values ) {
   
   print OUT "$synonym\n";
}

close OUT;

print STDERR "done.\n";

if ( $destroy ) {
   
   system("mv $outFile $substanceTSV");
}

chomp( $date = `date` );

print STDERR "done. [$date]\n";


