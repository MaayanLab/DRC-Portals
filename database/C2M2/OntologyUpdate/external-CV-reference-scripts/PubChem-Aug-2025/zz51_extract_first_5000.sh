#!/bin/bash
# can pass an argument for date prefix  
inputdir=001_stupidly_large_reference_tables
outputdir=sample_pubchem_reference_data

dpf="$1"

curdir="${PWD}"

if [ -z "$dpf" ]
then
	datestr=
else
	datestr=.${dpf}
fi

mkdir -p $outputdir

farray=("compound" "substance")
for fprf in "${farray[@]}"
do
	echo "fprf=${fprf}"

	fileprefix=${fprf}${datestr}

	cd ${inputdir}
	echo "Current folder:${PWD}";
	echo "Copying ${fprf}.tsv to ${fileprefix}.tsv"
	cp ${fprf}.tsv ${fileprefix}.tsv
	gzip ${fileprefix}.tsv
	echo "Copied and gzipped"
	
	cd ${curdir}
	echo "Current folder:${PWD}";
	opf=${outputdir}/${fileprefix}.first_5000_records.tsv
	zcat ${inputdir}/${fileprefix}.tsv.gz | head -q -n5001 > ${opf}
	echo "Extracted the first 5000 rows to the file ${opf}";
	gzip ${opf}
	echo "gzipped the file with 5000 records";
done

