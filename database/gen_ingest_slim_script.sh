#!/bin/bash
#
# Call syntax: be in the correct folder: database
# ./gen_ingest_slim_script.sh ingest_slim.sql

if [[ $# -lt 1 ]]; then
	echo -e "Usage: $0 ingest_slim.sql";
	exit 1;
fi

opf=$1

schema_name=slim
subdir=slim
slim_file_name_pat=_slim
curdir=$PWD

recreate_schema=1 # 0 or 1

line1="Script to ingest C2M2 relevant slim and related table: being in the directory ${curdir}, generated using the command $0 $1"
line2="Generated sql script ${opf} and made it executable for owner and group. The resulting sql script can be run as (upon starting psql shell, or equivalent command):"
line3="\\i ${opf}"
line4="OR, directly specify the sql file name in psql command:"
line5="psql -h localhost -U drc -d drc -a -f ${opf}"

all_lines="${line1}\n${line2}\n${line3}\n${line4}\n${line5}\n"
echo -e "/*\n${all_lines}*/\n" > $opf;

# /* \COPY biosample FROM '/home/mano/C2M2/latest/biosample_fromall.tsv' DELIMITER E'\t' CSV HEADER; */

#fnames_woext=$(basename -s .tsv -a `ls slim/*.tsv`)
fnames_woext=$(basename -s .tsv -a `ls ${subdir}/*.tsv`)

#create schema
if [[ "${recreate_schema}" == "1" ]]; then
	sqlcode_drop_schema="DROP SCHEMA IF EXISTS ${schema_name} CASCADE;"
else
	sqlcode_drop_schema="/* Do not drop schema if it exists. Code on this line is for reference only: DROP SCHEMA IF EXISTS ${schema_name} CASCADE; */"
fi

sqlcode_create_schema="CREATE SCHEMA IF NOT EXISTS ${schema_name};"
echo -e "${sqlcode_drop_schema}\n${sqlcode_create_schema}\n\n" >> $opf;

declare -A col_attr;
col_attr[id]="VARCHAR NOT NULL";
col_attr[name]="VARCHAR NOT NULL";
col_attr[description]="VARCHAR DEFAULT NULL";
col_attr[synonyms]="VARCHAR DEFAULT NULL";
col_attr[original_term_id]="VARCHAR NOT NULL";
col_attr[slim_term_id]="VARCHAR NOT NULL";

for fname_woext in ${fnames_woext}; do
	table_name=${fname_woext}
	sqlcode_drop_table="DROP TABLE IF EXISTS ${schema_name}.${table_name} RESTRICT;";
	# split the header row by tab, then construct sql code to define the table
	# Based on: https://byby.dev/bash-split-string & https://stackoverflow.com/questions/6654849/how-to-split-a-string-in-bash-delimited-by-tab
	IFS=$'\t'; read -ra cols <<< "$(head -n 1 ${subdir}/${fname_woext}.tsv)"
	# If the file name has _slim in it, then none of the two columns can be a primary key since an ontology term can be part of more than one slim.
	# So, add a new column pk_id and make it primary key;
	if grep -q "${slim_file_name_pat}" <<< "${fname_woext}"; then
		#xstr=; for col in ${cols[@]}; do xstr="${xstr}${col} VARCHAR NOT NULL, " ; done; xstr="${xstr}pk_id SERIAL PRIMARY KEY"; #echo $xstr
		#xstr="pk_id SERIAL PRIMARY KEY"; for col in ${cols[@]}; do xstr="${xstr}, ${col} ${col_attr[${col}]}"; done; xstr="${xstr}pk_id SERIAL PRIMARY KEY"; #echo $xstr
		#xstr=; for col in ${cols[@]}; do xstr="${xstr}, ${col} ${col_attr[${col}]}"; done; xstr="${xstr}pk_id SERIAL PRIMARY KEY"; #echo $xstr
		#xarr=(); for col in ${cols[@]}; do xarr+="${col} ${col_attr[${col}]}"; done;
		#sepstr=", "; xstr=$(IFS="$sepstr"; echo "${xarr[*]}"); sepstr=", "; xstr=$(IFS=", "; echo "${xarr[*]}");
		xstr=; xlen=${#cols[@]}; for ((i = 0; i < $xlen - 1; i++)); do xstr="${xstr}${cols[i]} ${col_attr[${cols[i]}]}, "; done; # applied on all but the last element
		xstr="${xstr}${cols[-1]} ${col_attr[${cols[-1]}]}"; # no ", " for the last element of the array
	
		# Add an additional column to serve as primary key
		pkstr="ALTER TABLE ${schema_name}.${table_name} ADD COLUMN pk_id serial PRIMARY KEY;";
	else
		#xstr=; for col in ${cols[@]}; do xstr="${xstr}${col} VARCHAR NOT NULL, " ; done; xstr="${xstr}PRIMARY KEY(${cols[0]})"; #echo $xstr
		xstr=; for col in ${cols[@]}; do xstr="${xstr}${col} ${col_attr[${col}]}, " ; done; xstr="${xstr}PRIMARY KEY(${cols[0]})"; #echo $xstr
		pkstr=;
	fi

	sqlcode_create_table="CREATE TABLE ${schema_name}.${table_name}(${xstr});";
	# do not curdir, just use relative path, so that it can be run from anyone's account
	#sqlcode_copy="\\COPY ${schema_name}.${table_name} FROM '${curdir}/CV/${fname_woext}.tsv' DELIMITER E'\\\\t' CSV HEADER;";
	sqlcode_copy="\\COPY ${schema_name}.${table_name} FROM '${subdir}/${fname_woext}.tsv' DELIMITER E'\\\\t' CSV HEADER;";
	sqlcode_pkstr=${pkstr};
	echo -e "${sqlcode_drop_table}\n${sqlcode_create_table}\n${sqlcode_copy}\n${sqlcode_pkstr}\n" >> $opf;
done
chmod ug+x $opf;
echo -e "${all_lines}\n";

