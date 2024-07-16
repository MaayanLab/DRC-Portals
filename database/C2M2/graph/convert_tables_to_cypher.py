# TODO: Create property existence constraints
# TODO: Create property type constraints
# TODO: See if 'creation_time' can be converted into a timestamp value

ANALYSIS_TYPE = 'AnalysisType'
ANATOMY = 'Anatomy'
ASSAY_TYPE = 'AssayType'
BIOSAMPLE = 'Biosample'
COLLECTION = 'Collection'
COMPOUND = 'Compound'
DCC = 'DCC'
DATA_TYPE = 'DataType'
DISEASE = 'Disease'
DISEASE_ASSOCIATION_TYPE = 'DiseaseAssociationType'
FILE = 'File'
FILE_FORMAT = 'FileFormat'
GENE = 'Gene'
ID_NAMESPACE = 'IDNamespace'
NCBI_TAXONOMY = 'NCBITaxonomy'
PHENOTYPE = 'Phenotype'
PHENOTYPE_ASSOCIATION_TYPE = 'PhenotypeAssociationType'
PROJECT = 'Project'
PROTEIN = 'Protein'
SUBJECT = 'Subject'
SAMPLE_PREP_METHOD = 'SamplePrepMethod'
SUBJECT_ETHNICITY = 'SubjectEthnicity'
SUBJECT_RACE = 'SubjectRace'
SUBJECT_ROLE = 'SubjectRole'
SUBJECT_GRANULARITY = 'SubjectGranularity'
SUBJECT_SEX = 'SubjectSex'
SUBSTANCE = 'Substance'

TERM_NODES = [
    ANALYSIS_TYPE,
    ANATOMY,
    ASSAY_TYPE,
    COMPOUND,
    DATA_TYPE,
    DISEASE,
    DISEASE_ASSOCIATION_TYPE,
    FILE_FORMAT,
    GENE,
    NCBI_TAXONOMY,
    PHENOTYPE,
    PHENOTYPE_ASSOCIATION_TYPE,
    PROTEIN,
    SAMPLE_PREP_METHOD,
    SUBJECT_ETHNICITY,
    SUBJECT_RACE,
    SUBJECT_ROLE,
    SUBJECT_GRANULARITY,
    SUBJECT_SEX,
    SUBSTANCE,
]

CONTAINER_NODES = [
    COLLECTION,
    PROJECT
]

CORE_NODES = [
    BIOSAMPLE,
    FILE,
    SUBJECT
]

##### Begin Administration Entity Helper Strings #####
MATCH_ID_NAMESPACE_STR = 'MATCH (id_namespace:IDNamespace {id: row.id_namespace})\n'

##### Begin Container Entity Helper Strings #####
MATCH_COLLECTION_STR = 'MATCH (collection:Collection {local_id: row.collection_local_id})<-[:CONTAINS]-(collection_id_namespace:IDNamespace {id: row.collection_id_namespace})\n'
MATCH_PROJECT_STR = 'MATCH (project:Project {local_id: row.project_local_id})<-[:CONTAINS]-(project_id_namespace:IDNamespace {id: row.project_id_namespace})\n'

##### Begin Core Entity Helper Strings #####
MATCH_BIOSAMPLE_STR = 'MATCH (biosample:Biosample {local_id: row.biosample_local_id})<-[:CONTAINS]-(biosample_id_namespace:IDNamespace {id: row.biosample_id_namespace})\n'
MATCH_FILE_STR = 'MATCH (file:File {local_id: row.file_local_id})<-[:CONTAINS]-(file_id_namespace:IDNamespace {id: row.file_id_namespace})\n'
MATCH_SUBJECT_STR = 'MATCH (subject:Subject {local_id: row.subject_local_id})<-[:CONTAINS]-(subject_id_namespace:IDNamespace {id: row.subject_id_namespace})\n'

