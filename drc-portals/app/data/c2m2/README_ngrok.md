
## Example URLs to test C2M2 search after any updates

### Main page

https://ucsd-sslab.ngrok.app/data

or

localhost:3000/data if testing from your local instance

Search: liver, filter: DCC/CF program: SPARC

https://ucsd-sslab.ngrok.app/data/search/liver/c2m2?p=1&t=dcc%3AStimulating+Peripheral+Activity+to+Relieve+Conditions

Select a row:

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=liver&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023864|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:celiac%20ganglion|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:experimental%20measurement|assay_type_name:electrophysiology%20assay

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=liver&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023864|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:celiac%20ganglion|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:sequence|assay_type_name:RNA-seq%20assay

Filter: ERCC || HMP
https://ucsd-sslab.ngrok.app/data/search/liver/c2m2?p=1&t=dcc%3AThe+Extracellular+Communication+Consortium+Data+Coordination+Center%7Cdcc%3AHuBMAP

Select a row:
https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=liver&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-TPATE168zlfJ-ST|disease_name:liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:bile%20duct|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

# Multiple values (OR) for some filters
Search liver:
https://ucsd-sslab.ngrok.app/data/search/liver/c2m2?p=1

Apply DCC filter (after selecting one or more values for a filter, click outside the filter area):
https://ucsd-sslab.ngrok.app/data/search/liver/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench

Apply Species filter (select two values: Homo sapiens and Mus musculus):
https://ucsd-sslab.ngrok.app/data/search/liver/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench%7Cncbi_taxonomy%3AHomo+sapiens%7Cncbi_taxonomy%3AMus+musculus

Apply Anatomy filter (blood and Adipose tissue):
https://ucsd-sslab.ngrok.app/data/search/liver/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench%7Cncbi_taxonomy%3AHomo+sapiens%7Cncbi_taxonomy%3AMus+musculus%7Canatomy%3Ablood%7Canatomy%3Aadipose+tissue

### Do not try this that often as this results in ~ 475,000 records. Search: lincs 2021 ; several filters applied and a row selected:
https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=lincs%202021&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:breast%20carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|gene_name:AK4|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay

Example of a record with files at biosample and collection levels:
https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=liver&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-TPATE168zlfJ-ST|disease_name:liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:bile%20duct|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

Example of a record with more than 1000 files:
https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=liver&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:liver%20cancer|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified

### Search: parkinson
https://ucsd-sslab.ngrok.app/data/search/parkinson/c2m2

Select some records:
https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=parkinson&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001964|disease_name:Parkinson%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:blood%20serum|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=parkinson&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:secondary%20Parkinson%20disease|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=parkinson&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Parkinson%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:brain%20ventricle|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

Apply fiter: disease Alzheimer's Disease
https://ucsd-sslab.ngrok.app/data/search/parkinson/c2m2?p=1&t=disease%3AAlzheimer%27s+disease

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=parkinson&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Alzheimer%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:cardiovascular%20system|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

### Search: intestine homo sapiens female cancer
https://ucsd-sslab.ngrok.app/data/search/intestine%20homo%20sapiens%20female%20cancer/c2m2

Select a record:
https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=intestine%20homo%20sapiens%20female%20cancer&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:exRNA_Atlas|disease_name:colorectal%20cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:cardiovascular%20system|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified

### Search: intestine homo sapiens
https://ucsd-sslab.ngrok.app/data/search/intestine%20homo%20sapiens/c2m2

Select a row for 4DN:
https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:4D%20NUCLEOME%20DATA%20COORDINATION%20AND%20INTEGRATION%20CENTER|project_local_id:12a92962-8265-4fc0-b2f8-cf14f05db58b|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:colon|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:imaging%20assay

Select some records:
https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001102|disease_name:irritable%20bowel%20syndrome|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:feces|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:S100G_HUMAN|compound_name:Unspecified|data_type_name:Protein%20name%20(UniProt)|assay_type_name:Unspecified

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:CUBN_HUMAN|compound_name:Unspecified|data_type_name:Protein%20name%20(UniProt)|assay_type_name:Unspecified

### Search: sterol
https://ucsd-sslab.ngrok.app/data/search/sterol/c2m2

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=sterol&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:ERG24_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified

Apply filter: DCC: IDG
https://ucsd-sslab.ngrok.app/data/search/sterol/c2m2?p=1&t=dcc%3AIlluminating+the+Druggable+Genome

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=sterol&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:Harmonizome|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:SC5D|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified

