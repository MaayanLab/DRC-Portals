#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $synFile = '000_raw_PubChem_files/Compound/CID-Synonym-filtered.gz';

my $outDir = '001_stupidly_large_reference_tables';

my $compoundTSV = "$outDir/compound.tsv";

my $tempFile = "$compoundTSV.tmp";

my $sublogdir = 'synonym_substitution_logs';

system("mkdir -p $sublogdir") if ( not -d $sublogdir );

my $subFile = "$sublogdir/subbed_synonyms.zz01.txt";

my $unsubFile = "$sublogdir/unsubbed_quote_synonyms.zz01.txt";

# $destroy <- 1 == Don't save intermediate state files:

#my $destroy = 0;
my $destroy = 1;

# EXECUTION

# Note: this script (correctly, as of time of writing) assumes
# that the records being parsed from the PubChem input files listed above
# will appear sorted (ascending) by numeric CID, and further that the
# maximum CID found in the CID-Synonym-filtered file is less than or
# equal to the maximum CID found in the CID-Title file.

open DB_IN, "<$compoundTSV" or die("Can't open $compoundTSV for reading.\n");

open DB_OUT, ">$tempFile" or die("Can't open $tempFile for writing.\n");

my $header = <DB_IN>;

print DB_OUT $header;

chomp( my $nextDBline = <DB_IN> );

my ( $current_db_id, @someOtherStuff ) = split(/\t/, $nextDBline);

open IN, "zcat $synFile |" or die("Can't open $synFile for reading.\n");

my $synLineCount = 0;

# Mano: 2025/08/13
my $dbLineCount = 1;
my $debug = 0;

my $insertionCount = 0;

my $current_syn_id = '';

my @current_synonyms = ();

my $unsubbed_values = {};

my $subbed_values = {};

print STDERR "Beginning sub pass...";

