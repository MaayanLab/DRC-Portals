
## Datapackage Submission

As an optional but recommended step before submitting your data package, you may validate your pipeline using either the `c2m2-frictionless` Python package (see [Resources](#resources)) or by following the steps below, from the [CFDE-CC Documentation Wiki Quickstart](https://github.com/nih-cfde/published-documentation/wiki/Quickstart#optional-frictionless): 

> Our submission system runs the frictionless validator on our servers as part of the submission process. You do not need to install or run frictionless to use our tool, however if you would like to use the validator locally, you can install it using these commands:  
`pip install frictionless`  
If that command fails try:  
`pip install frictionless-py`  
Once it's installed, run it by doing:  
`frictionless validate PATH/TO/JSON_FILE_IN_DIRECTORY`  
This command takes several minutes to run, and dumps the results into your terminal by default. To make a nicer file to review do:  
`frictionless validate PATH/TO/JSON_FILE_IN_DIRECTORY > report.txt`  

Currently, the CFDE Workbench Data Portal accepts complete datapackage submissions in ZIP file format (*.zip). 

For specific instructions on using the submission system, see the [Contribution Guide](https://data.cfde.cloud/submit).

To submit a datapackage, navigate to the [Submission System](https://data.cfde.cloud/submit/form).

## Tutorial
For the April 2022 CFDE Cross-Pollination meeting, the LINCS DCC demonstrated a Jupyter Notebook tutorial on building the `file`, `biosample`, and `subject` tables for LINCS L1000 signature data. The code and files can be found at the following link: 

[LINCS C2M2 Demo (04-05-2022 Cross-Pollination)](https://github.com/nih-cfde/LINCS-metadata/tree/main/scripts/April-CrossPollination-Demo)

Code snippets from this tutorial corresponding to each step are reproduced below. Note that the C2M2 datapackage building process will vary across DCCs, depending on the types of generated data, ontologies, and access standards in place. In general, the process will be as follows: 

1. Become familiar with the current structure of the C2M2, including the required fields across the entity and association tables, and download the most recent version of the [JSON schema](https://osf.io/c63aw/). Gather any metadata mapping files you may need. 

2. Identify the relevant namespace for all files, and build the `id_namespace` and `dcc` tables first. 

    - For LINCS, the namespace "https://lincsproject.org" is used. The following code will generate the LINCS `id_namespace` table: 
    ```
    pd.DataFrame(
      [
        [
          'https://www.lincsproject.org', # id
          'LINCS', # abbreviation
          'Library of Integrated Network-Based Cellular Signatures', # name
          'A network-based understanding of biology' # description
          ]
      ], 
      columns=['id', 'abbreviation', 'name', 'description']
    ).to_csv('id_namespace.tsv', sep='\t', index=False)
    ```

3. Identify all relevant projects and their associated files that will be included in the C2M2 datapackage. Generate container entity tables (`project`, `collection`) that describe logic, theme, or funding-based groups of the core entities. Note that projects and collections may be nested, in the `project_in_project` and `collection_in_collection` tables. 

    - In the LINCS tutorial, the data comes from the 2021 release of the LINCS L1000 Connectivity Map dataset. In creating a project representing the files from this dataset, there must also be an overarching root project for all LINCS data. 
    ```
    pd.DataFrame(
      [
        [ 
          'https://www.lincsproject.org', # id_namespace
          'LINCS', # local_id
          'https://www.lincsproject.org', # persistent_id
          date(2013, 1, 1), # creation_time
          'LINCS', # abbreviation
          'Library of Integrated Network-Based Cellular Signatures', # name
          'A network-based understanding of biology' # description
        ], 
        [
          'https://www.lincsproject.org', # id_namespace
          'LINCS-2021', # local_id
          'https://clue.io/data/CMap2020#LINCS2020', # persistent_id
          date(2020, 11, 20), # creation_time
          'LINCS-2021', # abbreviation
          'LINCS 2021 Data Release', # name
          'The 2021 beta release of the CMap LINCS resource' # description
        ]
      ], 
      columns=[
        'id_namespace', 'local_id', 'persistent_id', 'creation_time', 
        'abbreviation', 'name', 'description'
      ]
    ).to_csv('project.tsv', sep='\t', index=False)

    pd.DataFrame(
      [
        [
          'https://www.lincsproject.org', # parent_project_id_namespace
          'LINCS', # parent_project_local_id
          'https://www.lincsproject.org/', # child_project_id_namespace
          'LINCS-2021' # child_project_local_id
        ]
      ],
      columns=[
        'parent_project_id_namespace', 'parent_project_local_id',
        'child_project_id_namespace', 'child_project_local_id'
      ]
    ).to_csv('project_in_project.tsv', sep='\t', index=False)
    ```

4. Determine the relationships between files and their associated samples or biological subjects, as well as all relevant assay types, analysis methods, data types, file formats, etc. Also identify all appropriate ontological mappings, if any, corresponding to each value from above. 

    - The LINCS DCC includes internal drug, gene, and cell line identifiers, which were mapped to PubChem, Ensembl, and Disease Ontology/UBERON manually ahead of time, but other DCCs may already make use of the CFDE-supported ontologies. 
    - For instance, the LINCS signature `L1000_LINCS_DCIC_ABY001_A375_XH_A16_lapatinib_10uM.tsv.gz` comes from the biosample `ABY001_A375_XH_A16_lapatinib_10uM` (in this case an experimental condition) and the subject cell line `A375`; has a data type of expression matrix (`data:0928`); is stored as a TSV file format (`format:3475`) with GZIP compression format (`format:3989`); and has a MIME type of `text/tab-separated-values`. 
    - The `ABY001_A375_XH_A16_lapatinib_10uM` biosample was obtained via the L1000 sequencing assay type (`OBI:0002965`); comes from a cell line derived from the skin (`UBERON:0002097`); and was treated with the compound lapatinib (`CID:208908`). 

5. Either manually or programmatically, generate each data table, starting with the core entity tables (`file`, `biosample`, `subject`). This step will depend entirely on the format of a DCC's existing metadata and ontology mapping tables. 

6. Generate the inter-entity linkage association tables (`file_describes_biosample`, `file_describes_subject`, `biosample_from_subject`). 
    
    - In the LINCS tutorial, since the filenames come directly from the biosamples, once the `file` and `biosample` tables have both been built, `file_describes_biosample` can be generated. 
    ```
    fdb = file_df[['id_namespace', 'local_id']].copy()
    fdb = fdb.rename(
      columns={
        'id_namespace': 'file_id_namespace', 
        'local_id': 'file_local_id'
      }
    )
    fdb['biosample_id_namespace'] = fdb['file_id_namespace']
    fdb['biosample_local_id'] = fdb['file_local_id'].apply(file_2_biosample_map_function)
    ```

7. Assign files, biosamples, and subjects to any collections, if applicable, using the `file_in_collection`, `subject_in_collection`, and `biosample_in_collection` tables. 

    - Collections are optional, and can represent files from the same publications or other logical groupings outside of funding. 

8. Use provided [C2M2 submission preparation script and ontology support files](https://osf.io/bq6k9/) to automatically build term entity tables from your created files. 

9. Optionally validate the final datapackage containing all files and the schema using one of the following validator tools:
    - [Frictionless validator](#datapackage-submission)
    - [`c2m2-frictionless-datapackage` code package](#resources)
    
10. Compress the entire directory into a *.zip file and upload to the [CFDE Workbench Metadata and Data Submission System](https://data.cfde.cloud/submit/form). 

