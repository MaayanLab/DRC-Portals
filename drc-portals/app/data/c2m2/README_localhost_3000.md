
## Example URLs to test C2M2 search after any updates

### Main page: based on localhost:3000; locally, change 3000 to 3001, 3002, etc., as needed, when testing your changes

localhost:3000/data if testing from your local instance

Search: liver, filter: DCC/CF program: SPARC

http://localhost:3001/data/search/liver/c2m2?p=1&t=dcc%3AStimulating+Peripheral+Activity+to+Relieve+Conditions

Select a row:

http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023864|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:celiac%20ganglion|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:experimental%20measurement|assay_type_name:electrophysiology%20assay

http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023864|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:celiac%20ganglion|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:sequence|assay_type_name:RNA-seq%20assay

Filter: ERCC || HMP
http://localhost:3000/data/search/liver/c2m2?p=1&t=dcc%3AThe+Extracellular+Communication+Consortium+Data+Coordination+Center%7Cdcc%3AHuBMAP

Select a row:
http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-TPATE168zlfJ-ST|disease_name:liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:bile%20duct|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay


# Multiple values (OR) for some filters
Search liver:
http://localhost:3000/data/search/liver/c2m2?p=1

Apply DCC filter (after selecting one or more values for a filter, click outside the filter area):
http://localhost:3000/data/search/liver/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench

Apply Species filter (select two values: Homo sapiens and Mus musculus):
http://localhost:3000/data/search/liver/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench%7Cncbi_taxonomy%3AHomo+sapiens%7Cncbi_taxonomy%3AMus+musculus

Apply Anatomy filter (blood and Adipose tissue):
http://localhost:3000/data/search/liver/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench%7Cncbi_taxonomy%3AHomo+sapiens%7Cncbi_taxonomy%3AMus+musculus%7Canatomy%3Ablood%7Canatomy%3Aadipose+tissue

### Do not try this that often as this results in ~ 475,000 records. Search: lincs 2021 ; several filters applied and a row selected:
http://localhost:3000/data/c2m2/search/record_info?q=lincs%202021&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:breast%20carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|gene_name:AK4|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay

Example of a record with files at biosample and collection levels:
http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-TPATE168zlfJ-ST|disease_name:liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:bile%20duct|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

Example of a record with more than 1000 files:
http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:liver%20cancer|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified

### Search: parkinson
http://localhost:3000/data/search/parkinson/c2m2

Select some records:
http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001964|disease_name:Parkinson%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|biofluid_name:blood%20serum|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:secondary%20Parkinson%20disease|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified

http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Parkinson%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:brain%20ventricle|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

Apply fiter: disease Alzheimer's Disease
http://localhost:3000/data/search/parkinson/c2m2?p=1&t=disease%3AAlzheimer%27s+disease

http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Alzheimer%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:cardiovascular%20system|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

### Search: intestine homo sapiens female cancer
http://localhost:3000/data/search/intestine%20homo%20sapiens%20female%20cancer/c2m2

Select a record:

http://localhost:3000/data/c2m2/search/record_info?q=intestine%20homo%20sapiens%20female%20cancer&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-DGALA1GUTPLASM-ST|disease_name:colorectal%20cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:cardiovascular%20system|biofluid_name:seminal%20fluid|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

### Search: intestine homo sapiens
http://localhost:3000/data/search/intestine%20homo%20sapiens/c2m2

Select a row for 4DN:
http://localhost:3000/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:4D%20NUCLEOME%20DATA%20COORDINATION%20AND%20INTEGRATION%20CENTER|project_local_id:12a92962-8265-4fc0-b2f8-cf14f05db58b|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:colon|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:imaging%20assay

Select some records:
http://localhost:3000/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001102|disease_name:irritable%20bowel%20syndrome|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:feces|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

http://localhost:3000/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:S100G_HUMAN|compound_name:Unspecified|data_type_name:Protein%20name%20(UniProt)|assay_type_name:Unspecified

http://localhost:3000/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:CUBN_HUMAN|compound_name:Unspecified|data_type_name:Protein%20name%20(UniProt)|assay_type_name:Unspecified

### Search: sterol
http://localhost:3000/data/search/sterol/c2m2

http://localhost:3000/data/c2m2/search/record_info?q=sterol&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:ERG24_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified

Apply filter: DCC: IDG
http://localhost:3000/data/search/sterol/c2m2?p=1&t=dcc%3AIlluminating+the+Druggable+Genome

