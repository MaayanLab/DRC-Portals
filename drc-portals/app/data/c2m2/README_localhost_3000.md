
## Example URLs to test C2M2 search after any updates

### Main page: based on localhost:3000; locally, change 3000 to 3001, 3000, etc., as needed, when testing your changes

localhost:3000/data if testing from your local instance

Search: liver, filter: DCC/CF program: SPARC

http://localhost:3000/data/search/liver/c2m2?p=1&t=dcc%3AStimulating+Peripheral+Activity+to+Relieve+Conditions

Select a row:

Former link with lesser filters:
http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023864|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:celiac%20ganglion|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:experimental%20measurement|assay_type_name:electrophysiology%20assay

Without t in q:
http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023864|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:celiac%20ganglion|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:experimental%20measurement|assay_type_name:electrophysiology%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:Binary%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q: Can be faster for the (otherwise) slow pages
http://localhost:3000/data/c2m2/search/record_info?q=liver%20%22Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions%22%20%22OT2OD023864%22%20%22Mus%20musculus%22%20%22celiac%20ganglion%22%20%22experimental%20measurement%22%20%22electrophysiology%20assay%22%20%22Binary%20format%22&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023864|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:celiac%20ganglion|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:experimental%20measurement|assay_type_name:electrophysiology%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:Binary%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023864|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:celiac%20ganglion|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:experimental%20measurement|assay_type_name:electrophysiology%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:document%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=liver%20%22Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions%22%20%22OT2OD023864%22%20%22Mus%20musculus%22%20%22celiac%20ganglion%22%20%22experimental%20measurement%22%20%22electrophysiology%20assay%22%20%22document%20format%22&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023864|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:celiac%20ganglion|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:experimental%20measurement|assay_type_name:electrophysiology%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:document%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

Filter: ERCC || HMP
http://localhost:3000/data/search/liver/c2m2?p=1&t=dcc%3AThe+Extracellular+Communication+Consortium+Data+Coordination+Center%7Cdcc%3AHuBMAP

Select a row: (older when we had lesser number of filters and/or fields)
http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-TPATE168zlfJ-ST|disease_name:liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:bile%20duct|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

(newer)
http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-TPATE168zlfJ-ST|disease_name:liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:bile%20duct|biofluid_name:bile|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Indeterminate|subject_race_name:Unspecified|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=liver%20%22The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center%22%20%22EXR-TPATE168zlfJ-ST%22%20%22liver%20disease%22%20%22Homo%20sapiens%22%20%22bile%20duct%22%20%22bile%22%20%22Matrix%22%20%22small%20RNA%20sequencing%20assay%22%20%22Indeterminate%22%20%22TSV%22&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-TPATE168zlfJ-ST|disease_name:liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:bile%20duct|biofluid_name:bile|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Indeterminate|subject_race_name:Unspecified|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified


# Multiple values (OR) for some filters
Search liver:
http://localhost:3000/data/search/liver/c2m2?p=1

Apply DCC filter (after selecting one or more values for a filter, click outside the filter area):
http://localhost:3000/data/search/liver/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench

Apply Species filter (select two values: Homo sapiens and Mus musculus):
http://localhost:3000/data/search/liver/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench%7Cncbi_taxonomy%3AHomo+sapiens%7Cncbi_taxonomy%3AMus+musculus

Apply Anatomy filter (blood and Adipose tissue):
http://localhost:3000/data/search/liver/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench%7Cncbi_taxonomy%3AHomo+sapiens%7Cncbi_taxonomy%3AMus+musculus%7Canatomy%3Ablood%7Canatomy%3Aadipose+tissue

Select a record:
http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR002013|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:adipose%20tissue|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:ZIP%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=liver%20%22UCSD%20Metabolomics%20Workbench%22%20%22PR002013%22%20%22Mus%20musculus%22%20%22adipose%20tissue%22%20%22Mass%20spectrometry%20data%22%20%22liquid%20chromatography%20mass%20spectrometry%20assay%22%20%22ZIP%20format%22&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR002013|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:adipose%20tissue|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:ZIP%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Do not try this that often as this results in ~ 475,000 records. Search: lincs 2021 ; several filters applied and a row selected:
http://localhost:3000/data/c2m2/search/record_info?q=lincs%202021&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:breast%20carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|gene_name:AK4|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay

Example of a record with files at biosample and collection levels:
http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-TPATE168zlfJ-ST|disease_name:liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:bile%20duct|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

Example of a record with more than 1000 files:
http://localhost:3000/data/search/liver/c2m2?t=dcc%3AIlluminating+the+Druggable+Genome%7Cdisease%3Aliver+cancer&p=1

http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:liver%20cancer|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:JSON|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=liver%20%22Illuminating%20the%20Druggable%20Genome%22%20%22idg_tcrd_diseases%22%20%22liver%20cancer%22%20%22JSON%22&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:liver%20cancer|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:JSON|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Search: parkinson
http://localhost:3000/data/search/parkinson/c2m2

