
## Example URLs to test C2M2 search after any updates

### Main page: based on localhost:3000; locally, change 3000 to 3001, 3002, etc., as needed, when testing your changes

localhost:3000/data if testing from your local instance

Search: liver, filter: DCC/CF program: SPARC

localhost:3000/data/processed/search?q=liver&t=dcc%3AStimulating+Peripheral+Activity+to+Relieve+Conditions&p=1

Select a row:
localhost:3000/data/c2m2/record_info?q=liver&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023864|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:celiac%20ganglion|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:experimental%20measurement

localhost:3000/data/c2m2/record_info?q=liver&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023864|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:celiac%20ganglion|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:sequence

Filter: ERCC || HMP
localhost:3000/data/processed/search?q=liver&p=1&t=dcc%3AThe+Extracellular+Communication+Consortium+Data+Coordination+Center%7Cdcc%3AThe+Human+Microbiome+Project

Select a row:
localhost:3000/data/c2m2/record_info?q=liver&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-TPATE168zlfJ-ST|disease_name:liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:bile%20duct|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix


### Do not try this that often as this results in ~ 475,000 records. Search: lincs 2021 ; several filters applied and a row selected:
localhost:3000/data/c2m2/record_info?q=lincs+2021&t=dcc_name%3ALibrary+of+Integrated+Network-based+Cellular+Signatures%7Cproject_local_id%3ALINCS-2021%7Cdisease_name%3Abreast+carcinoma%7Cncbi_taxonomy_name%3AHomo+sapiens%7Canatomy_name%3Abreast%7Cgene_name%3AAK4%7Cprotein_name%3AUnspecified%7Ccompound_name%3AUnspecified%7Cdata_type_name%3AGene+expression+profile

Example of a record with files at biosample and collection levels:
localhost:3000/data/c2m2/record_info?q=liver&t=dcc_name%3AThe+Extracellular+Communication+Consortium+Data+Coordination+Center%7Cproject_local_id%3AEXR-TPATE168zlfJ-ST%7Cdisease_name%3Aliver+disease%7Cncbi_taxonomy_name%3AHomo+sapiens%7Canatomy_name%3Abile+duct%7Cgene_name%3AUnspecified%7Cprotein_name%3AUnspecified%7Ccompound_name%3AUnspecified%7Cdata_type_name%3AMatrix

Example of a record with more than 1000 files:
localhost:3000/data/c2m2/record_info?q=liver&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:liver%20cancer|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified


### Search: parkinson
localhost:3000/data/processed/search?q=parkinson

Select some records:
localhost:3000/data/c2m2/record_info?q=parkinson&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001536|disease_name:Parkinson%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data

localhost:3000/data/c2m2/record_info?q=parkinson&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:Parkinson%27s%20disease|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified

localhost:3000/data/c2m2/record_info?q=parkinson&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Parkinson%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:brain%20ventricle|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix

Apply fiter: disease Alzheimer's Disease
localhost:3000/data/processed/search?q=parkinson&r=50&C2M2MainSearchTbl_p=2&t=disease%3AAlzheimer%27s+disease&p=1

localhost:3000/data/c2m2/record_info?q=parkinson&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Alzheimer%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:cardiovascular%20system|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix

### Search: intestine homo sapiens female cancer
localhost:3000/data/processed/search?q=intestine+homo+sapiens+female+cancer

Select a record:
localhost:3000/data/c2m2/record_info?q=intestine%20homo%20sapiens%20female%20cancer&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:exRNA_Atlas|disease_name:colorectal%20cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:cardiovascular%20system|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified

### Search: intestine homo sapiens
localhost:3000/data/processed/search?q=intestine+homo+sapiens

Select a row for 4DN:
localhost:3000/data/c2m2/record_info?q=intestine%20homo%20sapiens&t=dcc_name:4D%20NUCLEOME%20DATA%20COORDINATION%20AND%20INTEGRATION%20CENTER|project_local_id:12a92962-8265-4fc0-b2f8-cf14f05db58b|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:colon|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified

Select some records:
localhost:3000/data/c2m2/record_info?q=intestine%20homo%20sapiens&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001102|disease_name:irritable%20bowel%20syndrome|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:feces|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data

localhost:3000/data/c2m2/record_info?q=intestine%20homo%20sapiens&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:S100G_HUMAN|compound_name:Unspecified|data_type_name:Protein%20name%20(UniProt)

localhost:3000/data/c2m2/record_info?q=intestine%20homo%20sapiens&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:CUBN_HUMAN|compound_name:Unspecified|data_type_name:Protein%20name%20(UniProt)

### Search: sterol
localhost:3000/data/processed/search?q=sterol

localhost:3000/data/c2m2/record_info?q=sterol&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:ERG24_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession

Apply filter: DCC: IDG
localhost:3000/data/processed/search?q=sterol&t=dcc%3AIlluminating+the+Druggable+Genome&p=1

localhost:3000/data/c2m2/record_info?q=sterol&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:Harmonizome|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:SC5D|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified

Go back: Apply filter: DCC: LINCS
localhost:3000/data/processed/search?q=sterol&p=1&t=dcc%3ALibrary+of+Integrated+Network-based+Cellular+Signatures

localhost:3000/data/c2m2/record_info?q=sterol&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS|disease_name:breast%20carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|gene_name:SOAT2|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified

Go back: Apply filter: DCC: MW
localhost:3000/data/processed/search?q=sterol&p=1&C2M2MainSearchTbl_p=15&t=dcc%3AUCSD+Metabolomics+Workbench

localhost:3000/data/c2m2/record_info?q=sterol&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000633|disease_name:fatty%20liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:liver|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data

localhost:3000/data/processed/search?q=sterol&p=1&C2M2MainSearchTbl_p=15&t=anatomy%3Ablood+serum%7Canatomy%3Aadipose+tissue

localhost:3000/data/c2m2/record_info?q=sterol&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:adipose%20tissue|gene_name:SCP2|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile

### Search: atorvastatin
localhost:3000/data/processed/search?q=atorvastatin

localhost:3000/data/c2m2/record_info?q=atorvastatin&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:Drugmonizome|disease_name:Unspecified|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Atorvastatin|data_type_name:Unspecified

localhost:3000/data/c2m2/record_info?q=atorvastatin&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS|disease_name:carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:kidney|gene_name:Unspecified|protein_name:Unspecified|compound_name:Atorvastatin|data_type_name:Unspecified

