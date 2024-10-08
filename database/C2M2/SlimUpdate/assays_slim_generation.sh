#!/bin/bash

# two input files needed
#1)assay_slim_nodes with two columns. One with OBI slim ids and other one with OBI slim labels
#2)assayid_label.rq which is needed to generate csv file from owl file with OBI term ids and labels 


cat assay_slim_nodes | while read assayid assaylabel ; do
     robot filter -I http://purl.obolibrary.org/obo/obi.owl --term "$assayid" --select "annotations self descendants" --signature true  --output "$assaylabel"_slim.owl
     robot query --input "$assaylabel"_slim.owl --query assayid_label.rq  "$assaylabel"_slim.csv
     sed -i -e 's///g' "$assaylabel"_slim.csv #removes ^M characters at the end of the line
     sed "s/$/,$assayid,$assaylabel/g" "$assaylabel"_slim.csv > test1.csv
     mv test1.csv "$assaylabel"_slim.csv
     rm "$assaylabel"_slim.csv-e
done

cat *_slim.csv  >merged_assay_slims.csv
sed -i '' '/Id,labels/d' merged_assay_slims.csv   #removes all lines with headers
echo OBI_id,OBI_label,slim_id,slim_label >header.csv # makes a header file
cat header.csv merged_assay_slims.csv >merged_assay_slims_final.csv #concatenating headers to merged_disease slim file
sed -i '' 's/OBI_/OBI:/g' merged_assay_slims_final.csv
sed -i '' 's/CHMO_/CHMO:/g' merged_assay_slims_final.csv
sed -i '' 's/OBI:id/OBI_id/g' merged_assay_slims_final.csv
sed -i '' 's/OBI:label/OBI_label/g' merged_assay_slims_final.csv


#hardcoded 4DN terms that are not included in OBI release yet.
echo OBI:0003297,tyramide signal amplification sequencing assay,OBI:0600047,sequencing assay >>merged_assay_slims_final.csv
echo OBI:0003298,DNA adenine methyltransferase identification assay,OBI:0000070,assay >>merged_assay_slims_final.csv
echo OBI:0003299,DamID-seq,OBI:0000070,assay >>merged_assay_slims_final.csv
echo OBI:0003300,nucleolus-associated domain sequencing assay,OBI:0600047,sequencing assay >>merged_assay_slims_final.csv
echo OBI:0003301,DNase Hi-C assay,OBI:0002440,Hi-C assay >>merged_assay_slims_final.csv
echo OBI:0003302,micro-C assay,OBI:0002440,Hi-C assay >>merged_assay_slims_final.csv
echo OBI:0003303,single cell combinatorial indexing Hi-C assay,OBI:0002440,Hi-C assay >>merged_assay_slims_final.csv
echo OBI:0003304,single nucleus Hi-C assay,OBI:0002440,Hi-C assay >>merged_assay_slims_final.csv
echo OBI:0003305,single cell Hi-C assay,OBI:0002440,Hi-C assay >>merged_assay_slims_final.csv
echo OBI:0003306,bulk Hi-C assay,OBI:0002440,Hi-C assay >>merged_assay_slims_final.csv
echo OBI:0003307,multi-contact Hi-C assay,OBI:0002440,Hi-C assay >>merged_assay_slims_final.csv
echo OBI:0003309,transposase-mediated analysis of chromatin looping assay,OBI:0600047,sequencing assay >>merged_assay_slims_final.csv
echo OBI:0003310,split-pool recognition of interactions and tag extension assay,OBI:0600047,sequencing assay >>merged_assay_slims_final.csv
echo OBI:0003311,DNA split-pool recognition of interactions and tag extension assay,OBI:0600047,sequencing assay >>merged_assay_slims_final.csv
echo OBI:0003312,RNA-DNA split-pool recognition of interactions and tag extension assay,OBI:0600047,sequencing assay >>merged_assay_slims_final.csv
echo OBI:0003313,genome architecture mapping assay,OBI:0600047,sequencing assay >>merged_assay_slims_final.csv
echo OBI:0003314,mapping RNA-genome interactions assay,OBI:0000070,assay >>merged_assay_slims_final.csv
echo OBI:0003384,synaptosome preparation process,OBI:0000070,assay >>merged_assay_slims_final.csv   #*******REMOVE THIS IN THE NEXT VERSION******
echo OBI:0200198,tandem mass spectrometry,OBI:0000470,mass spectrometry assay >>merged_assay_slims_final.csv  #*******NOT IN ASSAY NODE, ADDED MANUALLY. ADD IN NEXT VERSION IF AN ASSAY TERM IS NOT MADE FOR THIS*****
echo OBI:0001986,immunohistochemistry,OBI:0600020,histological assay  >>merged_assay_slims_final.csv #*********THIS TERM IS MANUALLY MAPPED TO HISTOLOGCAL ASSAY< ALTHOUGH IT BY DEFAULT MAPS TO ASSAY< MAKE SURE TO ADD THIS MAPPING IN NEXT VERSION***
echo OBI:0000454,extracellular electrophysiology recording assay,OBI:0002176,electrophysiology assay >>merged_assay_slims_final.csv  #*********THIS TERM IS MANUALLY MAPPED TO electrophysiology assay ALTHOUGH IT BY DEFAULT MAPS TO ASSAY< MAKE SURE TO ADD THIS MAPPING IN NEXT VERSION***
echo OBI:0003087,autofluorescence assay,OBI:0003087,autofluorescence assay >>merged_assay_slims_final.csv #*********Do not add this term next version as it is added in slims list***
#ADD "OBI:0003412 linked reads sequencing" IN TEH NEXT VERSION MANUALLY"

# extracting full list of OBI terms under assay node
robot filter -I http://purl.obolibrary.org/obo/obi.owl --term OBI:0000070 --select "annotations self descendants" --signature true  --output assay.owl
robot query --input assay.owl --query assayid_label.rq  assay_draft.csv
sed -i -e 's///g' assay_draft.csv #(to remove ^M characters)
sed -i '' '/Id,labels/d' assay_draft.csv   #removes all lines with headers
echo OBI_id,OBI_label >header2.csv # makes a header file
cat header2.csv assay_draft.csv >assay.csv #concatenating headers to merged_disease slim file
sed -i '' 's/OBI_/OBI:/g' assay.csv
sed -i '' 's/CHMO_/CHMO:/g'  assay.csv
sed -i '' 's/OBI:id/OBI_id/g' assay.csv
sed -i '' 's/OBI:label/OBI_label/g' assay.csv

#matching terms mapped to slims from merged_assay_slims_final.csv file in assay.csv
grep -vwf <(cut -d, -f1 merged_assay_slims_final.csv) assay.csv >unmapped_terms # this will match all the terms in column 1 of merged_assay_slims_final.csv and assay.csv, 
                                                                                   # then output lines from assay.csv that do not have matching terms in column 1 from merged_assay_slims_final.csv
sed -i '' 's/$/,OBI:0000070,assay/g' unmapped_terms  # appending assay id and label to all those unmatched terms from previous command
cat merged_assay_slims_final.csv  unmapped_terms >merged_assay_slims_unmapped_final.csv
rm assay_draft.csv-e











