Go back: Apply filter: DCC: LINCS
https://ucsd-sslab.ngrok.app/data/search/sterol/c2m2?p=1&t=dcc%3ALibrary+of+Integrated+Network-based+Cellular+Signatures

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=sterol&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS|disease_name:breast%20carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|gene_name:SOAT2|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified

Go back: Apply filter: DCC: MW
https://ucsd-sslab.ngrok.app/data/search/sterol/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=sterol&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000633|disease_name:fatty%20liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:liver|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:mass%20spectrometry%20assay

https://ucsd-sslab.ngrok.app/data/search/sterol/c2m2?p=1&t=anatomy%3Ablood+serum%7Canatomy%3Aadipose+tissue

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=sterol&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:adipose%20tissue|gene_name:SCP2|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified

### Search: atorvastatin
https://ucsd-sslab.ngrok.app/data/search/atorvastatin/c2m2?p=1

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=atorvastatin&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:Drugmonizome|disease_name:Unspecified|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Atorvastatin|data_type_name:Unspecified|assay_type_name:Unspecified

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=atorvastatin&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS|disease_name:carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:kidney|gene_name:Unspecified|protein_name:Unspecified|compound_name:Atorvastatin|data_type_name:Unspecified|assay_type_name:Unspecified

### Search: myeloid cell

https://ucsd-sslab.ngrok.app/data/search/myeloid%20cell/c2m2

#### Apply filters anatomy: blood
https://ucsd-sslab.ngrok.app/data/search/myeloid%20cell/c2m2?t=anatomy%3Ablood&p=1

#### Apply filter taxonomy Homo sapiens
https://ucsd-sslab.ngrok.app/data/search/myeloid%20cell/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens

#### then disease cancer
https://ucsd-sslab.ngrok.app/data/search/myeloid%20cell/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens%7Cdisease%3Acancer

#### Another set of filters:
https://ucsd-sslab.ngrok.app/data/search/myeloid%20cell/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens%7Cdisease%3Acancer%7Cdcc%3AThe+Gabriella+Miller+Kids+First+Pediatric+Research+Program

#### Record info page:
https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=myeloid%20cell&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_46RR9ZR6|disease_name:cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Alignment|assay_type_name:exome%20sequencing%20assay


### Search: COVID
https://ucsd-sslab.ngrok.app/data/search/covid/c2m2

#### Apply species and DCC flter
https://ucsd-sslab.ngrok.app/data/search/covid/c2m2?t=ncbi_taxonomy%3AHomo+sapiens%7Cdcc%3AThe+Gabriella+Miller+Kids+First+Pediatric+Research+Program&p=1

#### Record Info page:
https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=covid&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_FFVQ3T38|disease_name:COVID-19|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:data|assay_type_name:Unspecified

### Search: throat cancer
https://ucsd-sslab.ngrok.app/data/search/throat%20cancer/c2m2

### Filters and then Record Info  page:
https://ucsd-sslab.ngrok.app/data/search/throat%20cancer/c2m2?t=anatomy%3Asaliva&p=1

https://ucsd-sslab.ngrok.app/data/c2m2/search/record_info?q=throat%20cancer&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001492|disease_name:human%20immunodeficiency%20virus%20infectious%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:saliva|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

### Another example of multiple filters
Search blood then apply Species filter (two values, Homo sapiens or Mus Musculus):
https://ucsd-sslab.ngrok.app/data/search/blood/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens|ncbi_taxonomy%3AMus+musculus

Then apply DCC filter (select several values):
https://ucsd-sslab.ngrok.app/data/search/blood/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens%7Cncbi_taxonomy%3AMus+musculus%7Cdcc%3A4D+NUCLEOME+DATA+COORDINATION+AND+INTEGRATION+CENTER%7Cdcc%3ALibrary+of+Integrated+Network-based+Cellular+Signatures%7Cdcc%3AIlluminating+the+Druggable+Genome%7Cdcc%3AUCSD+Metabolomics+Workbench

Then apply Anatomy filter (Blood ir Brain):
https://ucsd-sslab.ngrok.app/data/search/blood/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens%7Cncbi_taxonomy%3AMus+musculus%7Cdcc%3A4D+NUCLEOME+DATA+COORDINATION+AND+INTEGRATION+CENTER%7Cdcc%3ALibrary+of+Integrated+Network-based+Cellular+Signatures%7Cdcc%3AIlluminating+the+Druggable+Genome%7Cdcc%3AUCSD+Metabolomics+Workbench%7Canatomy%3Ablood%7Canatomy%3Abrain