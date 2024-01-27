#!/bin/bash
#
# Call syntax: be in the correct folder: database
# ./gen_ingest_script.sh ingest_CV.sql

opf=$1

schema_name=c2m2
curdir=$PWD

echo -e "/* Script to ingest C2M2 Controlled Vocabularies: being in the directory ${curdir}, generated using the command $0 $1 */\n" > $opf;

# /* \COPY biosample FROM '/home/mano/C2M2/latest/biosample_fromall.tsv' DELIMITER E'\t' CSV HEADER; */

fnames_woext=$(basename -s .tsv -a `ls CV/*.tsv`)

for fname_woext in ${fnames_woext}; do
	table_name=${fname_woext}
	sqlcode_drop_table="DROP TABLE IF EXISTS ${schema_name}.${table_name} RESTRICT;";
	sqlcode_create_table="CREATE TABLE ${schema_name}.${table_name}(id varchar NOT NULL, name varchar NOT NULL, description varchar NOT NULL, PRIMARY KEY(id));";
	# do not curdir, just use relative path, so that it can be run from anyone's account
	#sqlcode_copy="\\COPY ${schema_name}.${table_name} FROM '${curdir}/CV/${fname_woext}.tsv' DELIMITER E'\\\\t' CSV HEADER;";
	sqlcode_copy="\\COPY ${schema_name}.${table_name} FROM 'CV/${fname_woext}.tsv' DELIMITER E'\\\\t' CSV HEADER;";
	echo -e "${sqlcode_drop_table}\n${sqlcode_create_table}\n${sqlcode_copy}\n" >> $opf;
done
chmod ug+x $opf;
echo "Generated sql script ${opf} and made it executable for owner and group. The resulting sql script can be run as (upon starting psql shell, or equivalent command):";
echo -e "\\i ${opf}\n";