##### Begin Term Entity Helper Strings #####
STANDARD_TERM_PROPS = '{id: row.id, name: row.name, description: row.description}'
STANDARD_TERM_PROPS_WITH_SYNONYMS = '{id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms)}'
MATCH_ANATOMY_STR = 'MATCH (anatomy:Anatomy {id: row.anatomy})\n'
MATCH_COMPOUND_STR = 'MATCH (compound:Compound {id: row.compound})\n'
MATCH_DISEASE_STR = 'MATCH (disease:Disease {id: row.disease})\n'
MATCH_GENE_STR = 'MATCH (gene:Gene {id: row.gene})\n'
MATCH_PHENOTYPE_STR = 'MATCH (phenotype:Phenotype {id: row.phenotype})\n'
MATCH_PROTEIN_STR = 'MATCH (protein:Protein {id: row.protein})\n'
MATCH_SAMPLE_PREP_METHOD = 'MATCH (sample_prep_method:SamplePrepMethod {id: row.sample_prep_method})\n'
MATCH_SUBSTANCE_STR = 'MATCH (substance:Substance {id: row.substance})\n'
MATCH_TAXONOMY_STR = 'MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.taxon})\n'


##### Begin Generic Helper Strings #####
def create_unique_constraint(node_label: str, property: str):
    return f'CREATE CONSTRAINT constraint_{node_label}_{property} IF NOT EXISTS FOR (n:{node_label}) REQUIRE n.{property} IS UNIQUE;\n'


def create_range_index(node_label: str, property_name: str):
    return f'CREATE RANGE INDEX index_{node_label}_{property_name} IF NOT EXISTS FOR (n:{node_label}) ON (n.{property_name});\n'


def create_property_exists_constraint(constraint_name: str, node_label: str, property_name: str):
    return f'CREATE CONSTRAINT {constraint_name} IF NOT EXISTS FOR (n:{node_label}) REQUIRE n.{property_name} IS NOT NULL;\n'


def create_property_type_constraint(constraint_name: str, node_label: str, property_name: str, property_type: str):
    return f'CREATE CONSTRAINT {constraint_name} IF NOT EXISTS FOR (n:{node_label}) REQUIRE n.{property_name} IS :: {property_type};\n'


##### Begin CREATE/MERGE Query Strings #####
def create_analysis_type_cypher():
    # id	name	description	synonyms
    return f'CREATE (:AnalysisType {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_anatomy_cypher():
    # id	name	description	synonyms
    return f'CREATE (:Anatomy {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_assay_type_cypher():
    # id	name	description	synonyms
    return f'CREATE (:AssayType {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_biosample_cypher():
    # id_namespace	local_id	project_id_namespace	project_local_id	persistent_id	creation_time	sample_prep_method	anatomy
    props = '{local_id: row.local_id, persistent_id: row.persistent_id, creation_time: row.creation_time}'

    # Create the biosample
    create_biosample_stmt = f'CREATE (biosample:Biosample {props})\nWITH biosample, row\n'

    # Match all related term entities (optionally, so bound nodes can be NULL)
    match_anatomy_stmt = 'OPTIONAL MATCH (anatomy:Anatomy {id: row.anatomy})\n'
    match_sample_prep_method_stmt = 'OPTIONAL MATCH (sample_prep_method:SamplePrepMethod {id: row.sample_prep_method})\n'

    # Merge term relationships (if bound nodes are NULL, then the statement is ignored and discarded)
    merge_anatomy_stmt = 'MERGE (biosample)-[:SAMPLED_FROM]->(anatomy)\n'
    merge_sample_prep_method_stmt = 'MERGE (biosample)-[:PREPPED_VIA]->(sample_prep_method)\n'

    # Merge the id namespace and project
    merge_id_namespace_and_project_stmt = 'MERGE (id_namespace)-[:CONTAINS]->(biosample)<-[:CONTAINS]-(project)'

    return create_biosample_stmt + MATCH_ID_NAMESPACE_STR + MATCH_PROJECT_STR + match_anatomy_stmt + match_sample_prep_method_stmt + merge_anatomy_stmt + merge_sample_prep_method_stmt + merge_id_namespace_and_project_stmt


def create_biosample_disease_cypher():
    # biosample_id_namespace	biosample_local_id	association_type	disease
    merge_stmt = 'MERGE (biosample)-[:TESTED_FOR {observed: row.association_type = "cfde_disease_association_type:1"}]->(disease)'
    return MATCH_BIOSAMPLE_STR + MATCH_DISEASE_STR + merge_stmt


