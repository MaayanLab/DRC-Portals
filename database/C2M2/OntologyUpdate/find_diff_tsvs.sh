#!/bin/bash
# call syntax: ./find_diff_tsvs.sh <dir 1 base> <dir 2 base> <sub folder>
# Example ./find_diff_tsvs.sh ${HOME}/DRC/DRC-Portals/database/C2M2/SchemaUpdate/empty_tsvs  empty_tsvs_2024-11 
#
# Find the differences between the tsv files in the folders


d10=$1
d20=$2
sf=$3

# example values
#d10=${HOME}/DRC/DRC-Portals/database/C2M2/SchemaUpdate/empty_tsvs #dir 1 base
#d20=empty_tsvs_2024-11 #dir 2 base
#sf= # sub folder # None, empty

d1="$d10"/"$sf"
d2="$d20"/"$sf"

echo "dir 1 base: $d10";
echo "dir 2 base: $d20";
echo "sub folder: $sf";

# example of diff on one file
#f=zz00_seed_compound_TSV.pl; diff $d1/$f $d2/$f

for dirf in "$d1"/*.tsv ; do 
	echo "-------------------";
	f=${dirf##*/}; echo "$f";
	diff "$d1"/"$f" "$d2"/"$f";
done

