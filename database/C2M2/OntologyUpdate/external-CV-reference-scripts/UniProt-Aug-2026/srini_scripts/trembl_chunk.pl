#!/usr/local/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $inFile = $ARGV[0];  # Input file passed as argument

my $outFile = $ARGV[1]; # Output file passed as argument

my $dateFile = '002_trembl_run_begin_date.txt';

my $displayIncrement = 1000000;

open IN, "<$inFile" or die("Can't open $inFile for reading.\n");

open OUT, ">$outFile" or die("Can't open $outFile for writing.\n");

print OUT "UniProtKB-AC\tUniProtKB-ID\tdescription\tsynonyms\torganism\n";

# EXECUTION

system("(echo -n 'Run began '; date) > $dateFile");

system("echo >> $dateFile");

system("(echo 'Listing of /local/db/uniprot/latest/:'; echo) >> $dateFile");

# system("/bin/ls -alF /local/db/uniprot/latest/ >> $dateFile");

print OUT "UniProtKB-AC\tUniProtKB-ID\tdescription\tsynonyms\torganism\n";

my $lineCount = 0;

my $recording = 1;

my $lastDeTag = '';

my $ac = '';

my $id = '';

my $desc = '';

my $suffix = '';

my $synonyms = {};

my $organism = '';

print STDERR "Scanning $inFile...\n\n";

while ( chomp( my $line = <IN> ) ) {
   
   $lineCount++;

   if ( $line =~ /^\/\// ) {
      
      if ( $desc ne '' ) {
         
         $desc .= $suffix;
      }

      print OUT join("\t",
                           $ac,
                           $id,
                           $desc,
                           '[' . join(", ", map { "\"$_\"" } keys %$synonyms ) . ']',
                           $organism
                     ) . "\n";

      $ac = '';
      $id = '';
      $desc = '';
      $suffix = '';
      $synonyms = {};
      $organism = '';

      $recording = 1;
      $lastDeTag = '';

   } elsif ( $line =~ /^OX\s+NCBI_TaxID=(\d+)/i ) {
      
      my $taxID = $1;
      
      $organism = "NCBI:txid$taxID";
      
   } elsif ( $recording ) {
      
      if ( $line =~ /^ID\s+(\S+)/ ) {
         
         $id = $1;

         $id =~ s/[;]+$//;

      } elsif ( $line =~ /^AC\s+(\S+)/ ) {
         
         $ac = $1;

         $ac =~ s/[;]+$//;

      } elsif ( $line =~ /^DE\s+(Flags):\s+Fragment/ ) {
         
         $lastDeTag = $1;

         $suffix = ' (fragment)';

      } elsif ( $line =~ /^DE\s+(Flags):\s+Precursor/ ) {
         
         $lastDeTag = $1;

         $suffix = ' (precursor)';

      } elsif ( $line =~ /^DE\s+(Contains):/ ) {
         
         $lastDeTag = $1;
         
         $recording = 0;

      } elsif ( $line =~ /^DE\s+(Includes):/ ) {
         
         $lastDeTag = $1;

         $recording = 0;

      } elsif ( $line =~ /^DE\s+(RecName):\s+(.*)$/ ) {
         
         $lastDeTag = $1;

         my $nameString = $2;

         if ( $nameString =~ /^Full=(.*)$/ ) {
            
            my $nameVal = &nameStrip($1);

            if ( $nameVal ne '' ) {
               
               $desc = $nameVal;
            }

         } elsif ( $nameString =~ /^Short=(.*)$/ ) {
            
            my $synVal = &nameStrip($1);

            if ( $synVal ne '' ) {
               
               $synonyms->{$synVal} = 1;
            }

         } elsif ( $nameString =~ /^EC=(.*)$/ ) {
            
            my $ecVal = &nameStrip($1);

            if ( $ecVal ne '' ) {
               
               $synonyms->{"EC:$ecVal"} = 1;
            }
         }

      } elsif ( $line =~ /^DE\s+(AltName):\s+(.*)$/ ) {
         
         $lastDeTag = $1;

         my $nameString = $2;

         if ( $nameString =~ /^Full=(.*)$/ ) {
            
            my $synVal = &nameStrip($1);

            if ( $synVal ne '' ) {
               
               $synonyms->{$synVal} = 1;
            }

         } elsif ( $nameString =~ /^EC=(.*)$/ ) {
            
            my $ecVal = &nameStrip($1);

            if ( $ecVal ne '' ) {
               
               $synonyms->{"EC:$ecVal"} = 1;
            }
         }

      } elsif ( $lastDeTag eq 'RecName' ) {
         
         # Assumes 'Full=' never occurs on a tagless line.

         if ( $line =~ /^DE\s+Short=(.*)$/ ) {
            
            my $synVal = &nameStrip($1);

            if ( $synVal ne '' ) {
               
               $synonyms->{$synVal} = 1;
            }

         } elsif ( $line =~ /^DE\s+EC=(.*)$/ ) {
            
            my $ecVal = &nameStrip($1);

            if ( $ecVal ne '' ) {
               
               $synonyms->{"EC:$ecVal"} = 1;
            }
         }

      } elsif ( $lastDeTag eq 'AltName' ) {
         
         if ( $line =~ /^DE\s+EC=(.*)$/ ) {
            
            my $ecVal = &nameStrip($1);

            if ( $ecVal ne '' ) {
               
               $synonyms->{"EC:$ecVal"} = 1;
            }
         }
      }

   } # end if ( recording )

   if ( $lineCount % $displayIncrement == 0 ) {
      
      print STDERR "   ...scanned $lineCount lines...\n";
   }

} # end while ( line iterator )

print STDERR "\n...done. Scanned $lineCount lines total.\n";

close OUT;

close IN;



# SUBROUTINES

sub nameStrip {
   
   my $value = shift;

   $value =~ s/\s+$//;

   $value =~ s/[;]+$//;

   $value =~ s/\s+$//;

   $value =~ s/{.*}$//;

   $value =~ s/\s+$//;

   $value =~ s/(?<!\\)"/\\"/g;

   return $value;
}