# TODO: Should confirm that the SAMPLED_FROM relationships are unique, it's not explicitly clear from the data and at time of writing I have not confirmed the schema.
def create_biosample_from_subject_cypher():
    # biosample_id_namespace	biosample_local_id	subject_id_namespace	subject_local_id	age_at_sampling
    match_subject_stmt = 'MATCH (subject_id_namespace:IDNamespace {id: row.subject_id_namespace})-[:CONTAINS]->(subject:Subject {local_id: row.subject_local_id})\n'
    match_biosample_stmt = 'MATCH (biosample_id_namespace:IDNamespace {id: row.biosample_id_namespace})-[:CONTAINS]->(biosample:Biosample {local_id: row.biosample_local_id})\n'
    merge_stmt = 'MERGE (subject)<-[sampled_from_rel:SAMPLED_FROM {age_at_sampling: COALESCE(row.age_at_sampling, -1)}]-(biosample)\nSET sampled_from_rel.age_at_sampling = row.age_at_sampling'
    return match_subject_stmt + match_biosample_stmt + merge_stmt


def create_biosample_gene_cypher():
    # biosample_id_namespace	biosample_local_id	gene
    merge_stmt = f'MERGE (gene)-[:ASSOCIATED_WITH]-(biosample)'
    return MATCH_GENE_STR + MATCH_BIOSAMPLE_STR + merge_stmt


def create_biosample_in_collection_cypher():
    # biosample_id_namespace	biosample_local_id	collection_id_namespace	collection_local_id
    match_collection_stmt = 'MATCH (:IDNamespace {id: row.collection_id_namespace})-[:CONTAINS]->(collection:Collection {local_id: row.collection_local_id})\n'
    match_biosample_stmt = 'MATCH (:IDNamespace {id: row.biosample_id_namespace})-[:CONTAINS]->(biosample:Biosample {local_id: row.biosample_local_id})\n'
    merge_stmt = 'MERGE (collection)-[:CONTAINS]->(biosample)'
    return match_collection_stmt + match_biosample_stmt + merge_stmt


def create_biosample_substance_cypher():
    # biosample_id_namespace	biosample_local_id	substance
    merge_stmt = f'MERGE (biosample)-[:ASSOCIATED_WITH]-(substance)'
    return MATCH_BIOSAMPLE_STR + MATCH_SUBSTANCE_STR + merge_stmt


def create_collection_cypher():
    # id_namespace	local_id	persistent_id	creation_time	abbreviation	name	description	has_time_series_data
    props = '{local_id: row.local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, abbreviation: row.abbreviation, name: row.name, description: row.description, has_time_series_data: row.has_time_series_data}'
    create_collection_stmt = f'CREATE (collection:Collection {props})\nWITH collection, row\n'
    merge_stmt = f'MERGE (id_namespace)-[:CONTAINS]->(collection)'
    return create_collection_stmt + MATCH_ID_NAMESPACE_STR + merge_stmt


def create_collection_anatomy_cypher():
    # collection_id_namespace	collection_local_id	anatomy
    merge_stmt = f'MERGE (anatomy)<-[:CONTAINS]-(collection)'
    return MATCH_ANATOMY_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_compound_cypher():
    # collection_id_namespace	collection_local_id	compound
    merge_stmt = f'MERGE (compound)<-[:CONTAINS]-(collection)'
    return MATCH_COMPOUND_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_defined_by_project_cypher():
    # collection_id_namespace	collection_local_id	project_id_namespace	project_local_id
    merge_stmt = f'MERGE (project)<-[:DEFINED_BY]-(collection)'
    return MATCH_PROJECT_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_disease_cypher():
    # collection_id_namespace	collection_local_id	disease
    merge_stmt = f'MERGE (collection)-[:CONTAINS]->(disease)'
    return MATCH_DISEASE_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_gene_cypher():
    # collection_id_namespace	collection_local_id	gene
    merge_stmt = f'MERGE (collection)-[:CONTAINS]->(gene)'
    return MATCH_GENE_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_in_collection_cypher():
    # superset_collection_id_namespace	superset_collection_local_id	subset_collection_id_namespace	subset_collection_local_id
    match_superset_collection = 'MATCH (:IDNamespace {id: row.superset_collection_id_namespace})-[:CONTAINS]->(superset_collection:Collection {local_id: row.superset_collection_local_id})\n'
    match_subset_collection = 'MATCH (:IDNamespace {id: row.subset_collection_id_namespace})-[:CONTAINS]->(subset_collection:Collection {local_id: row.subset_collection_local_id})\n'
    merge_stmt = 'MERGE (superset_collection)-[:IS_SUPERSET_OF]->(subset_collection)'
    return match_superset_collection + match_subset_collection + merge_stmt