Select some records:
http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001964|disease_name:Parkinson%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|biofluid_name:blood%20serum|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:secondary%20Parkinson%20disease|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified

http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Parkinson%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:brain%20ventricle|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Parkinson%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:brain%20ventricle|biofluid_name:cerebrospinal%20fluid|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Female|subject_race_name:Unspecified|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=parkinson%20%22The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center%22%20%22EXR-KJENS1ADPD0000-ST%22%20%22Parkinson%27s%20disease%22%20%22Homo%20sapiens%22%20%22brain%20ventricle%22%20%22cerebrospinal%20fluid%22%20%22Matrix%22%20%22small%20RNA%20sequencing%20assay%22%20%22Female%22%20%22TSV%22&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Parkinson%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:brain%20ventricle|biofluid_name:cerebrospinal%20fluid|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Female|subject_race_name:Unspecified|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

Apply fiter: disease Alzheimer's Disease
http://localhost:3000/data/search/parkinson/c2m2?p=1&t=disease%3AAlzheimer%27s+disease

http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Alzheimer%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:cardiovascular%20system|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Alzheimer%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:brain%20ventricle|biofluid_name:cerebrospinal%20fluid|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Female|subject_race_name:Unspecified|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=parkinson%20%22The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center%22%20%22EXR-KJENS1ADPD0000-ST%22%20%22Alzheimer%27s%20disease%22%20%22Homo%20sapiens%22%20%22brain%20ventricle%22%20%22cerebrospinal%20fluid%22%20%22Matrix%22%20%22small%20RNA%20sequencing%20assay%22%20%22Female%22%20%22TSV%22&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-KJENS1ADPD0000-ST|disease_name:Alzheimer%27s%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:brain%20ventricle|biofluid_name:cerebrospinal%20fluid|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Female|subject_race_name:Unspecified|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Search: intestine homo sapiens female cancer
http://localhost:3000/data/search/intestine%20homo%20sapiens%20female%20cancer/c2m2

Select a record:

http://localhost:3000/data/c2m2/search/record_info?q=intestine%20homo%20sapiens%20female%20cancer&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-DGALA1GUTPLASM-ST|disease_name:colorectal%20cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:cardiovascular%20system|biofluid_name:seminal%20fluid|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

http://localhost:3000/data/c2m2/search/record_info?q=intestine%20homo%20sapiens%20female%20cancer&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-DGALA1GUTPLASM-ST|disease_name:colorectal%20cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:cardiovascular%20system|biofluid_name:seminal%20fluid|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Female|subject_race_name:White|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=intestine%20homo%20sapiens%20female%20cancer%20%22The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center%22%20%22EXR-DGALA1GUTPLASM-ST%22%20%22colorectal%20cancer%22%20%22Homo%20sapiens%22%20%22cardiovascular%20system%22%20%22seminal%20fluid%22%20%22Matrix%22%20%22small%20RNA%20sequencing%20assay%22%20%22Female%22%20%22White%22%20%22TSV%22&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-DGALA1GUTPLASM-ST|disease_name:colorectal%20cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:cardiovascular%20system|biofluid_name:seminal%20fluid|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Female|subject_race_name:White|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Search: intestine homo sapiens
http://localhost:3000/data/search/intestine%20homo%20sapiens/c2m2

Apply DCC filter 4DN and select a row:
http://localhost:3000/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:4D%20NUCLEOME%20DATA%20COORDINATION%20AND%20INTEGRATION%20CENTER|project_local_id:12a92962-8265-4fc0-b2f8-cf14f05db58b|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:colon|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:imaging%20assay

http://localhost:3000/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:4D%20NUCLEOME%20DATA%20COORDINATION%20AND%20INTEGRATION%20CENTER|project_local_id:12a92962-8265-4fc0-b2f8-cf14f05db58b|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:colon|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:imaging%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=intestine%20homo%20sapiens%20%224D%20NUCLEOME%20DATA%20COORDINATION%20AND%20INTEGRATION%20CENTER%22%20%2212a92962-8265-4fc0-b2f8-cf14f05db58b%22%20%22Homo%20sapiens%22%20%22colon%22%20%22imaging%20assay%22%20%22CSV%22&t=dcc_name:4D%20NUCLEOME%20DATA%20COORDINATION%20AND%20INTEGRATION%20CENTER|project_local_id:12a92962-8265-4fc0-b2f8-cf14f05db58b|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:colon|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:imaging%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

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

http://localhost:3000/data/c2m2/search/record_info?q=sterol&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:Harmonizome|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:SC5D|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:Textual%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=sterol%20%22Illuminating%20the%20Druggable%20Genome%22%20%22Harmonizome%22%20%22Homo%20sapiens%22%20%22SC5D%22%20%22Textual%20format%22&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:Harmonizome|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:SC5D|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:Textual%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

Go back: Apply filter: DCC: LINCS
http://localhost:3000/data/search/sterol/c2m2?p=1&t=dcc%3ALibrary+of+Integrated+Network-based+Cellular+Signatures

http://localhost:3000/data/c2m2/search/record_info?q=sterol&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:breast%20carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|biofluid_name:Unspecified|gene_name:SCP2|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay

http://localhost:3000/data/c2m2/search/record_info?q=sterol&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:breast%20carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|biofluid_name:Unspecified|gene_name:SCP2|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=sterol%20%22Library%20of%20Integrated%20Network-based%20Cellular%20Signatures%22%20%22LINCS-2021%22%20%22breast%20carcinoma%22%20%22Homo%20sapiens%22%20%22breast%22%20%22SCP2%22%20%22Gene%20expression%20profile%22%20%22landmark%20transcript%20profiling%20assay%22%20%22TSV%22&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:breast%20carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|biofluid_name:Unspecified|gene_name:SCP2|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

Go back: Apply filter: DCC: MW
http://localhost:3000/data/search/sterol/c2m2?p=1&t=dcc%3AUCSD+Metabolomics+Workbench

http://localhost:3000/data/c2m2/search/record_info?q=sterol&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000633|disease_name:fatty%20liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:liver|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:mass%20spectrometry%20assay

OR

http://localhost:3000/data/c2m2/search/record_info?q=sterol&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000633|disease_name:steatotic%20liver%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:liver|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified

http://localhost:3000/data/search/sterol/c2m2?p=1&t=anatomy%3Ablood+serum%7Canatomy%3Aadipose+tissue

http://localhost:3000/data/c2m2/search/record_info?q=sterol&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:blood%20serum|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:LCAT_HUMAN|compound_name:CID%2091845155|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified

### Search: atorvastatin
http://localhost:3000/data/search/atorvastatin/c2m2?p=1

http://localhost:3000/data/c2m2/search/record_info?q=atorvastatin&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:Drugmonizome|disease_name:Unspecified|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Atorvastatin|data_type_name:Unspecified|assay_type_name:Unspecified

http://localhost:3000/data/c2m2/search/record_info?q=atorvastatin&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:Drugmonizome|disease_name:Unspecified|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Atorvastatin|data_type_name:Unspecified|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:JSON|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=atorvastatin%20%22Illuminating%20the%20Druggable%20Genome%22%20%22Drugmonizome%22%20%22Atorvastatin%22%20%22JSON%22&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:Drugmonizome|disease_name:Unspecified|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Atorvastatin|data_type_name:Unspecified|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:JSON|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

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

http://localhost:3000/data/c2m2/search/record_info?q=myeloid%20cell&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_46RR9ZR6|disease_name:cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Data%20index|assay_type_name:exome%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:BAI|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=myeloid%20cell%20%22The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program%22%20%22SD_46RR9ZR6%22%20%22cancer%22%20%22Homo%20sapiens%22%20%22Data%20index%22%20%22exome%20sequencing%20assay%22%20%22BAI%22&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_46RR9ZR6|disease_name:cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Data%20index|assay_type_name:exome%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:BAI|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Search: COVID
http://localhost:3000/data/search/covid/c2m2

#### Apply species and DCC flter
http://localhost:3000/data/search/covid/c2m2?t=ncbi_taxonomy%3AHomo+sapiens%7Cdcc%3AThe+Gabriella+Miller+Kids+First+Pediatric+Research+Program&p=1

#### Record Info page:
http://localhost:3000/data/c2m2/search/record_info?q=covid&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_FFVQ3T38|disease_name:COVID-19|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:data|assay_type_name:Unspecified

http://localhost:3000/data/c2m2/search/record_info?q=covid&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_FFVQ3T38|disease_name:COVID-19|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Data|assay_type_name:Unspecified|subject_ethnicity_name:Hispanic%20or%20Latino|subject_sex_name:Female|subject_race_name:Unspecified|file_format_name:JSON|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=covid%20%22The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program%22%20%22SD_FFVQ3T38%22%20%22COVID-19%22%20%22Homo%20sapiens%22%20%22Data%22%20%22Hispanic%20or%20Latino%22%20%22Female%22%20%22JSON%22&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_FFVQ3T38|disease_name:COVID-19|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Data|assay_type_name:Unspecified|subject_ethnicity_name:Hispanic%20or%20Latino|subject_sex_name:Female|subject_race_name:Unspecified|file_format_name:JSON|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Search: throat cancer
http://localhost:3000/data/search/throat%20cancer/c2m2

#### Filters and then Record Info  page:
http://localhost:3000/data/search/throat%20cancer/c2m2?t=anatomy%3Asaliva&p=1
or
http://localhost:3000/data/search/throat%20cancer/c2m2?t=biofluid%3Asaliva&p=1


http://localhost:3000/data/c2m2/search/record_info?q=throat%20cancer&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001492|disease_name:human%20immunodeficiency%20virus%20infectious%20disease|ncbi_taxonomy_name:Homo%20sapiens|biofluid_name:saliva|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

