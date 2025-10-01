#!/bin/bash
#
# Do not include the ending / in folder paths (relative or absolute)
# Call syntax (multiline): be in the correct folder: outside DRC-Portals, e.g., 
# ./copy_test_dcc_c2m2_package_generic.sh \
# ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate/ingest/c2m2s/Metabolomics/MW_submission_packet_20241211/MW_submission_packet_20241211 \
# Metabolomics \
# validation-logs/202503/validation_result-Metabolomics.log \
# [append_random_access_url_to_file.sh|donothing.sh] \
# ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate \
# [0|1|2]

echo "              --------------------- Script $0: Started   ---------------------"

sdir="$1" # source dir, e.g. ....../DRC-Portals/database/C2M2/SchemaUpdate/ingest/c2m2s/Metabolomics/MW_submission_packet_20241211/MW_submission_packet_20241211
tdir="$2" # target dir, e.g., keeping it outside DRC-Portals for now, e.g., being in ~/CFDE/C2M2_sub/, KidsFirst
vlogf="$3" # validation log file, e.g., validation-logs/202503/validation_result-KidsFirst.log 
scriptfile_for_update="$4" # script to run to make changes in the seelect tsv files: e.g., append_random_access_url_to_file.sh
schemaupdate_dir="$5" # ....../DRC-Portals/database/C2M2/SchemaUpdate

# if onlyTest = 2 then it will copy and test; if 1, it will only test
if [[ $# -lt 6 ]]; then
	onlyTest=0
else
	onlyTest=$6
fi

curdir="$PWD"

schema_json_file=C2M2_datapackage.json
schema_json_file_default=C2M2_datapackage.json
main_target_file=file.tsv

copy_sdir_to_tdir=0

if [[ "$onlyTest" == "0" ]]; then
	echo "onlyTest = ${onlyTest}, copy, update and test will be performed";
elif [[ "$onlyTest" == "1" ]]; then
	echo "onlyTest = ${onlyTest}, only test will be performed";
elif [[ "$onlyTest" == "2" ]]; then
	echo "onlyTest = ${onlyTest}, copy and test (no update) will be performed";
fi
#------------------------------------------------------------------------------------
# Test submission prep py script
#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# For file.tsv access_url testing
#<<<<<<<<<<<<<<<<<<<
# This can be done in a script, e.g., append_random_access_url_to_file.sh 
# for the case of file.tsv access_url testing.
#<<<<<<<<<<<<<<<<<<<
# Assuming this script will be operated from the folder ~/CFDE/C2M2_sub, create folder KidsFirst (this is outside DRC-Portals)
if [[ "$onlyTest" == "0" || "$onlyTest" == "2" ]]; then
	mkdir -p "${tdir}"
	echo "Created directory if did not exist: ${tdir}";
	#cp -R ${sdir}/* ${tdir}/.
	if [[ "$copy_sdir_to_tdir" == "1" ]]; then
		cp -R "${sdir}"/* "${tdir}"/. # ChatGPT said * should be outside quotes, but . can be inside
		echo "Copied files from directory ${sdir} to ${tdir}";
	fi
	
	cd "${tdir}"
	
	if [[ "$copy_sdir_to_tdir" == "1" ]]; then
		dos2unix *.tsv
		echo "Applied command dos2unix to tsv files inside ${tdir}";
	fi
	
	cp "${schemaupdate_dir}"/${schema_json_file} ./"${schema_json_file_default}"
	echo "Copied the updated c2m2 json schema file to ${tdir}";
	cd "${curdir}"
	if [[ "$onlyTest" == "0" ]]; then
		cp "${schemaupdate_dir}"/"${scriptfile_for_update}" .
		./${scriptfile_for_update} "${tdir}"
		echo "Copied ${scriptfile_for_update} to current folder and ran the script";
		# inspect file.tsv to check if access_url column with some random entries got added
		echo "------ Inspect the top few lines of the file ${main_target_file} below if the desired update seems successful ------";
		head "${tdir}"/${main_target_file}
	fi
else
	echo "onlyTest = ${onlyTest}, so, it assumes that the files are already present at ${tdir}";
fi
echo "--------------------------------------------------------------------------------------------------------------";

#------------------------------------------------------------------------------------
# Now, test the python script that automatically generates the CV/ontology tables/files 
# based on the code c2m2 tables/files
prep_pyf_base=prepare_C2M2_submission
prep_pyf=${prep_pyf_base}.py
ymd=$(date +%y%m%d)
prep_pyf_bkp=${prep_pyf_base}_${ymd}.py

echo "Changing direcotry to scripts folder";
cd scripts
if [ ! -f "${prep_pyf_bkp}" ]; then
  cp ${prep_pyf} ${prep_pyf_bkp}
else
  # do nothing
  echo "Nothing to do as ${prep_pyf_bkp} already exists"
fi

cp "${schemaupdate_dir}"/${prep_pyf} .
echo -e "\nCopied updated ${prep_pyf} to scripts folder. Inspect the changes below, though, generally, no action needed as such.\n";
# 	Edit prepare_C2M2_submission.py to specify folder where tsv and json are located
pattern="submissionDraftDir = 'draft_C2M2_submission_TSVs'"
replacement="submissionDraftDir = '../${tdir}' # Original: submissionDraftDir = 'draft_C2M2_submission_TSVs'"
# Use sed to find and replace the pattern
sed -i.bak "s|$pattern|$replacement|" "${prep_pyf}"

echo "Updated submissionDraftDir in the file ${prep_pyf}. Check the updated line below"
grep draft_C2M2_submission_TSVs "${prep_pyf}"
echo -e "\n----------- Also, check the output of diff between ${prep_pyf_bkp} and ${prep_pyf}\n";
diff "${prep_pyf_bkp}" "${prep_pyf}"

echo "---------- Going to run the script ${prep_pyf} : Inspect the log printed on the screen; there should be no errors----------";
cd autogenerated_C2M2_term_tables/; rm -rf *.tsv ; cd .. ; python3 "${prep_pyf}"
#echo "---------- Check the generated file biofluid.tsv below ----------";
#cat autogenerated_C2M2_term_tables/biofluid.tsv
cp autogenerated_C2M2_term_tables/*.tsv ../"${tdir}"/.
echo "---------- Test using frictionless package ----------";
cd "${curdir}"

#------------------------------------------------------------------------------------
vlogdir="$(dirname ${vlogf})"
mkdir -p "${vlogdir}"
# call frictionless, it must exist on path
frictionless validate "${tdir}/${schema_json_file_default}" > "${vlogf}"
echo "---------- Check the content of ${vlogf} below, all files should be VALID, else find out the issue, fix it and run this script again ----------";
cat "${vlogf}"
# copy back *biofluid* files and biosample.tsv to sdir
if [ -f "${vlogf}" ] ; then
	invalid_linecount=$(grep INVALID "${vlogf}" |wc -l|cut -d' ' -f1);
	if [[ "$invalid_linecount" == "0" ]] ; then
		echo "GREAT NEWS: All files in the C2M2 package are VALID";
		# Do not copy back yet
		## cp "${tdir}"/biosample.tsv "${sdir}/."
		## cp "${tdir}"/*biofluid* "${sdir}/."
	else
		echo "BAD NEWS: $invalid_linecount lines have the keyword INVALID";
		echo "Source: $sdir";
		echo "Target: $tdir";
	fi
else
    echo "Error: Log file ${vlogf} does not exist";
fi


echo "              --------------------- Script $0: Completed ---------------------"
#------------------------------------------------------------------------------------