def create_collection_phenotype_cypher():
    # collection_id_namespace	collection_local_id	phenotype
    merge_stmt = f'MERGE (collection)-[:CONTAINS]->(phenotype)'
    return MATCH_PHENOTYPE_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_protein_cypher():
    # collection_id_namespace	collection_local_id	protein
    merge_stmt = f'MERGE (collection)-[:CONTAINS]->(protein)'
    return MATCH_PROTEIN_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_substance_cypher():
    # collection_id_namespace	collection_local_id	substance
    merge_stmt = f'MERGE (collection)-[:CONTAINS]->(substance)'
    return MATCH_SUBSTANCE_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_taxonomy_cypher():
    # collection_id_namespace	collection_local_id	taxon
    merge_stmt = f'MERGE (collection)-[:CONTAINS]->(ncbi_taxonomy)'
    return MATCH_TAXONOMY_STR + MATCH_COLLECTION_STR + merge_stmt


def create_compound_cypher():
    # id	name	description	synonyms
    return f'CREATE (:Compound {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_container_indexes_cypher():
    return ''.join([create_range_index(label, 'local_id') for label in CONTAINER_NODES])


def create_core_indexes_cypher():
    return ''.join([create_range_index(label, 'local_id') for label in CORE_NODES])


def create_data_type_cypher():
    # id	name	description	synonyms
    return f'CREATE (:DataType {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_disease_association_type_cypher():
    # id	name	description
    return f'CREATE (:DiseaseAssociationType {STANDARD_TERM_PROPS})'


def create_dcc_cypher():
    # id	dcc_name	dcc_abbreviation	dcc_description	contact_email	contact_name	dcc_url	project_id_namespace	project_local_id
    props = '{id: row.id, name: row.dcc_name, abbreviation: row.dcc_abbreviation, description: row.dcc_description, contact_email: row.contact_email, contact_name: row.contact_name, url: row.dcc_url}'
    create_dcc_stmt = f'CREATE (dcc:DCC {props})\nWITH dcc, row\n'
    merge_stmt = f'MERGE (dcc)-[:PRODUCED]->(project)'
    return create_dcc_stmt + MATCH_PROJECT_STR + merge_stmt


def create_id_namespace_dcc_id_cypher():
    match_id_namespace_str = 'MATCH (id_namespace:IDNamespace {id: row.id_namespace_id})\nWITH id_namespace, row\n'
    match_dcc_str = 'MATCH (dcc:DCC {id: row.dcc_id})\n'
    merge_stmt = 'MERGE (id_namespace)<-[:REGISTERED]-(dcc)'
    return match_id_namespace_str + match_dcc_str + merge_stmt


def create_dcc_constraints_cypher():
    return create_unique_constraint('DCC', 'id')


def create_disease_cypher():
    # id	name	description	synonyms
    return f'CREATE (:Disease {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_file_cypher():
    # id_namespace	local_id	project_id_namespace	project_local_id	persistent_id	creation_time	size_in_bytes	uncompressed_size_in_bytes	sha256	md5	filename	file_format	compression_format	data_type	assay_type	analysis_type	mime_type	bundle_collection_id_namespace	bundle_collection_local_id	dbgap_study_id
    props = '{local_id: row.local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, size_in_bytes: row.size_in_bytes, uncompressed_size_in_bytes: row.uncompressed_size_in_bytes, sha256: row.sha256, md5: row.md5, filename: row.filename, mime_type: row.mime_type, dbgap_study_id: row.dbgap_study_id}'

    # Create the file
    create_file_stmt = f'CREATE (file:File {props})\nWITH file, row\n'

    # Match all related term entities (optionally, so bound nodes can be NULL)
    match_file_format_stmt = 'OPTIONAL MATCH (file_format:FileFormat {id: row.file_format})\n'
    match_compression_format_stmt = 'OPTIONAL MATCH (compression_format:FileFormat {id: row.compression_format})\n'
    match_analysis_type_stmt = 'OPTIONAL MATCH (analysis_type:AnalysisType {id: row.analysis_type})\n'
    match_data_type_stmt = 'OPTIONAL MATCH (data_type:DataType {id: row.data_type})\n'
    match_assay_type_stmt = 'OPTIONAL MATCH (assay_type:AssayType {id: row.assay_type})\n'

    # Merge term relationships (if bound nodes are NULL, then the statement is ignored and discarded)
    merge_file_format_stmt = 'MERGE (file)-[:IS_FILE_FORMAT]->(file_format)\n'
    merge_compression_format_stmt = 'MERGE (file)-[:IS_FILE_FORMAT]->(compression_format)\n'
    merge_analysis_type_stmt = 'MERGE (file)-[:GENERATED_BY_ANALYSIS_TYPE]->(analysis_type)\n'
    merge_data_type_stmt = 'MERGE (file)-[:IS_DATA_TYPE]->(data_type)\n'
    merge_assay_type_stmt = 'MERGE (file)-[:GENERATED_BY_ASSAY_TYPE]->(assay_type)\n'

    # Merge the id namespace and project
    merge_id_namespace_and_project_stmt = f'MERGE (id_namespace)-[:CONTAINS]->(file)<-[:CONTAINS]-(project)'

    # Note that the 'NEO4J_dbms_cypher_lenient__create__relationship' env variable must be set to 'true' for these merges to work as expected!
    return create_file_stmt + MATCH_ID_NAMESPACE_STR + MATCH_PROJECT_STR + match_file_format_stmt + match_compression_format_stmt + match_analysis_type_stmt + match_data_type_stmt + match_assay_type_stmt + merge_file_format_stmt + merge_compression_format_stmt + merge_analysis_type_stmt + merge_data_type_stmt + merge_assay_type_stmt + merge_id_namespace_and_project_stmt