http://localhost:3000/data/c2m2/search/record_info?q=sterol&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:Harmonizome|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:SC5D|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified

Go back: Apply filter: DCC: LINCS
http://localhost:3000/data/search/sterol/c2m2?p=1&t=dcc%3ALibrary+of+Integrated+Network-based+Cellular+Signatures

http://localhost:3000/data/c2m2/search/record_info?q=sterol&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:breast%20carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|biofluid_name:Unspecified|gene_name:SCP2|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay

Go back: Apply filter: DCC: MW
http://localhost:3000/data/search/sterol/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench

http://localhost:3000/data/c2m2/search/record_info?q=sterol&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000633|disease_name:fatty%20liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:liver|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:mass%20spectrometry%20assay

OR

http://localhost:3000/data/c2m2/search/record_info?q=PR000633&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000633|disease_name:steatotic%20liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:liver|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:mass%20spectrometry%20assay

http://localhost:3000/data/search/sterol/c2m2?p=1&t=anatomy%3Ablood+serum%7Canatomy%3Aadipose+tissue

http://localhost:3000/data/c2m2/search/record_info?q=sterol&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:blood%20serum|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:LCAT_HUMAN|compound_name:CID%2091845155|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified

### Search: atorvastatin
http://localhost:3000/data/search/atorvastatin/c2m2?p=1

http://localhost:3000/data/c2m2/search/record_info?q=atorvastatin&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:Drugmonizome|disease_name:Unspecified|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Atorvastatin|data_type_name:Unspecified|assay_type_name:Unspecified

http://localhost:3000/data/c2m2/search/record_info?q=atorvastatin&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:kidney|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Atorvastatin|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay

### Search: myeloid cell

http://localhost:3000/data/search/myeloid%20cell/c2m2

#### Apply filters anatomy: blood
http://localhost:3000/data/search/myeloid%20cell/c2m2?t=anatomy%3Ablood&p=1
OR
http://localhost:3000/data/search/myeloid%20cell/c2m2?t=biofluid%3Ablood&p=1

#### Apply filter taxonomy Homo sapiens
http://localhost:3000/data/search/myeloid%20cell/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens

#### then disease cancer
http://localhost:3000/data/search/myeloid%20cell/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens%7Cdisease%3Acancer

#### Another set of filters:
http://localhost:3000/data/search/myeloid%20cell/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens%7Cdisease%3Acancer%7Cdcc%3AThe+Gabriella+Miller+Kids+First+Pediatric+Research+Program

#### Record info page:
http://localhost:3000/data/c2m2/search/record_info?q=myeloid%20cell&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_46RR9ZR6|disease_name:cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Alignment|assay_type_name:exome%20sequencing%20assay


### Search: COVID
http://localhost:3000/data/search/covid/c2m2

#### Apply species and DCC flter
http://localhost:3000/data/search/covid/c2m2?t=ncbi_taxonomy%3AHomo+sapiens%7Cdcc%3AThe+Gabriella+Miller+Kids+First+Pediatric+Research+Program&p=1

#### Record Info page:
http://localhost:3000/data/c2m2/search/record_info?q=covid&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_FFVQ3T38|disease_name:COVID-19|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:data|assay_type_name:Unspecified

### Search: throat cancer
http://localhost:3000/data/search/throat%20cancer/c2m2

#### Filters and then Record Info  page:
http://localhost:3000/data/search/throat%20cancer/c2m2?t=anatomy%3Asaliva&p=1
or
http://localhost:3000/data/search/throat%20cancer/c2m2?t=biofluid%3Asaliva&p=1


http://localhost:3000/data/c2m2/search/record_info?q=throat%20cancer&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001492|disease_name:human%20immunodeficiency%20virus%20infectious%20disease|ncbi_taxonomy_name:Homo%20sapiens|biofluid_name:saliva|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

### Another example of multiple filters
Search blood then apply Species filter (two values, Homo sapiens or Mus Musculus):
http://localhost:3000/data/search/blood/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens|ncbi_taxonomy%3AMus+musculus

Then apply DCC filter (select several values):
http://localhost:3000/data/search/blood/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens%7Cncbi_taxonomy%3AMus+musculus%7Cdcc%3A4D+NUCLEOME+DATA+COORDINATION+AND+INTEGRATION+CENTER%7Cdcc%3ALibrary+of+Integrated+Network-based+Cellular+Signatures%7Cdcc%3AIlluminating+the+Druggable+Genome%7Cdcc%3AUCSD+Metabolomics+Workbench