http://localhost:3000/data/c2m2/search/record_info?q=throat%20cancer&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001492|disease_name:human%20immunodeficiency%20virus%20infectious%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:saliva|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:ZIP%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=throat%20cancer%20%22UCSD%20Metabolomics%20Workbench%22%20%22PR001492%22%20%22human%20immunodeficiency%20virus%20infectious%20disease%22%20%22Homo%20sapiens%22%20%22saliva%22%20%22Mass%20spectrometry%20data%22%20%22liquid%20chromatography%20mass%20spectrometry%20assay%22%20%22ZIP%20format%22&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001492|disease_name:human%20immunodeficiency%20virus%20infectious%20disease|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:saliva|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:ZIP%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

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

http://localhost:3000/data/c2m2/search/record_info?q=hepatitis&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:Budd-Chiari%20syndrome|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:JSON|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=hepatitis%20%22Illuminating%20the%20Druggable%20Genome%22%20%22idg_tcrd_diseases%22%20%22Budd-Chiari%20syndrome%22%20%22JSON%22&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:Budd-Chiari%20syndrome|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:JSON|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Search: malignant carcinoma
http://localhost:3000/data/search/malignant%20carcinoma/c2m2?t=disease%3Aadrenal+cortex+cancer%7Cdisease%3Anasopharynx+carcinoma&p=1

### Search: doxorubicin
http://localhost:3000/data/search/doxorubicin/c2m2?t=disease%3Aobesity%7Cdisease%3Abreast+carcinoma&p=1

http://localhost:3000/data/c2m2/search/record_info?q=doxorubicin&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001044|disease_name:obesity|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:liver|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

### Search: sleep apnea
http://localhost:3000/data/search/sleep%20apnea/c2m2?t=&p=1

http://localhost:3000/data/c2m2/search/record_info?q=sleep%20apnea&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000097|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|biofluid_name:blood%20serum|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay

http://localhost:3000/data/c2m2/search/record_info?q=sleep%20apnea&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000097|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:blood%20serum|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:ZIP%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=sleep%20apnea%20%22UCSD%20Metabolomics%20Workbench%22%20%22PR000097%22%20%22Homo%20sapiens%22%20%22blood%20serum%22%20%22Mass%20spectrometry%20data%22%20%22liquid%20chromatography%20mass%20spectrometry%20assay%22%20%22ZIP%20format%22&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000097|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:blood%20serum|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:ZIP%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Search: vitiligo
http://localhost:3000/data/search/vitiligo/c2m2?t=dcc%3AGlyGen&p=1

http://localhost:3000/data/c2m2/search/record_info?q=vitiligo&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:FBX11_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified

http://localhost:3000/data/c2m2/search/record_info?q=vitiligo&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:FBX11_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:protein%20phosphorylation|ptm_subtype_name:peptidyl-serine%20phosphorylation|ptm_site_type_name:Defined%20-%20faldo:ExactPosition

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=vitiligo%20%22GlyGen%22%20%22Portal%22%20%22Homo%20sapiens%22%20%22FBX11_HUMAN%22%20%22GlyTouCan%20accession%22%20%22CSV%22%20%22protein%20phosphorylation%22%20%22peptidyl-serine%20phosphorylation%22%20%22Defined%20-%20faldo:ExactPosition%22&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:FBX11_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:protein%20phosphorylation|ptm_subtype_name:peptidyl-serine%20phosphorylation|ptm_site_type_name:Defined%20-%20faldo:ExactPosition

### Search: islet of langerhans
http://localhost:3000/data/search/islet%20of%20langerhans/c2m2?t=&p=1

http://localhost:3000/data/search/islet%20of%20langerhans/c2m2?t=dcc%3AUCSD+Metabolomics+Workbench&p=1

http://localhost:3000/data/c2m2/search/record_info?q=islet%20of%20langerhans&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000662|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:islet%20of%20Langerhans|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:gas%20chromatography%20mass%20spectrometry%20assay

http://localhost:3000/data/c2m2/search/record_info?q=islet%20of%20langerhans&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000662|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:islet%20of%20Langerhans|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:gas%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:ZIP%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=islet%20of%20langerhans%20%22UCSD%20Metabolomics%20Workbench%22%20%22PR000662%22%20%22Mus%20musculus%22%20%22islet%20of%20Langerhans%22%20%22Mass%20spectrometry%20data%22%20%22gas%20chromatography%20mass%20spectrometry%20assay%22%20%22ZIP%20format%22&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR000662|disease_name:Unspecified|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:islet%20of%20Langerhans|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:gas%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:ZIP%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Search: exercise obese
http://localhost:3000/data/search/exercise%20obese/c2m2

http://localhost:3000/data/search/exercise%20obese/c2m2?t=dcc%3AThe+Extracellular+Communication+Consortium+Data+Coordination+Center&p=1

http://localhost:3000/data/c2m2/search/record_info?q=exercise%20obese&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-SADAS1EXERs1-ST|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:anatomical%20system|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay

http://localhost:3000/data/c2m2/search/record_info?q=exercise%20obese&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-SADAS1EXERs1-ST|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:anatomical%20system|biofluid_name:seminal%20fluid|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Female|subject_race_name:Unspecified|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=exercise%20obese%20%22The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center%22%20%22EXR-SADAS1EXERs1-ST%22%20%22Homo%20sapiens%22%20%22anatomical%20system%22%20%22seminal%20fluid%22%20%22Matrix%22%20%22small%20RNA%20sequencing%20assay%22%20%22Female%22%20%22TSV%22&t=dcc_name:The%20Extracellular%20Communication%20Consortium%20Data%20Coordination%20Center|project_local_id:EXR-SADAS1EXERs1-ST|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:anatomical%20system|biofluid_name:seminal%20fluid|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Matrix|assay_type_name:small%20RNA%20sequencing%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Female|subject_race_name:Unspecified|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

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

http://localhost:3000/data/c2m2/search/record_info?q=OT2OD023847&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023847|disease_name:Unspecified|ncbi_taxonomy_name:domestic%20pig|anatomy_name:stomach|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:experimental%20measurement|assay_type_name:electrophysiology%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:Binary%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=OT2OD023847%20%22Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions%22%20%22OT2OD023847%22%20%22domestic%20pig%22%20%22stomach%22%20%22experimental%20measurement%22%20%22electrophysiology%20assay%22%20%22Binary%20format%22&t=dcc_name:Stimulating%20Peripheral%20Activity%20to%20Relieve%20Conditions|project_local_id:OT2OD023847|disease_name:Unspecified|ncbi_taxonomy_name:domestic%20pig|anatomy_name:stomach|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:experimental%20measurement|assay_type_name:electrophysiology%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:Binary%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

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

#### Further apply Data type filter as Gene Expression Profile
http://localhost:3000/data/search/triple%20negative%20breast%20cancer/c2m2?t=ncbi_taxonomy%3AHomo+sapiens%7Canatomy%3Abreast%7Cdata_type%3AGene+expression+profile&p=1

http://localhost:3000/data/c2m2/search/record_info?q=triple%20negative%20breast%20cancer&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS%20phase%202|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay

http://localhost:3000/data/c2m2/search/record_info?q=triple%20negative%20breast%20cancer&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS%20phase%202|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:TAR%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=triple%20negative%20breast%20cancer%20%22Library%20of%20Integrated%20Network-based%20Cellular%20Signatures%22%20%22LINCS%20phase%202%22%20%22Homo%20sapiens%22%20%22breast%22%20%22Gene%20expression%20profile%22%20%22landmark%20transcript%20profiling%20assay%22%20%22TAR%20format%22&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS%20phase%202|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:TAR%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Example of queries with subject_ethnicity, subject_sex and subject_race filters

#### Search for: latino male down syndrome, and then apply several filters:
http://localhost:3000/data/search/latino%20male%20down%20syndrome/c2m2?t=dcc%3AThe+Gabriella+Miller+Kids+First+Pediatric+Research+Program|disease%3ADown+syndrome|ncbi_taxonomy%3AHomo+sapiens|subject_ethnicity%3AHispanic+or+Latino|subject_sex%3AMale|data_type%3AExpression+data&p=1

and proceed to the record_info page:

http://localhost:3000/data/c2m2/search/record_info?q=latino%20male%20down%20syndrome&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_Z6MWD3H0|disease_name:Down%20syndrome|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Expression%20data|assay_type_name:RNA%20sequencing%20assay|subject_ethnicity_name:Hispanic%20or%20Latino|subject_sex_name:Male|subject_race_name:Unspecified

http://localhost:3000/data/c2m2/search/record_info?q=latino%20male%20down%20syndrome&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_Z6MWD3H0|disease_name:Down%20syndrome|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Data%20index|assay_type_name:RNA%20sequencing%20assay|subject_ethnicity_name:Hispanic%20or%20Latino|subject_sex_name:Male|subject_race_name:Unspecified|file_format_name:Unspecified|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q: about 2x faster
http://localhost:3000/data/c2m2/search/record_info?q=latino%20male%20down%20syndrome%20%22The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program%22%20%22SD_Z6MWD3H0%22%20%22Down%20syndrome%22%20%22Homo%20sapiens%22%20%22Data%20index%22%20%22RNA%20sequencing%20assay%22%20%22Hispanic%20or%20Latino%22%20%22Male%22&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_Z6MWD3H0|disease_name:Down%20syndrome|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Data%20index|assay_type_name:RNA%20sequencing%20assay|subject_ethnicity_name:Hispanic%20or%20Latino|subject_sex_name:Male|subject_race_name:Unspecified|file_format_name:Unspecified|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

#### Search metabolic disease male, and apply several filters:
http://localhost:3000/data/search/metabolic%20disease%20male/c2m2?t=disease%3Aasthma%7Canatomy%3Alung&p=1
(please note that after applying the two filters, Subject sex filter disappears)

Follow one record:
http://localhost:3000/data/c2m2/search/record_info?q=metabolic%20disease%20male&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001570|disease_name:asthma|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:lung|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified

http://localhost:3000/data/c2m2/search/record_info?q=metabolic%20disease%20male&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001570|disease_name:asthma|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:lung|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:ZIP%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=metabolic%20disease%20male%20%22UCSD%20Metabolomics%20Workbench%22%20%22PR001570%22%20%22asthma%22%20%22Mus%20musculus%22%20%22lung%22%20%22Mass%20spectrometry%20data%22%20%22liquid%20chromatography%20mass%20spectrometry%20assay%22%20%22ZIP%20format%22&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR001570|disease_name:asthma|ncbi_taxonomy_name:Mus%20musculus|anatomy_name:lung|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:ZIP%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

#### Search hispanic female cancer, and apply some filters:
http://localhost:3000/data/search/hispanic%20female%20cancer/c2m2 -->

http://localhost:3000/data/search/hispanic%20female%20cancer/c2m2?p=1&t=subject_ethnicity%3AHispanic+or+Latino%7Cassay_type%3Aexome+sequencing+assay%7Csubject_sex%3AFemale%7Cdata_type%3ASequence+variations%7Canatomy%3Abrain

and follow one record:

http://localhost:3000/data/c2m2/search/record_info?q=hispanic%20female%20cancer&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_8Y99QZJJ|disease_name:cancer|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:brain|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Sequence%20variations|assay_type_name:exome%20sequencing%20assay|subject_ethnicity_name:Hispanic%20or%20Latino|subject_sex_name:Female|subject_race_name:Unspecified

### Search sepsis and apply filters:
http://localhost:3000/data/search/sepsis/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens%7Cncbi_taxonomy%3AMus+musculus%7Cbiofluid%3Ablood%7Cbiofluid%3Aperitoneal+fluid%7Cfile_format%3ATextual+format

### Search for mitochondria and apply filters
http://localhost:3000/data/search/mitochondria/c2m2?p=1&t=ncbi_taxonomy%3AHomo+sapiens%7Cprotein%3AHUMMR_HUMAN%7Cprotein%3ADBLOH_HUMAN

### Search for schizophrenia and add filters:
http://localhost:3000/data/search/schizophrenia/c2m2?p=1&t=data_type%3AMass+spectrometry+data

### Search for celiac disease and apply filters:
http://localhost:3000/data/search/celiac%20disease/c2m2?t=anatomy%3Amyenteric+nerve+plexus%7Cdata_type%3AGene+expression+profile&p=1

### Search for mitral valve and apply filters
http://localhost:3000/data/search/mitral%20valve/c2m2?t=anatomy%3Aleft+cardiac+atrium%7Cassay_type%3AChIP-seq+assay%7Cassay_type%3Achromatin+interaction+analysis+by+paired-end+tag+sequencing+assay&p=1

### Search for aorta and apply filters
http://localhost:3000/data/search/aorta/c2m2?t=anatomy%3Aascending+aorta&p=1

### Search for ChIP seq and cancer as filter -  you get mass spectromentry assay but the description contains ChIP-seq! Cannot do much about it.
http://localhost:3000/data/search/ChIP%20seq/c2m2?t=disease%3Acancer&p=1

### Search for mass spectrometry and apply filters:
http://localhost:3000/data/search/mass%20spectrometry/c2m2?t=assay_type%3Atargeted%2C+drug-modulated%2C+mass+spectrometry-based+protein+phoshporylation-state+assay&p=1

### Search for menstrual cycle and add filters:
http://localhost:3000/data/search/menstrual%20cycle/c2m2?t=compound%3AAcetaminophen&p=1

## PTM-related test queries

### Search for liver and apply filters for PTM typs, subtype and site
http://localhost:3000/data/search/liver/c2m2?t=ptm_type%3Aprotein+glycosylation%7Cptm_subtype%3Aprotein+N-linked+glycosylation&p=1

#### Look into record information and download PTM metadata
http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Rattus%20norvegicus|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:EST5_RAT|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:protein%20glycosylation|ptm_subtype_name:protein%20N-linked%20glycosylation|ptm_site_type_name:Defined%20-%20faldo:ExactPosition

http://localhost:3000/data/c2m2/search/record_info?q=liver&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Rattus%20norvegicus|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:EST5_RAT|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:protein%20glycosylation|ptm_subtype_name:protein%20N-linked%20glycosylation|ptm_site_type_name:Defined%20-%20faldo:ExactPosition

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=liver%20%22GlyGen%22%20%22Portal%22%20%22Rattus%20norvegicus%22%20%22EST5_RAT%22%20%22GlyTouCan%20accession%22%20%22CSV%22%20%22protein%20glycosylation%22%20%22protein%20N-linked%20glycosylation%22%20%22Defined%20-%20faldo:ExactPosition%22&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Rattus%20norvegicus|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:EST5_RAT|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:protein%20glycosylation|ptm_subtype_name:protein%20N-linked%20glycosylation|ptm_site_type_name:Defined%20-%20faldo:ExactPosition

### Search for Parkinsons and apply PTM type filter
http://localhost:3000/data/search/parkinson/c2m2?t=ptm_type%3Aprotein+phosphorylation&p=1