def create_file_describes_biosample_cypher():
    # file_id_namespace	file_local_id	biosample_id_namespace	biosample_local_id
    merge_stmt = 'MERGE (file)-[:DESCRIBES]->(biosample)'
    return MATCH_FILE_STR + MATCH_BIOSAMPLE_STR + merge_stmt


def create_file_describes_collection_cypher():
    # file_id_namespace	file_local_id	collection_id_namespace	collection_local_id
    merge_stmt = 'MERGE (file)-[:DESCRIBES]->(collection)'
    return MATCH_FILE_STR + MATCH_COLLECTION_STR + merge_stmt


def create_file_describes_subject_cypher():
    # file_id_namespace	file_local_id	subject_id_namespace	subject_local_id
    merge_stmt = 'MERGE (file)-[:DESCRIBES]->(subject)'
    return MATCH_FILE_STR + MATCH_SUBJECT_STR + merge_stmt


def create_file_format_cypher():
    # id	name	description	synonyms
    return f'CREATE (:FileFormat {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_file_in_collection_cypher():
    # file_id_namespace	file_local_id	collection_id_namespace	collection_local_id
    merge_stmt = 'MERGE (collection)-[:CONTAINS]->(file)'
    return MATCH_COLLECTION_STR + MATCH_FILE_STR + merge_stmt


def create_gene_cypher():
    # id	name	description	synonyms	organism
    props = '{id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms), organism: row.organism}'
    create_gene_stmt = f'CREATE (gene:Gene {props})\nWITH gene, row\n'
    match_taxonomy_stmt = 'MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.organism})\n'
    merge_stmt = 'MERGE (gene)-[:HAS_SOURCE]->(ncbi_taxonomy)'
    return create_gene_stmt + match_taxonomy_stmt + merge_stmt


def create_id_namespace_cypher():
    # id	abbreviation	name	description
    props = '{id: row.id, abbreviation: row.abbreviation, name: row.name, description: row.description}'
    return f'CREATE (:IDNamespace {props})'


def create_id_namespace_constraints_cypher():
    return create_unique_constraint('IDNamespace', 'id')


def create_ncbi_taxonomy_cypher():
    # id	clade	name	description	synonyms
    props = '{id: row.id, clade: row.clade, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms)}'
    return f'CREATE (:NCBITaxonomy {props})'


def create_phenotype_cypher():
    # id	name	description	synonyms
    return f'CREATE (:Phenotype {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_phenotype_association_type_cypher():
    # id	name	description
    return f'CREATE (:PhenotypeAssociationType {STANDARD_TERM_PROPS})'


def create_phenotype_disease_cypher():
    # phenotype	disease
    merge_stmt = 'MERGE (phenotype)-[:ASSOCIATED_WITH]-(disease)'
    return MATCH_PHENOTYPE_STR + MATCH_DISEASE_STR + merge_stmt