Then apply Anatomy filter (Blood ir Brain):
http://localhost:3000/data/search/blood/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens%7Cncbi_taxonomy%3AMus+musculus%7Cdcc%3A4D+NUCLEOME+DATA+COORDINATION+AND+INTEGRATION+CENTER%7Cdcc%3ALibrary+of+Integrated+Network-based+Cellular+Signatures%7Cdcc%3AIlluminating+the+Druggable+Genome%7Cdcc%3AUCSD+Metabolomics+Workbench%7Canatomy%3Ablood%7Canatomy%3Abrain

### Search: hepatitis, apply filters
http://localhost:3000/data/search/hepatitis/c2m2?t=dcc%3AIlluminating+the+Druggable+Genome%7Cdcc%3AUCSD+Metabolomics+Workbench%7Cdisease%3ABudd-Chiari+syndrome&p=1

http://localhost:3000/data/c2m2/search/record_info?q=hepatitis&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:Budd-Chiari%20syndrome|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified

### Search: malignant carcinoma
http://localhost:3000/data/search/malignant%20carcinoma/c2m2?t=disease%3Aadrenal+cortex+cancer%7Cdisease%3Anasopharynx+carcinoma&p=1

### Search: doxorubicin
http://localhost:3000/data/search/doxorubicin/c2m2?t=disease%3Aobesity%7Cdisease%3Abreast+carcinoma&p=1

http://localhost:3000/data/c2m2/search/record_info?q=doxorubicin&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001044|disease_name:obesity|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:liver|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

### Search: sleep apnea
http://localhost:3000/data/search/sleep%20apnea/c2m2?t=&p=1

http://localhost:3000/data/c2m2/search/record_info?q=sleep%20apnea&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000097|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|biofluid_name:blood%20serum|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

### Search: vitiligo
http://localhost:3000/data/search/vitiligo/c2m2?t=dcc%3AGlyGen&p=1

http://localhost:3000/data/c2m2/search/record_info?q=vitiligo&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:FBX11_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified

### Search: islet of langerhans
http://localhost:3000/data/search/islet%20of%20langerhans/c2m2?t=&p=1

http://localhost:3000/data/c2m2/search/record_info?q=islet%20of%20langerhans&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000662|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:islet%20of%20Langerhans|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:gas%20chromatography%20mass%20spectrometry%20assay

### Search: exercise obese
http://localhost:3000/data/search/exercise%20obese/c2m2

http://localhost:3000/data/search/exercise%20obese/c2m2?t=dcc%3AThe+Extracellular+Communication+Consortium+Data+Coordination+Center&p=1

http://localhost:3000/data/c2m2/search/record_info?q=exercise%20obese&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-SADAS1EXERs1-ST|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:anatomical%20system|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

### Search: tobacco
http://localhost:3000/data/search/tobacco/c2m2

http://localhost:3000/data/c2m2/search/record_info?q=tobacco&t=dcc_name%3AUCSD+Metabolomics+Workbench%7Cproject_local_id%3APR000808%7Cdisease_name%3AUnspecified%7Cncbi_taxonomy_name%3AHomo+sapiens%7Cbiofluid_name%3Ablood+plasma%7Cgene_name%3AUnspecified%7Cprotein_name%3AUnspecified%7Ccompound_name%3AUnspecified%7Cdata_type_name%3AMass+spectrometry+data%7Cassay_type_name%3Aliquid+chromatography+mass+spectrometry+assay

### Example of biofluid filter: Search tuberculosis
http://localhost:3000/data/search/tuberculosis/c2m2

#### biofluid filter: urine
http://localhost:3000/data/search/tuberculosis/c2m2?t=biofluid%3Aurine&p=1

#### A record from MW
http://localhost:3000/data/c2m2/search/record_info?q=tuberculosis&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000716|disease_name:tuberculosis|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:urine|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

### Examples of records with more than one file format

#### Search for 91b694c3-f4d7-4ddd-8278-16f94e15c1c5 (from 4DN) and select the first record
http://localhost:3000/data/search/91b694c3-f4d7-4ddd-8278-16f94e15c1c5/c2m2

http://localhost:3000/data/c2m2/search/record_info?q=91b694c3-f4d7-4ddd-8278-16f94e15c1c5&t=dcc_name:4D%20NUCLEOME%20DATA%20COORDINATION%20AND%20INTEGRATION%20CENTER|project_local_id:91b694c3-f4d7-4ddd-8278-16f94e15c1c5|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:blood%20cell|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Annotation%20track|assay_type_name:DamID-seq

