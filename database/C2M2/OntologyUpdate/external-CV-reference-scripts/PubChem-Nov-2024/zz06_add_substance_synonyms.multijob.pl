#!/usr/bin/perl

use strict;

$| = 1;

# PARAMETERS

my $inDir = '001_stupidly_large_reference_tables';

my $xmlDir = '000_raw_PubChem_files/Substance';

my $worker = './zz06a_add_substance_synonyms.one_chunk.pl';

my $gridOut = '999_gridOut/zz06_add_substance_synonyms';

# EXECUTION

system("mkdir -p $gridOut");

opendir DOT, $inDir or die("Can't open $inDir for scanning.\n");

my @inFiles = sort { $a cmp $b } grep { /^substance\.tsv\.\d+\.sorted$/ } readdir DOT;

closedir DOT;

my $cnt = 0;

foreach my $inFile ( @inFiles ) {
   
   $cnt++;
   $inFile =~ /^substance\.tsv\.(\d+)\.sorted$/;

   my $index = $1;

   my $lowVal = (10000000 * $index) + 1;

   my $highVal = 10000000 * ($index + 1);

   opendir DOT, $xmlDir or die("Can't open $xmlDir for scanning.\n");

   my @xmlFiles = sort { $a cmp $b } grep { /^Substance_\d+_\d+\.xml\.gz$/ } readdir DOT;

   closedir DOT;

   my @xmlTargets = ();

   foreach my $xmlFile ( @xmlFiles ) {
      
      $xmlFile =~ /^Substance_(\d+)_(\d+)\.xml\.gz$/;

      my $begin = $1;

      my $end = $2;

      if ( $begin >= $lowVal and $end <= $highVal ) {
         
         push @xmlTargets, "$xmlDir/$xmlFile";
      }
   }

   my $command = "$worker $inDir/$inFile " . join(' ', @xmlTargets);

   # Mano: 2024/11/15: The 2-6 lines below are for when the CC team was running it
   # ------------------------------------------
   #my $qsub = "qsub -b y -P owhite-startup -q all.q -l mem_free=3G -N synSub_$index -e $gridOut -o $gridOut -cwd $command\n\n";
   #
   ## DEBUG
   #print "qsub=$qsub\n";
   #
   #system($qsub);
   # ------------------------------------------
   # To run it on a single machine, assuming it has enough cores and RAM, just execute the command $command
   # By changing the lower and upper limits on $cnt, you can decide how many you want to run in parallel

   if(($cnt>=0) && ($cnt < 60)){
       my $fullcommand = "$command > $gridOut/zz06_add_sub_syn_cnt_$cnt.out 2>$gridOut/zz06_add_sub_syn_cnt_$cnt.err &";
       system($fullcommand);# submit to run in background
       print("Started the command:\n$fullcommand\n");
       sleep(1);
   }
}
# Wait enough for the above job to complete: about 20 min each, allow some loss of efficiency
sleep(3600);# wait time in seconds