def create_phenotype_gene_cypher():
    # phenotype	gene
    merge_stmt = 'MERGE (phenotype)-[:ASSOCIATED_WITH]-(gene)'
    return MATCH_PHENOTYPE_STR + MATCH_GENE_STR + merge_stmt


def create_project_cypher():
    # id_namespace	local_id	persistent_id	creation_time	abbreviation	name	description
    props = '{local_id: row.local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, abbreviation: row.abbreviation, name: row.name, description: row.description}'
    create_project_stmt = f'CREATE (project:Project {props})\nWITH project, row\n'
    merge_stmt = f'MERGE (id_namespace)-[:CONTAINS]->(project)'
    return create_project_stmt + MATCH_ID_NAMESPACE_STR + merge_stmt


def create_project_in_project_cypher():
    # parent_project_id_namespace	parent_project_local_id	child_project_id_namespace	child_project_local_id
    match_parent_project = 'MATCH (:IDNamespace {id: row.parent_project_id_namespace})-[:CONTAINS]->(parent_project:Project {local_id: row.parent_project_local_id})\n'
    match_child_project = 'MATCH (:IDNamespace {id: row.child_project_id_namespace})-[:CONTAINS]->(child_project:Project {local_id: row.child_project_local_id})\n'
    merge_stmt = 'MERGE (parent_project)-[:IS_PARENT_OF]->(child_project)'
    return match_parent_project + match_child_project + merge_stmt


def create_protein_cypher():
    # id	name	description	synonyms	organism
    props = '{id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms)}'
    create_protein_stmt = f'CREATE (protein:Protein {props})\nWITH protein, row\n'
    match_taxonomy_stmt = 'OPTIONAL MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.organism})\n'
    merge_stmt = 'MERGE (protein)-[:HAS_SOURCE]->(ncbi_taxonomy)'
    return create_protein_stmt + match_taxonomy_stmt + merge_stmt


def create_protein_gene_cypher():
    # protein	gene
    merge_stmt = 'MERGE (protein)-[:ASSOCIATED_WITH]-(gene)'
    return MATCH_PROTEIN_STR + MATCH_GENE_STR + merge_stmt


def create_subject_cypher():
    # id_namespace	local_id	project_id_namespace	project_local_id	persistent_id	creation_time	granularity	sex	ethnicity	age_at_enrollment
    props = '{local_id: row.local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, granularity: row.granularity, sex: row.sex, ethnicity: row.ethnicity, age_at_enrollment: row.age_at_enrollment}'

    # Create the subject
    create_subject_stmt = f'CREATE (subject:Subject {props})\nWITH subject, row\n'

    # Match all related term entities (optionally, so bound nodes can be NULL)
    match_subject_ethnicity_stmt = 'OPTIONAL MATCH (subject_ethnicity:SubjectEthnicity {id: row.ethnicity})\n'
    match_subject_granularity_stmt = 'OPTIONAL MATCH (subject_granularity:SubjectGranularity {id: row.granularity})\n'
    match_subject_sex_stmt = 'OPTIONAL MATCH (subject_sex:SubjectSex {id: row.sex})\n'

    # Merge term relationships (if bound nodes are NULL, then the statement is ignored and discarded)
    merge_subject_ethnicity_stmt = 'MERGE (subject)-[:IS_ETHNICITY]->(subject_ethnicity)\n'
    merge_subject_granularity_stmt = 'MERGE (subject)-[:IS_GRANULARITY]->(subject_granularity)\n'
    merge_subject_sex_stmt = 'MERGE (subject)-[:IS_SEX]->(subject_sex)\n'

    # Merge the id namespace and project
    merge_id_namespace_and_project_stmt = f'MERGE (id_namespace)-[:CONTAINS]->(subject)<-[:CONTAINS]-(project)'

    return create_subject_stmt + MATCH_ID_NAMESPACE_STR + MATCH_PROJECT_STR + match_subject_ethnicity_stmt + match_subject_granularity_stmt + match_subject_sex_stmt + merge_subject_ethnicity_stmt + merge_subject_granularity_stmt + merge_subject_sex_stmt + merge_id_namespace_and_project_stmt


def create_sample_prep_method_cypher():
    # id	name	description	synonyms
    return f'CREATE (:SamplePrepMethod {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_subject_disease_cypher():
    # subject_id_namespace	subject_local_id	association_type	disease
    merge_stmt = 'MERGE (subject)-[:TESTED_FOR {observed: row.association_type = "cfde_disease_association_type:1"}]->(disease)'
    return MATCH_SUBJECT_STR + MATCH_DISEASE_STR + merge_stmt


