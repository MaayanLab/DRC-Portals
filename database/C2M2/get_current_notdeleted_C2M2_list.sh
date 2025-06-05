# To do a quick check if each DCC has only one valid C2M2 package listed in the file ingest/DccAssets.tsv
# Change the recent dates or no dates

echo -e "----------- $0 script started: to find list of DCCs with current and valid C2M2; current date and time: $(date)";

if [[ $# -lt 1 ]]; then
        echo -e "Usage: $0 <DccAssets.tsv>";
        exit 1;
fi

f=$1


ingestf=ingest
f1=${ingestf}/DccC2M2.tsv
f2=${ingestf}/validDccC2M2.tsv
head -n 1 $f|cut -d$'\t' -f1,3,8,9 > ${f1} && cat $f | grep C2M2 | egrep -e "202[0-5]-[0-9][0-9]" | cut -d$'\t' -f1,3,8,9|sort >> ${f1}
awk -F'\t' '$2 == "True" && $3 == "False"' ${f1} > ${f2}
# To see which DCCs might have more than one current:
echo "List of DCCs with valid C2M2 (with respect to current and deleted):"
cat ${f2} |cut -d$'\t' -f1|cut -d'/' -f4
echo "";
echo -e "If there are DCCs with their names listed more than one, then check the file \n${f2}\n to see which ones for which submission they are marked current=True and deleted=False \nand in the original input file \n${f}\n set current to False and/or deleted to True for all but one row per DCC.";


