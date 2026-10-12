#!/bin/bash
#
# Call syntax: be in the correct folder: C2M2
# ./CountQuery_aggregate.sh log/CountQuery_Crosscheck_mismatch.log log/CountQuery_Crosscheck_mismatch_agg.log;
inf="$1"
opf="$2"

curdir=$PWD

#  In a txt file, I have lines like:
#     18 |  20538 | bridge2ai.biosample_from_subject: Number of records do not match
#  20520 |  20538 | bridge2ai.biosample_from_subject: Number of records do not match
# 860136 | 860207 | lincs.biosample_substance: Number of records do not match
# Think of it as 3 columns separated by | ; with that, sort by 3rd column and if 
# the value if the 3rd column is same in two rows and value in 2nd column is same 
# in two rows, then sum the values in the first column for such rows ad present as aggregate.
#
# Further task: if after aggregate, values in col1 and col2 are the same, then 
# replace "do not match" with "match" at the end of column 3.

awk -F'|' '{
    key=$3 FS $2; 
    sum[key] += $1; 
    col2[key] = $2; 
    col3[key] = $3
} 
END {
    for (k in sum) {
        s1 = sum[k];
        c2 = col2[k] + 0; # ensure numeric comparison
        c3 = col3[k];
        
        # Replace text if col1 (sum) matches col2
        if (s1 == c2) {
            sub("do not match", "match", c3);
        }
        
        printf "%7d | %7d | %s\n", s1, c2, c3
    }
}' "${inf}" | sort -t'|' -k3 > "${opf}"

