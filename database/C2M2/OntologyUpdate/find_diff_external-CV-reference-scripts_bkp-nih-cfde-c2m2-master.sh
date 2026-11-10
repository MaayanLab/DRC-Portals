#!/bin/bash
# call syntax: ./find_diff_external-CV-reference-scripts_bkp-nih-cfde-c2m2-master.sh <dir 1 base> <dir 2 base> <sub folder>
# Example ./find_diff_external-CV-reference-scripts_bkp-nih-cfde-c2m2-master.sh external-CV-reference-scripts bkp-nih-cfde-c2m2-master/developer_tools PubChem_preprocessing
#
# Find the differences between the scripts in the folders
# external-CV-reference-scripts (first arg) and bkp-nih-cfde-c2m2-master (second arg)
# related to PubChem_preprocessing or another argument (third argument)


d10=$1
d20=$2
sf=$3

# example values
#d10=external-CV-reference-scripts #dir 1 base
#d20=bkp-nih-cfde-c2m2-master/developer_tools #dir 2 base
#sf=PubChem_preprocessing # sub folder

d1="$d10"/"$sf"
d2="$d20"/"$sf"

echo "dir 1 base: $d10";
echo "dir 2 base: $d20";
echo "sub folder: $sf";

# example of diff on one file
#f=zz00_seed_compound_TSV.pl; diff $d1/$f $d2/$f

for dirf in "$d1"/zz*.pl ; do 
	echo "-------------------";
	f=${dirf##*/}; echo "$f";
	diff "$d1"/"$f" "$d2"/"$f";
done

# The below lines are only for some folders, do it manually
#echo "-------------------";
#f=zz99_run_all.bash; echo "$f"; diff "$d1"/"$f" "$d2"/"$f";