def create_subject_ethnicity_cypher():
    # id	name	description
    return f'CREATE (:SubjectEthnicity {STANDARD_TERM_PROPS})'


def create_subject_granularity_cypher():
    # id	name	description
    return f'CREATE (:SubjectGranularity {STANDARD_TERM_PROPS})'


def create_subject_in_collection_cypher():
    # subject_id_namespace	subject_local_id	collection_id_namespace	collection_local_id
    merge_stmt = 'MERGE (collection)-[:CONTAINS]->(subject)'
    return MATCH_COLLECTION_STR + MATCH_SUBJECT_STR + merge_stmt


def create_subject_phenotype_cypher():
    # subject_id_namespace	subject_local_id	association_type	phenotype
    merge_stmt = 'MERGE (subject)-[:TESTED_FOR {observed: row.association_type = "cfde_phenotype_association_type:1"}]->(phenotype)'
    return MATCH_SUBJECT_STR + MATCH_PHENOTYPE_STR + merge_stmt


def create_subject_race_cypher():
    # subject_id_namespace	subject_local_id	race
    match_subject_race_stmt = 'MATCH (subject_race:SubjectRace {id: row.race})\n'
    merge_stmt = 'MERGE (subject)-[:IS_RACE]->(subject_race)\n'
    set_stmt = 'SET subject.race = row.race'
    return match_subject_race_stmt + MATCH_SUBJECT_STR + merge_stmt + set_stmt


def create_subject_race_cv_cypher():
    # id	name	description
    return f'CREATE (:SubjectRace {STANDARD_TERM_PROPS})'


def create_subject_role_cypher():
    # id	name	description
    return f'CREATE (:SubjectRole {STANDARD_TERM_PROPS})'


def create_subject_role_taxonomy_cypher():
    # subject_id_namespace	subject_local_id	role_id	taxonomy_id
    match_taxonomy_stmt = 'MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.taxonomy_id})\n'
    merge_stmt = 'MERGE (subject)-[:ASSOCIATED_WITH {role_id: row.role_id}]-(ncbi_taxonomy)'
    return MATCH_SUBJECT_STR + match_taxonomy_stmt + merge_stmt


def create_subject_sex_cypher():
    # id	name	description
    return f'CREATE (:SubjectSex {STANDARD_TERM_PROPS})'


def create_subject_substance_cypher():
    # subject_id_namespace	subject_local_id	substance
    merge_stmt = 'MERGE (subject)-[:ASSOCIATED_WITH]-(substance)'
    return MATCH_SUBJECT_STR + MATCH_SUBSTANCE_STR + merge_stmt


def create_substance_cypher():
    # id	name	description	synonyms	compound
    create_substance_stmt = f'CREATE (substance:Substance {STANDARD_TERM_PROPS_WITH_SYNONYMS})\nWITH substance, row\n'
    merge_stmt = 'MERGE (substance)-[:ASSOCIATED_WITH]-(compound)'
    return create_substance_stmt + MATCH_COMPOUND_STR + merge_stmt


def create_term_constraints_cypher():
    term_id_constraints = ''.join([create_unique_constraint(label, 'id') for label in TERM_NODES])
    return term_id_constraints


def create_load_query(table_name: str, stmts: str):
    formatted_stmts = '\n\t'.join(stmts.split('\n'))
    load_csv_stmt = f"LOAD CSV WITH HEADERS FROM 'file:///data/{table_name}.tsv' AS row FIELDTERMINATOR '\\t'\n"
    call_stmt = f'CALL {{\n\tWITH row\n\t{formatted_stmts}\n}} IN TRANSACTIONS OF 10000 ROWS\n'
    return load_csv_stmt + call_stmt