while ( chomp( my $line = <IN> ) ) {
   
   $synLineCount++;
   # Mano: 2025/08/13
   if ( $debug > 0 && $synLineCount % 100000 == 0 ) {
       print STDERR "Outer: Synonyms count: $synLineCount and Compound count: $dbLineCount.\n";
   }

   my ( $syn_id, $synonym ) = split(/\t/, $line);

   my $tempSyn = $synonym;

   $synonym =~ s/\\(?!")/\\\\/g;

   $synonym =~ s/(?<!\\)"/\\"/g;

   if ( $tempSyn ne $synonym ) {
      
      $subbed_values->{$tempSyn} = $synonym;

   } elsif ( $synonym =~ /\"/ ) {
      
      $unsubbed_values->{$synonym} = 1;
   }

   if ( $syn_id eq '' ) {
      
      die("FATAL: null record ID for synonym \"$synonym\" at $synFile line $synLineCount; aborting.\n");
   }

   if ( $current_syn_id eq '' ) {
      
      $current_syn_id = $syn_id;

      @current_synonyms = ( $synonym );

   } elsif ( $syn_id eq $current_syn_id ) {
      
      push @current_synonyms, $synonym;

   } else {
      
      # We have encountered a new CID that isn't the first record. Dump the previous one.

      while ( $current_db_id < $current_syn_id ) {
         
	 if( defined $nextDBline ){
             print DB_OUT "$nextDBline\n";
     	 }

     	 if ( $debug > 1 ) {
	     print DB_OUT "Debug line: a bit above Inner: Synonyms count: $synLineCount and Compound count: $dbLineCount; current_db_id: $current_db_id, current_syn_id: $current_syn_id.\n";
	 }

         chomp( $nextDBline = <DB_IN> );
         
	 # Mano: 2025/08/13
	 # To avoid going in infinite loop if DB_IN ends before IN ends
	 # Add this check to break the loop if the end of the file is reached
         unless ( defined $nextDBline ) {
             last;
         }

         # Mano: 2025/08/13
         $dbLineCount++;
         if ( $debug > 0 && $dbLineCount % 100000 == 0 ) {
             print STDERR "Inner: Synonyms count: $synLineCount and Compound count: $dbLineCount; current_db_id: $current_db_id, current_syn_id: $current_syn_id.\n";
             print STDERR "nextDBline: <<$nextDBline>>\n";
         }

         ( $current_db_id, @someOtherStuff ) = split(/\t/, $nextDBline);
      }

      if ( $current_db_id != $current_syn_id ) {
         
         # Some compounds don't get titles. In this case, there's a default form:

         my $insertDBline = "$current_syn_id\tCID $current_syn_id\t\t[]";

         my $newSynString = '["' . join('", "', @current_synonyms) . '"]';

         $insertDBline =~ s/\[\]$/$newSynString/;

         # Need to print this now, because we still have $nextDBline buffered from the input $compoundTSV.

         print DB_OUT "$insertDBline\n";

         $insertionCount++;

      } else {
         
         # Now we're on the right record line. Swap in the loaded synonym set where we left an empty pair of brackets (in the final field).

         my $newSynString = '["' . join('", "', @current_synonyms) . '"]';

         $nextDBline =~ s/\[\]$/$newSynString/;

         # (The new line will be printed before the next dump.)
      }

      # Update the new block.

      $current_syn_id = $syn_id;

      @current_synonyms = ( $synonym );
   }
}

close IN;

# Mano: 2025/08/13
if ( $debug > 1 ) {
    print DB_OUT "Debug line: Processed through Synonyms file (count: $synLineCount) and Compound file (count: $dbLineCount).\n";
}
print STDERR "Processed through Synonyms file (count: $synLineCount) and Compound file (count: $dbLineCount).\n";


# Process the final block.

while ( $current_db_id < $current_syn_id ) {
   
   if( defined $nextDBline ){
       print DB_OUT "$nextDBline\n";
   }
   
   chomp( $nextDBline = <DB_IN> ); 
   
   # Mano: 2025/08/13
   # To avoid going in infinite loop if DB_IN ends before IN ends
   # Add this check to break the loop if the end of the file is reached
   unless ( defined $nextDBline ) {
      last;
   }

   # Mano: 2025/08/13
   $dbLineCount++;
   if ( $debug > 0 && $dbLineCount % 100000 == 0 ) {
       print STDERR "Inner: Synonyms count: $synLineCount and Compound count: $dbLineCount; current_db_id: $current_db_id, current_syn_id: $current_syn_id.\n";
       print STDERR "nextDBline: <<$nextDBline>>\n";
   }

   ( $current_db_id, @someOtherStuff ) = split(/\t/, $nextDBline);
}

if ( $current_db_id != $current_syn_id ) {
   
   # Some compounds don't get titles. In this case, there's a default form:

   my $insertDBline = "$current_syn_id\tCID $current_syn_id\t\t[]";

   my $newSynString = '["' . join('", "', @current_synonyms) . '"]';

   $insertDBline =~ s/\[\]$/$newSynString/;

   # Need to print this now, because we still have $nextDBline buffered from the input $compoundTSV.

   print DB_OUT "$insertDBline\n";

   $insertionCount++;

} else {
   
   # Now we're on the right record line. Swap in the loaded synonym set where we left an empty pair of brackets (in the final field).

   my $newSynString = '["' . join('", "', @current_synonyms) . '"]';

   $nextDBline =~ s/\[\]$/$newSynString/;
}

# Mano: 2025/08/13
if ( $debug > 1 ) {
    print DB_OUT "Debug line: Processed the final block: Synonyms file (count: $synLineCount) and Compound file (count: $dbLineCount).\n";
}
print STDERR "Processed the final block: Synonyms file (count: $synLineCount) and Compound file (count: $dbLineCount).\n";

# Finish updating $compoundTSV.

# Mano: 2025/08/13
if( defined $nextDBline ){
   print DB_OUT "$nextDBline\n";
}

while ( my $line = <DB_IN> ) {
   
   # Mano: 2025/08/13
   unless ( defined $line ) {
      last;
   }

   print DB_OUT $line;
   $dbLineCount++;
}

# Mano: 2025/08/13
if ( $debug > 1 ) {
    print DB_OUT "Debug line: Finished updating output file: $tempFile: Synonyms file (count: $synLineCount) and Compound file (count: $dbLineCount).\n";
}
print STDERR "Finished updating output file: $tempFile: Synonyms file (count: $synLineCount) and Compound file (count: $dbLineCount).\n";

close DB_OUT;

close DB_IN;

print STDERR "done. Added $insertionCount new records.\n";

print STDERR "Caching subbed and unsubbed synonyms with quote chars...";

open OUT, ">$subFile" or die("Can't open $subFile for writing.\n");

foreach my $original ( keys %$subbed_values ) {
   
   print OUT "$original\t$subbed_values->{$original}\n";
}

close OUT;

open OUT, ">$unsubFile" or die("Can't open $unsubFile for writing.\n");

foreach my $synonym ( keys %$unsubbed_values ) {
   
   print OUT "$synonym\n";
}

close OUT;

print STDERR "done.\n";

if ( $destroy ) {
   
   system("mv $tempFile $compoundTSV");
}