#### Another example: search: PR000319 (from Metabolomics Workbench)

http://localhost:3000/data/search/PR000319/c2m2

Try first record:

http://localhost:3000/data/c2m2/search/record_info?q=PR000319&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000319|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:feces|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:NMR%20spectrum|assay_type_name:NMR%20spectroscopy%20assay

#### From SPARC: search: OT2OD023847

http://localhost:3000/data/search/OT2OD023847/c2m2

Try first or any other record

http://localhost:3000/data/c2m2/search/record_info?q=OT2OD023847&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023847|disease_name:Unspecified|ncbi_taxonomy_name:domestic%20pig|anatomy_name:stomach|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:experimental%20measurement|assay_type_name:electrophysiology%20assay

## Additional examples to test the filter "Apply" feature

### Search Melanoma and apply filter Species: Homo sapiens and furthe apply filter Skin of body

http://localhost:3000/data/search/melanoma/c2m2?t=ncbi_taxonomy%3AHomo+sapiens&p=1
http://localhost:3000/data/search/melanoma/c2m2?t=ncbi_taxonomy%3AHomo+sapiens%7Canatomy%3Askin+of+body&p=1

#### Select first two records

http://localhost:3000/data/c2m2/search/record_info?q=melanoma&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001681|disease_name:cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:skin%20of%20body|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

http://localhost:3000/data/c2m2/search/record_info?q=melanoma&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:melanoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:skin%20of%20body|biofluid_name:Unspecified|gene_name:AIM2|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay

### Search triple negative breast cancer and apply filters Homo sapiens and anatomy breast
http://localhost:3000/data/search/triple%20negative%20breast%20cancer/c2m2?t=ncbi_taxonomy%3AHomo+sapiens%7Canatomy%3Abreast&p=1

#### Select the third record
http://localhost:3000/data/c2m2/search/record_info?q=triple%20negative%20breast%20cancer&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001810|disease_name:cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

#### Further apply Data type filter as Gene Expression Data
http://localhost:3000/data/c2m2/search/record_info?q=triple%20negative%20breast%20cancer&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS%20phase%202|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay

### Example of queries with subject_ethnicity, subject_sex and subject_race filters

#### Search for: latino male down syndrome, and then apply several filters:
http://localhost:3000/data/search/latino%20male%20down%20syndrome/c2m2?t=dcc%3AThe+Gabriella+Miller+Kids+First+Pediatric+Research+Program|disease%3ADown+syndrome|ncbi_taxonomy%3AHomo+sapiens|subject_ethnicity%3AHispanic+or+Latino|subject_sex%3AMale|data_type%3AExpression+data&p=1

and proceed to the record_info page:

http://localhost:3000/data/c2m2/search/record_info?q=latino%20male%20down%20syndrome&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_Z6MWD3H0|disease_name:Down%20syndrome|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Expression%20data|assay_type_name:RNA%20sequencing%20assay|subject_ethnicity_name:Hispanic%20or%20Latino|subject_sex_name:Male|subject_race_name:Unspecified

#### Search metabolic disease male, and apply several filters:
http://localhost:3000/data/search/metabolic%20disease%20male/c2m2?t=disease%3Aasthma%7Canatomy%3Alung&p=1
(please note that after applying the two filters, Subject sex filter disappears)

Follow one record:
http://localhost:3000/data/c2m2/search/record_info?q=metabolic%20disease%20male&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001570|disease_name:asthma|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:lung|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified

#### Search hispanic female cancer, and apply some filters:
http://localhost:3000/data/search/hispanic%20female%20cancer/c2m2 -->

http://localhost:3000/data/search/hispanic%20female%20cancer/c2m2?p=1&t=subject_ethnicity%3AHispanic+or+Latino%7Cassay_type%3Aexome+sequencing+assay%7Csubject_sex%3AFemale%7Cdata_type%3ASequence+variations%7Canatomy%3Abrain

and follow one record:

http://localhost:3000/data/c2m2/search/record_info?q=hispanic%20female%20cancer&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_8Y99QZJJ|disease_name:cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:brain|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Sequence%20variations|assay_type_name:exome%20sequencing%20assay|subject_ethnicity_name:Hispanic%20or%20Latino|subject_sex_name:Female|subject_race_name:Unspecified
