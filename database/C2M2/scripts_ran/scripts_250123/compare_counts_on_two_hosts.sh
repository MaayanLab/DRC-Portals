#!/bin/bash
#call syntax:
# ./compare_counts_on_two_hosts.sh DB1_HOST DB1_PORT DB1_USER DB1_NAME DB1_SCHEMA DB2_HOST DB2_PORT DB2_USER DB2_NAME DB2_SCHEMA 

if [[ $# -lt 11 ]]; then
        echo -e "Usage: $0 DB1_HOST DB1_PORT DB1_USER DB1_NAME DB1_SCHEMA DB2_HOST DB2_PORT DB2_USER DB2_NAME DB2_SCHEMA LOGDIR";
        exit 1;
fi

# Configuration for the first database
#DB1_HOST=$1#"host1"
DB1_HOST=$1
DB1_PORT=$2
DB1_USER=$3
DB1_NAME=$4
DB1_SCHEMA=$5

# Configuration for the second database
DB2_HOST=$6
DB2_PORT=$7
DB2_USER=$8
DB2_NAME=$9
DB2_SCHEMA=${10}

LOGDIR=${11}

# Temporary files to store the counts
COUNTS_FILE1="${LOGDIR}/counts_pg_dump_${DB1_HOST}_${DB1_NAME}_${DB1_SCHEMA}.txt"
COUNTS_FILE2="${LOGDIR}/counts_pg_dump_${DB2_HOST}_${DB2_NAME}_${DB2_SCHEMA}.txt"

# Function to get the table counts for a given database and schema
get_table_counts() {
  local HOST=$1
  local PORT=$2
  local USER=$3
  local DBNAME=$4
  local SCHEMA=$5
  local OUTPUT_FILE=$6

  # In our DB, schema and tables names are interpretted in a case insensitive manner, but since "" is used around them,
  # make SCHEMA lower case.
  lcSCHEMA=$(echo $SCHEMA| awk '{print tolower($0)}'); 
  
  # Get a list of all tables in the specified schema
  tables=$(psql -U $USER -h $HOST -p $PORT -d $DBNAME -Atc "
    SELECT table_name
    FROM information_schema.tables
    WHERE lower(table_schema) = '$lcSCHEMA' AND table_type = 'BASE TABLE' ORDER BY table_name;")

  # Loop over each table and print the count of records
  #echo "Record count for all tables in schema '$SCHEMA_NAME':"
  
  #echo "List of tables:";
  #echo -e "$tables";

  # Create/empty the output file
  > $OUTPUT_FILE
  for table in $tables; do
    echo -e "Going to count rows in the table ${table}";
    count=$(psql -U $USER -h $HOST -p $PORT -d $DBNAME -Atc "
      SELECT COUNT(*) FROM \"$lcSCHEMA\".\"$table\";")
    echo -e "$table\t$count" >> $OUTPUT_FILE;
  done
}

# Get the counts for the first database
get_table_counts $DB1_HOST $DB1_PORT $DB1_USER $DB1_NAME $DB1_SCHEMA $COUNTS_FILE1

# Get the counts for the second database
get_table_counts $DB2_HOST $DB2_PORT $DB2_USER $DB2_NAME $DB2_SCHEMA $COUNTS_FILE2

# Compare the counts
echo -e "----------- Comparing record counts between $DB1_NAME.$DB1_SCHEMA and $DB2_NAME.$DB2_SCHEMA:" 

echo -e "       Counts from file $COUNTS_FILE1:" 
cat $COUNTS_FILE1

echo -e "       Counts from file $COUNTS_FILE2:" 
cat $COUNTS_FILE2

# Read the counts from both files and compare
join -t$'\t' -1 1 -2 1 <(sort $COUNTS_FILE1) <(sort $COUNTS_FILE2) | \
awk -v DB1_HOST="$DB1_HOST" -v DB2_HOST="$DB2_HOST" -v DB1_NAME="$DB1_NAME" -v DB2_NAME="$DB2_NAME" \
-v DB1_SCHEMA="$DB1_SCHEMA" -v DB2_SCHEMA="$DB2_SCHEMA" -F '\t' '
  {
    table = $1;
    count1 = $2;
    count2 = $3;
    if (count1 != count2) {
      print "Table " table ": Count differs. " DB1_HOST ": " count1 ", " DB2_HOST ": " count2;      
    } else {
      print "Table " table ": Count match. " DB1_HOST ": " count1 ", " DB2_HOST ": " count2;      
    }
  }
'

# Do not delete these two lines in case we need to print other variables too
#print "Table " table ": Count differs. " DB1_HOST ":" DB1_NAME "." DB1_SCHEMA ": " count1 ", " DB2_HOST ":" DB2_NAME "." DB2_SCHEMA ": " count2;
#print "Table " table ": Count match. " DB1_HOST ":" DB1_NAME "." DB1_SCHEMA ": " count1 ", " DB2_HOST ":" DB2_NAME "." DB2_SCHEMA ": " count2;

# Cleanup
rm $COUNTS_FILE1 $COUNTS_FILE2

#SELECT table_name, (SELECT COUNT(*) FROM metabolomics." || table_name || \") AS count FROM information_schema.tables WHERE lower(table_schema) = lower('metabolomics') AND table_type = 'BASE TABLE';
# Example snipets of code
#count=$(psql -U drc -h localhost -p 5433 -d drc -Atc "SELECT COUNT(*) FROM \"metabolomics\".\"project\";"); echo $count;