#### Look into the record
http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:GlyGen%7Cproject_local_id:Portal%7Cdisease_name:Unspecified%7Cncbi_taxonomy_name:Gallus%20gallus%7Canatomy_name:Unspecified%7Cbiofluid_name:Unspecified%7Cgene_name:Unspecified%7Cprotein_name:PARK7_CHICK%7Ccompound_name:Unspecified%7Cdata_type_name:GlyTouCan%20accession%7Cassay_type_name:Unspecified%7Csubject_ethnicity_name:Unspecified%7Csubject_sex_name:Unspecified%7Csubject_race_name:Unspecified%7Cfile_format_name:CSV%7Cptm_type_name:protein%20phosphorylation%7Cptm_subtype_name:peptidyl-tyrosine%20phosphorylation%7Cptm_site_type_name:Defined%20-%20faldo:ExactPosition

### Apply PTM subtype filter as well
http://localhost:3000/data/search/parkinson/c2m2?t=ptm_type%3Aprotein+phosphorylation%7Cptm_subtype%3Apeptidyl-serine+phosphorylation&p=1

#### Select a record
http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:PARK7_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:protein%20phosphorylation|ptm_subtype_name:peptidyl-serine%20phosphorylation|ptm_site_type_name:Defined%20-%20faldo:ExactPosition

http://localhost:3000/data/c2m2/search/record_info?q=parkinson&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:PARK7_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:protein%20phosphorylation|ptm_subtype_name:peptidyl-serine%20phosphorylation|ptm_site_type_name:Defined%20-%20faldo:ExactPosition

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=parkinson%20%22GlyGen%22%20%22Portal%22%20%22Homo%20sapiens%22%20%22PARK7_HUMAN%22%20%22GlyTouCan%20accession%22%20%22CSV%22%20%22protein%20phosphorylation%22%20%22peptidyl-serine%20phosphorylation%22%20%22Defined%20-%20faldo:ExactPosition%22&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:PARK7_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:protein%20phosphorylation|ptm_subtype_name:peptidyl-serine%20phosphorylation|ptm_site_type_name:Defined%20-%20faldo:ExactPosition

### Search for hepatitis and apply taxonomy and PTM subtype filters
http://localhost:3000/data/search/hepatitis/c2m2?t=ncbi_taxonomy%3ABos+taurus%7Cptm_subtype%3Aprotein+N-linked+glycosylation&p=1

#### Look into a record
http://localhost:3000/data/c2m2/search/record_info?q=hepatitis&t=dcc_name:GlyGen%7Cproject_local_id:Portal%7Cdisease_name:Unspecified%7Cncbi_taxonomy_name:Bos%20taurus%7Canatomy_name:Unspecified%7Cbiofluid_name:Unspecified%7Cgene_name:Unspecified%7Cprotein_name:HECAM_BOVIN%7Ccompound_name:Unspecified%7Cdata_type_name:GlyTouCan%20accession%7Cassay_type_name:Unspecified%7Csubject_ethnicity_name:Unspecified%7Csubject_sex_name:Unspecified%7Csubject_race_name:Unspecified%7Cfile_format_name:CSV%7Cptm_type_name:protein%20glycosylation%7Cptm_subtype_name:protein%20N-linked%20glycosylation%7Cptm_site_type_name:Defined%20-%20faldo:ExactPosition

### Search for Diabetes and apply filters for PTM type and Species
http://localhost:3000/data/search/diabetes/c2m2?t=ptm_type%3Aprotein+phosphorylation%7Cncbi_taxonomy%3AHomo+sapiens&p=1

#### Look into one record
http://localhost:3000/data/c2m2/search/record_info?q=diabetes&t=dcc_name:GlyGen%7Cproject_local_id:Portal%7Cdisease_name:Unspecified%7Cncbi_taxonomy_name:Homo%20sapiens%7Canatomy_name:Unspecified%7Cbiofluid_name:Unspecified%7Cgene_name:Unspecified%7Cprotein_name:ATPMK_HUMAN%7Ccompound_name:Unspecified%7Cdata_type_name:GlyTouCan%20accession%7Cassay_type_name:Unspecified%7Csubject_ethnicity_name:Unspecified%7Csubject_sex_name:Unspecified%7Csubject_race_name:Unspecified%7Cfile_format_name:CSV%7Cptm_type_name:protein%20phosphorylation%7Cptm_subtype_name:peptidyl-serine%20phosphorylation%7Cptm_site_type_name:Defined%20-%20faldo:ExactPosition

http://localhost:3000/data/c2m2/search/record_info?q=diabetes&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:ATPMK_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:protein%20phosphorylation|ptm_subtype_name:peptidyl-serine%20phosphorylation|ptm_site_type_name:Defined%20-%20faldo:ExactPosition

With t in q:
http://localhost:3000/data/c2m2/search/record_info?q=diabetes%20%22GlyGen%22%20%22Portal%22%20%22Homo%20sapiens%22%20%22ATPMK_HUMAN%22%20%22GlyTouCan%20accession%22%20%22CSV%22%20%22protein%20phosphorylation%22%20%22peptidyl-serine%20phosphorylation%22%20%22Defined%20-%20faldo:ExactPosition%22&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:ATPMK_HUMAN|compound_name:Unspecified|data_type_name:GlyTouCan%20accession|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:CSV|ptm_type_name:protein%20phosphorylation|ptm_subtype_name:peptidyl-serine%20phosphorylation|ptm_site_type_name:Defined%20-%20faldo:ExactPosition