def main():
    # Order of this list doesn't matter in the context of this script, but it *does* matter when the
    # cypher files are actually loaded into the database. So, this list is arranged in the order they
    # should be loaded, for clarity and consistency.
    tablenames_and_query_fns = [
        # Add all constraints/indexes first to help with query performance...
        ('id_namespace_constraints', create_id_namespace_constraints_cypher),
        ('container_indexes', create_container_indexes_cypher),
        ('dcc_constraints', create_dcc_constraints_cypher),
        ('term_constraints', create_term_constraints_cypher),
        ('core_indexes', create_core_indexes_cypher),
        # ID Namespace must be added first...
        ('id_namespace', create_id_namespace_cypher),
        # Container entities next...
        ('collection', create_collection_cypher),
        ('project', create_project_cypher),
        # DCC relies on project existing, so we add it after adding container entities...
        ('dcc', create_dcc_cypher),
        ('id_namespace_dcc_id', create_id_namespace_dcc_id_cypher),
        # Term entities next...
        ('ncbi_taxonomy', create_ncbi_taxonomy_cypher),  # We do taxonomy first since gene and protein rely on it
        ('compound', create_compound_cypher),  # Followed by compound, since substance relies on it
        ('disease', create_disease_cypher),
        ('disease_association_type', create_disease_association_type_cypher),
        ('gene', create_gene_cypher),
        ('phenotype', create_phenotype_cypher),
        ('phenotype_association_type', create_phenotype_association_type_cypher),
        ('protein', create_protein_cypher),
        ('substance', create_substance_cypher),
        ('sample_prep_method', create_sample_prep_method_cypher),
        ('anatomy', create_anatomy_cypher),
        ('subject_race_cv', create_subject_race_cv_cypher),
        ('subject_role', create_subject_role_cypher),
        ('subject_ethnicity', create_subject_ethnicity_cypher),
        ('subject_granularity', create_subject_granularity_cypher),
        ('subject_sex', create_subject_sex_cypher),
        ('analysis_type', create_analysis_type_cypher),
        ('assay_type', create_assay_type_cypher),
        ('data_type', create_data_type_cypher),
        ('file_format', create_file_format_cypher),
        # Then core entities...
        ('biosample', create_biosample_cypher),
        ('file', create_file_cypher),
        ('subject', create_subject_cypher),
        # Container-container relationships next...
        ('collection_defined_by_project', create_collection_defined_by_project_cypher),
        ('collection_in_collection', create_collection_in_collection_cypher),
        ('project_in_project', create_project_in_project_cypher),
        # Then core-core relationships...
        ('biosample_from_subject', create_biosample_from_subject_cypher),
        ('file_describes_biosample', create_file_describes_biosample_cypher),
        ('file_describes_subject', create_file_describes_subject_cypher),
        # And core-container relationships...
        ('biosample_in_collection', create_biosample_in_collection_cypher),
        ('file_describes_collection', create_file_describes_collection_cypher),
        ('file_in_collection', create_file_in_collection_cypher),
        ('subject_in_collection', create_subject_in_collection_cypher),
        # Then term-term relationships...
        ('phenotype_disease', create_phenotype_disease_cypher),
        ('phenotype_gene', create_phenotype_gene_cypher),
        ('protein_gene', create_protein_gene_cypher),
        # Next core-term relationships...
        ('biosample_disease', create_biosample_disease_cypher),
        ('biosample_gene', create_biosample_gene_cypher),
        ('biosample_substance', create_biosample_substance_cypher),
        ('subject_disease', create_subject_disease_cypher),
        ('subject_phenotype', create_subject_phenotype_cypher),
        ('subject_race', create_subject_race_cypher),
        ('subject_role_taxonomy', create_subject_role_taxonomy_cypher),
        ('subject_substance', create_subject_substance_cypher),
        # And finally container-term relationships...
        ('collection_anatomy', create_collection_anatomy_cypher),
        ('collection_compound', create_collection_compound_cypher),
        ('collection_disease', create_collection_disease_cypher),
        ('collection_gene', create_collection_gene_cypher),
        ('collection_phenotype', create_collection_phenotype_cypher),
        ('collection_protein', create_collection_protein_cypher),
        ('collection_substance', create_collection_substance_cypher),
        ('collection_taxonomy', create_collection_taxonomy_cypher)
    ]

    for table, query_builder_fn in tablenames_and_query_fns:
        with open(f'./import/cypher/{table}.cypher', 'w') as load_table_fp:
            # Node constraints/indexes are special load files, we don't need to load from a TSV for them
            if table in ['id_namespace_constraints', 'container_indexes', 'dcc_constraints', 'term_constraints', 'core_indexes']:
                load_table_fp.write(query_builder_fn())
            else:
                load_table_fp.write(create_load_query(table, query_builder_fn()))


if __name__ == '__main__':
    main()
