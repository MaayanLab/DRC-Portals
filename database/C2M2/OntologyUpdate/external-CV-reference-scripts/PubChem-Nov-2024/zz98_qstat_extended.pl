#!/usr/bin/perl

use strict;

$| = 1;

# ARGUMENTS

my $argFlag = shift;

my $argVal = shift;

# PARAMETERS

my $qstatLoc = '/usr/local/packages/sge-root/bin/lx24-amd64/qstat';

my $passFlags = '';

if ( $argFlag eq '-u' and $argVal ne '' ) {
   
   if ( $argVal eq '*' or $argVal eq 'star' ) {
      
      $passFlags = "-u \"\*\" ";

   } else {
      
      $passFlags = "-u $argVal ";
   }
}

# EXECUTION

open IN, "$qstatLoc $passFlags-xml |" or die("Can't grab pipe end for \"qstat -xml\"; aborting.\n");

my $priority = {};

my $name = {};

my $owner = {};

my $state = {};

my $startTime = {};

my $qName = {};

my $slotCount = {};

my $currentJobID = '';

while ( chomp( my $line = <IN> ) ) {
   
   if ( $line =~ /JB_job_number>(\d+)</ ) {
      
      $currentJobID = $1;

   } elsif ( $line =~ /JAT_prio>(\d+\.?\d*)</ ) {
      
      $priority->{$currentJobID} = $1;

   } elsif ( $line =~ /JB_name>([^<]*)<\/JB_/ ) {
      
      $name->{$currentJobID} = $1;

   } elsif ( $line =~ /JB_owner>([^<]*)<\/JB_/ ) {
      
      $owner->{$currentJobID} = $1;

   } elsif ( $line =~ /state>([^<]*)<\/state/ ) {
      
      $state->{$currentJobID} = $1;

   } elsif ( $line =~ /start_time>([^<]*)<\/JAT_start_time/ ) {
      
      $startTime->{$currentJobID} = $1;

      $startTime->{$currentJobID} =~ s/(\d+)T(\d+)/$1 $2/;

   } elsif ( $line =~ /queue_name>([^<]*)<\/queue/ ) {
      
      $qName->{$currentJobID} = $1;

   } elsif ( $line =~ /slots>([^<]*)<\/slots/ ) {
      
      $slotCount->{$currentJobID} = $1;
   }
}

close IN;

printf("%-9s %-9s %-73s %-15s %-6s %-25s %-50s %6s\n", 'job-ID', 'priority', 'name', 'user', 'state', 'submit/start at', 'queue', 'slots');

print "--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n";

foreach my $jobID ( sort { $a cmp $b } keys %$priority ) {
   
   printf("%-9s %-9s %-73s %-15s %-6s %-25s %-50s %6s\n", $jobID, $priority->{$jobID}, $name->{$jobID}, $owner->{$jobID}, $state->{$jobID}, $startTime->{$jobID}, $qName->{$jobID}, $slotCount->{$jobID});
}