## Additional examples to test speed up due to including t in q in URL for the record_info page:

### Do not try this that often as this results in ~ 475,000 records. Search: lincs 2021 ; several filters applied and a row selected:
(It takes about 90s to get the Project associated files table)
http://localhost:3000/data/c2m2/search/record_info?q=lincs%202021&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:breast%20carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|gene_name:AK4|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay

Faster version: With t in q:
(It takes about 50s to get the Project associated files table)
http://localhost:3000/data/c2m2/search/record_info?q=lincs%202021%20%22Library%20of%20Integrated%20Network-based%20Cellular%20Signatures%22%20%22LINCS-2021%22%20%22breast%20carcinoma%22%20%22Homo%20sapiens%22%20%22breast%22%20%22AK4%22%20%22Gene%20expression%20profile%22%20%22landmark%20transcript%20profiling%20assay%22%20%22TSV%22&t=dcc_name:Library%20of%20Integrated%20Network-based%20Cellular%20Signatures|project_local_id:LINCS-2021|disease_name:breast%20carcinoma|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:breast|biofluid_name:Unspecified|gene_name:AK4|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Gene%20expression%20profile|assay_type_name:landmark%20transcript%20profiling%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:TSV|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Search blood, apply DCC filter Kids First then select one or more records
http://localhost:3000/data/search/blood/c2m2?t=dcc%3AThe+Gabriella+Miller+Kids+First+Pediatric+Research+Program&p=1

#### record_info page:
Regular version: Project associated files table takes ~ 7s
http://localhost:3000/data/c2m2/search/record_info?q=blood&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_W0V965XZ|disease_name:leukemia|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:blood|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Data%20index|assay_type_name:exome%20sequencing%20assay|subject_ethnicity_name:not%20Hispanic%20or%20Latino|subject_sex_name:Female|subject_race_name:Unspecified|file_format_name:Tabix%20index%20file%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

Faster version: With t in q: loads almost instantly: Project associated files table takes 0.2-0.5s
http://localhost:3000/data/c2m2/search/record_info?q=blood%20%22The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program%22%20%22SD_W0V965XZ%22%20%22leukemia%22%20%22Homo%20sapiens%22%20%22blood%22%20%22Data%20index%22%20%22exome%20sequencing%20assay%22%20%22not%20Hispanic%20or%20Latino%22%20%22Female%22%20%22Tabix%20index%20file%20format%22&t=dcc_name:The%20Gabriella%20Miller%20Kids%20First%20Pediatric%20Research%20Program|project_local_id:SD_W0V965XZ|disease_name:leukemia|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:blood|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Data%20index|assay_type_name:exome%20sequencing%20assay|subject_ethnicity_name:not%20Hispanic%20or%20Latino|subject_sex_name:Female|subject_race_name:Unspecified|file_format_name:Tabix%20index%20file%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Search blood, select first record, it is from Metabolomics Workbench
Regular version: Tables take about 1.5s
http://localhost:3000/data/c2m2/search/record_info?q=blood&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR002206|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:blood%20plasma|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:Binary%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

Faster version: With t in q: almost instant, tables less than 20ms
http://localhost:3000/data/c2m2/search/record_info?q=blood%20%22UCSD%20Metabolomics%20Workbench%22%20%22PR002206%22%20%22Homo%20sapiens%22%20%22blood%20plasma%22%20%22Mass%20spectrometry%20data%22%20%22liquid%20chromatography%20mass%20spectrometry%20assay%22%20%22Binary%20format%22&t=dcc_name:UCSD%20Metabolomics%20Workbench|project_local_id:PR002206|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:blood%20plasma|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Mass%20spectrometry%20data|assay_type_name:liquid%20chromatography%20mass%20spectrometry%20assay|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:Binary%20format|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

### Example of IDG page: search blood
Regular version: ~ 0.3S
http://localhost:3000/data/c2m2/search/record_info?q=blood&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:hematopoietic%20system%20disease|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:JSON|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified

Faster version: With t in q: less than 0.1 s
http://localhost:3000/data/c2m2/search/record_info?q=blood%20%22Illuminating%20the%20Druggable%20Genome%22%20%22idg_tcrd_diseases%22%20%22hematopoietic%20system%20disease%22%20%22JSON%22&t=dcc_name:Illuminating%20the%20Druggable%20Genome|project_local_id:idg_tcrd_diseases|disease_name:hematopoietic%20system%20disease|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified|assay_type_name:Unspecified|subject_ethnicity_name:Unspecified|subject_sex_name:Unspecified|subject_race_name:Unspecified|file_format_name:JSON|ptm_type_name:Unspecified|ptm_subtype_name:Unspecified|ptm_site_type_name:Unspecified
