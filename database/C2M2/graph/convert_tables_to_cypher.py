# TODO: Create property existence constraints
# TODO: Create property type constraints
# TODO: See if 'creation_time' can be converted into a timestamp value

ANALYSIS_TYPE = 'AnalysisType'
ANATOMY = 'Anatomy'
ASSAY_TYPE = 'AssayType'
BIOFLUID = 'Biofluid'
BIOSAMPLE = 'Biosample'
COLLECTION = 'Collection'
COMPOUND = 'Compound'
DCC = 'DCC'
DATA_TYPE = 'DataType'
DISEASE = 'Disease'
FILE = 'File'
FILE_FORMAT = 'FileFormat'
GENE = 'Gene'
ID_NAMESPACE = 'IDNamespace'
NCBI_TAXONOMY = 'NCBITaxonomy'
PHENOTYPE = 'Phenotype'
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

ADMIN_NODES = [
    DCC,
    ID_NAMESPACE
]

TERM_NODES = [
    ANALYSIS_TYPE,
    ANATOMY,
    ASSAY_TYPE,
    BIOFLUID,
    COMPOUND,
    DATA_TYPE,
    DISEASE,
    FILE_FORMAT,
    GENE,
    NCBI_TAXONOMY,
    PHENOTYPE,
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

ALL_NODES = TERM_NODES + CONTAINER_NODES + CORE_NODES + ADMIN_NODES

CONTAINS = "CONTAINS"
HAS_SOURCE = "HAS_SOURCE"
ASSOCIATED_WITH = "ASSOCIATED_WITH"
SAMPLED_FROM = "SAMPLED_FROM"
PREPPED_VIA = "PREPPED_VIA"
GENERATED_BY_ASSAY_TYPE = "GENERATED_BY_ASSAY_TYPE"
IS_FILE_FORMAT = "IS_FILE_FORMAT"
GENERATED_BY_ANALYSIS_TYPE = "GENERATED_BY_ANALYSIS_TYPE"
IS_DATA_TYPE = "IS_DATA_TYPE"
IS_GRANULARITY = "IS_GRANULARITY"
IS_SEX = "IS_SEX"
IS_ETHNICITY = "IS_ETHNICITY"
DEFINED_BY = "DEFINED_BY"
IS_SUPERSET_OF = "IS_SUPERSET_OF"
IS_PARENT_OF = "IS_PARENT_OF"
DESCRIBES = "DESCRIBES"
TESTED_FOR = "TESTED_FOR"
IS_RACE = "IS_RACE"
HAS_SYNONYM = "HAS_SYNONYM"
REGISTERED = "REGISTERED"

ALL_RELATIONSHIPS = [
    CONTAINS,
    HAS_SOURCE,
    ASSOCIATED_WITH,
    SAMPLED_FROM,
    PREPPED_VIA,
    GENERATED_BY_ASSAY_TYPE,
    IS_FILE_FORMAT,
    GENERATED_BY_ANALYSIS_TYPE,
    IS_DATA_TYPE,
    IS_GRANULARITY,
    IS_SEX,
    IS_ETHNICITY,
    DEFINED_BY,
    IS_SUPERSET_OF,
    IS_PARENT_OF,
    DESCRIBES,
    TESTED_FOR,
    IS_RACE,
    HAS_SYNONYM,
    REGISTERED,
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
STANDARD_TERM_PROPS = '{id: row.id, name: row.name, description: row.description, _uuid: randomUUID()}'
STANDARD_TERM_PROPS_WITH_SYNONYMS = '{id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms), _uuid: randomUUID()}'
MATCH_ANATOMY_STR = 'MATCH (anatomy:Anatomy {id: row.anatomy})\n'
MATCH_BIOFLUID_STR = 'MATCH (biofluid:Biofluid {id: row.biofluid})\n'
MATCH_COMPOUND_STR = 'MATCH (compound:Compound {id: row.compound})\n'
MATCH_DISEASE_STR = 'MATCH (disease:Disease {id: row.disease})\n'
MATCH_GENE_STR = 'MATCH (gene:Gene {id: row.gene})\n'
MATCH_PHENOTYPE_STR = 'MATCH (phenotype:Phenotype {id: row.phenotype})\n'
MATCH_PROTEIN_STR = 'MATCH (protein:Protein {id: row.protein})\n'
MATCH_SAMPLE_PREP_METHOD = 'MATCH (sample_prep_method:SamplePrepMethod {id: row.sample_prep_method})\n'
MATCH_SUBSTANCE_STR = 'MATCH (substance:Substance {id: row.substance})\n'
MATCH_TAXONOMY_STR = 'MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.taxon})\n'


##### Begin Generic Helper Strings #####
def create_node_unique_constraint(node_label: str, property: str):
    return f'CREATE CONSTRAINT constraint_{node_label}_{property} IF NOT EXISTS FOR (n:{node_label}) REQUIRE n.{property} IS UNIQUE;'


def create_relationship_unique_constraint(relationship_type: str, property: str):
    return f'CREATE CONSTRAINT constraint_{relationship_type}_{property} IF NOT EXISTS FOR ()-[r:{relationship_type}]->() REQUIRE (r.{property}) IS UNIQUE;'


def create_range_index(node_label: str, property_name: str):
    return f'CREATE RANGE INDEX index_{node_label}_{property_name} IF NOT EXISTS FOR (n:{node_label}) ON (n.{property_name});\n'


def create_text_index(node_label: str, property_name: str):
    return f'CREATE TEXT INDEX index_{node_label}_{property_name} IF NOT EXISTS FOR (n:{node_label}) ON (n.{property_name});\n'


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


def create_biofluid_cypher():
    # id	name	description	synonyms
    return f'CREATE (:Biofluid {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_biosample_cypher():
    # id_namespace	local_id	project_id_namespace	project_local_id	persistent_id	creation_time	sample_prep_method	anatomy
    props = '{local_id: row.local_id, persistent_id: row.persistent_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id, creation_time: row.creation_time, _uuid: randomUUID()}'

    return f'CREATE (biosample:Biosample {props})'


def create_biosample_relationships_cypher():
    # id_namespace	local_id	project_id_namespace	project_local_id	persistent_id	creation_time	sample_prep_method  anatomy biofluid
    match_biosample_stmt = 'MATCH (biosample:Biosample {local_id: row.local_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id})\n'

    remove_props_stmt = 'REMOVE biosample.id_namespace\nREMOVE biosample.project_local_id\n'

    # Match all related term entities (optionally, so bound nodes can be NULL) and merge relationships (if bound nodes are NULL, then the statement is ignored and discarded)
    with_stmt = 'WITH biosample, row\n'

    match_anatomy_stmt = 'OPTIONAL MATCH (anatomy:Anatomy {id: row.anatomy})\n'
    merge_anatomy_stmt = 'MERGE (biosample)-[:SAMPLED_FROM {_uuid: randomUUID()}]->(anatomy)\n'

    match_biofluid_stmt = 'OPTIONAL MATCH (biofluid:Biofluid {id: row.biofluid})\n'
    merge_biofluid_stmt = 'MERGE (biosample)-[:SAMPLED_FROM {_uuid: randomUUID()}]->(biofluid)\n'

    match_sample_prep_method_stmt = 'OPTIONAL MATCH (sample_prep_method:SamplePrepMethod {id: row.sample_prep_method})\n'
    merge_sample_prep_method_stmt = 'MERGE (biosample)-[:PREPPED_VIA {_uuid: randomUUID()}]->(sample_prep_method)\n'

    # Merge the id namespace and project
    merge_id_namespace_and_project_stmt = 'MERGE (id_namespace)-[:CONTAINS {_uuid: randomUUID()}]->(biosample)<-[:CONTAINS {_uuid: randomUUID()}]-(project)'

    return (
        match_biosample_stmt +
        remove_props_stmt +
        with_stmt +
        match_anatomy_stmt +
        merge_anatomy_stmt +
        with_stmt +
        match_biofluid_stmt +
        merge_biofluid_stmt +
        with_stmt +
        match_sample_prep_method_stmt +
        merge_sample_prep_method_stmt +
        with_stmt +
        MATCH_ID_NAMESPACE_STR +
        MATCH_PROJECT_STR +
        merge_id_namespace_and_project_stmt
    )


def create_biosample_disease_cypher():
    # biosample_id_namespace	biosample_local_id	association_type	disease
    merge_stmt = 'MERGE (biosample)-[:TESTED_FOR {observed: row.association_type = "cfde_disease_association_type:1", _uuid: randomUUID()}]->(disease)'
    return MATCH_BIOSAMPLE_STR + MATCH_DISEASE_STR + merge_stmt


# TODO: Should confirm that the SAMPLED_FROM relationships are unique, it's not explicitly clear from the data and at time of writing I have not confirmed the schema.
def create_biosample_from_subject_cypher():
    # biosample_id_namespace	biosample_local_id	subject_id_namespace	subject_local_id	age_at_sampling
    match_subject_stmt = 'MATCH (subject_id_namespace:IDNamespace {id: row.subject_id_namespace})-[:CONTAINS]->(subject:Subject {local_id: row.subject_local_id})\n'
    match_biosample_stmt = 'MATCH (biosample_id_namespace:IDNamespace {id: row.biosample_id_namespace})-[:CONTAINS]->(biosample:Biosample {local_id: row.biosample_local_id})\n'
    merge_stmt = 'MERGE (subject)<-[sampled_from_rel:SAMPLED_FROM {age_at_sampling: COALESCE(row.age_at_sampling, -1), _uuid: randomUUID()}]-(biosample)'
    return match_subject_stmt + match_biosample_stmt + merge_stmt


def create_biosample_gene_cypher():
    # biosample_id_namespace	biosample_local_id	gene
    merge_stmt = 'MERGE (gene)-[:ASSOCIATED_WITH {_uuid: randomUUID()}]-(biosample)'
    return MATCH_GENE_STR + MATCH_BIOSAMPLE_STR + merge_stmt


def create_biosample_in_collection_cypher():
    # biosample_id_namespace	biosample_local_id	collection_id_namespace	collection_local_id
    match_collection_stmt = 'MATCH (:IDNamespace {id: row.collection_id_namespace})-[:CONTAINS]->(collection:Collection {local_id: row.collection_local_id})\n'
    match_biosample_stmt = 'MATCH (:IDNamespace {id: row.biosample_id_namespace})-[:CONTAINS]->(biosample:Biosample {local_id: row.biosample_local_id})\n'
    merge_stmt = 'MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(biosample)'
    return match_collection_stmt + match_biosample_stmt + merge_stmt


def create_biosample_substance_cypher():
    # biosample_id_namespace	biosample_local_id	substance
    merge_stmt = 'MERGE (biosample)-[:ASSOCIATED_WITH {_uuid: randomUUID()}]-(substance)'
    return MATCH_BIOSAMPLE_STR + MATCH_SUBSTANCE_STR + merge_stmt


def create_collection_cypher():
    # id_namespace	local_id	persistent_id	creation_time	abbreviation	name	description	has_time_series_data
    props = '{local_id: row.local_id, id_namespace: row.id_namespace, persistent_id: row.persistent_id, creation_time: row.creation_time, abbreviation: row.abbreviation, name: row.name, description: row.description, has_time_series_data: row.has_time_series_data, _uuid: randomUUID()}'
    return f'CREATE (collection:Collection {props})'


def create_collection_relationships_cypher():
    # id_namespace	local_id	persistent_id	creation_time	abbreviation	name	description	has_time_series_data
    match_collection_stmt = 'MATCH (collection:Collection {local_id: row.local_id, id_namespace: row.id_namespace})\n'
    remove_prop_stmt = 'REMOVE collection.id_namespace\n'
    with_stmt = 'WITH collection, row\n'
    merge_stmt = 'MERGE (id_namespace)-[:CONTAINS {_uuid: randomUUID()}]->(collection)'
    return match_collection_stmt + remove_prop_stmt + with_stmt + MATCH_ID_NAMESPACE_STR + merge_stmt


def create_collection_anatomy_cypher():
    # collection_id_namespace	collection_local_id	anatomy
    merge_stmt = 'MERGE (anatomy)<-[:CONTAINS {_uuid: randomUUID()}]-(collection)'
    return MATCH_ANATOMY_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_biofluid_cypher():
    # collection_id_namespace	collection_local_id	biofluid
    merge_stmt = 'MERGE (biofluid)<-[:CONTAINS {_uuid: randomUUID()}]-(collection)'
    return MATCH_BIOFLUID_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_compound_cypher():
    # collection_id_namespace	collection_local_id	compound
    merge_stmt = 'MERGE (compound)<-[:CONTAINS {_uuid: randomUUID()}]-(collection)'
    return MATCH_COMPOUND_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_defined_by_project_cypher():
    # collection_id_namespace	collection_local_id	project_id_namespace	project_local_id
    merge_stmt = 'MERGE (project)<-[:DEFINED_BY {_uuid: randomUUID()}]-(collection)'
    return MATCH_PROJECT_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_disease_cypher():
    # collection_id_namespace	collection_local_id	disease
    merge_stmt = 'MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(disease)'
    return MATCH_DISEASE_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_gene_cypher():
    # collection_id_namespace	collection_local_id	gene
    merge_stmt = 'MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(gene)'
    return MATCH_GENE_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_in_collection_cypher():
    # superset_collection_id_namespace	superset_collection_local_id	subset_collection_id_namespace	subset_collection_local_id
    match_superset_collection = 'MATCH (:IDNamespace {id: row.superset_collection_id_namespace})-[:CONTAINS]->(superset_collection:Collection {local_id: row.superset_collection_local_id})\n'
    match_subset_collection = 'MATCH (:IDNamespace {id: row.subset_collection_id_namespace})-[:CONTAINS]->(subset_collection:Collection {local_id: row.subset_collection_local_id})\n'
    merge_stmt = 'MERGE (superset_collection)-[:IS_SUPERSET_OF {_uuid: randomUUID()}]->(subset_collection)'
    return match_superset_collection + match_subset_collection + merge_stmt


def create_collection_phenotype_cypher():
    # collection_id_namespace	collection_local_id	phenotype
    merge_stmt = 'MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(phenotype)'
    return MATCH_PHENOTYPE_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_protein_cypher():
    # collection_id_namespace	collection_local_id	protein
    merge_stmt = 'MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(protein)'
    return MATCH_PROTEIN_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_substance_cypher():
    # collection_id_namespace	collection_local_id	substance
    merge_stmt = 'MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(substance)'
    return MATCH_SUBSTANCE_STR + MATCH_COLLECTION_STR + merge_stmt


def create_collection_taxonomy_cypher():
    # collection_id_namespace	collection_local_id	taxon
    merge_stmt = 'MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(ncbi_taxonomy)'
    return MATCH_TAXONOMY_STR + MATCH_COLLECTION_STR + merge_stmt


def create_compound_cypher():
    # id	name	description	synonyms
    return f'CREATE (:Compound {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_container_indexes_cypher():
    return ''.join(
        [create_range_index(label, 'local_id') for label in CONTAINER_NODES] +
        [create_text_index(label, 'name') for label in CONTAINER_NODES] +
        [create_text_index(label, 'persistent_id')
         for label in CONTAINER_NODES]
    )


def create_core_indexes_cypher():
    return ''.join(
        [create_range_index(label, 'local_id') for label in CORE_NODES] +
        [create_text_index(label, 'persistent_id') for label in CORE_NODES]
    )


def create_admin_indexes_cypher():
    return ''.join(
        [create_text_index(label, 'name') for label in ADMIN_NODES]
    )


def create_data_type_cypher():
    # id	name	description	synonyms
    return f'CREATE (:DataType {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_dcc_cypher():
    # id	dcc_name	dcc_abbreviation	dcc_description	contact_email	contact_name	dcc_url	project_id_namespace	project_local_id
    props = '{id: row.id, name: row.dcc_name, abbreviation: row.dcc_abbreviation, description: row.dcc_description, contact_email: row.contact_email, contact_name: row.contact_name, url: row.dcc_url, _uuid: randomUUID()}'
    create_dcc_stmt = f'CREATE (dcc:DCC {props})'
    return create_dcc_stmt


def create_id_namespace_dcc_id_cypher():
    match_id_namespace_str = 'MATCH (id_namespace:IDNamespace {id: row.id_namespace_id})\nWITH id_namespace, row\n'
    match_dcc_str = 'MATCH (dcc:DCC {id: row.dcc_id})\n'
    merge_stmt = 'MERGE (id_namespace)<-[:REGISTERED {_uuid: randomUUID()}]-(dcc)'
    return match_id_namespace_str + match_dcc_str + merge_stmt


def create_dcc_constraints_cypher():
    return create_node_unique_constraint('DCC', 'id')


def create_disease_cypher():
    # id	name	description	synonyms
    return f'CREATE (:Disease {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_file_cypher():
    # id_namespace	local_id	project_id_namespace	project_local_id	persistent_id	creation_time	size_in_bytes	uncompressed_size_in_bytes	sha256	md5	filename	file_format	compression_format	data_type	assay_type	analysis_type	mime_type	bundle_collection_id_namespace	bundle_collection_local_id	dbgap_study_id  access_url
    props = '{local_id: row.local_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, size_in_bytes: row.size_in_bytes, uncompressed_size_in_bytes: row.uncompressed_size_in_bytes, sha256: row.sha256, md5: row.md5, filename: row.filename, mime_type: row.mime_type, dbgap_study_id: row.dbgap_study_id, access_url: row.access_url, _uuid: randomUUID()}'
    return f'CREATE (file:File {props})'


def create_file_relationships_cypher():
    match_file_stmt = 'MATCH (file:File {local_id: row.local_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id})\n'

    remove_props_stmt = 'REMOVE file.id_namespace\nREMOVE file.project_local_id\n'

    # Match all related term entities (optionally, so bound nodes can be NULL) and merge term relationships (if bound nodes are NULL, then the statement is ignored and discarded)
    with_stmt = 'WITH file, row\n'

    match_file_format_stmt = 'OPTIONAL MATCH (file_format:FileFormat {id: row.file_format})\n'
    merge_file_format_stmt = 'MERGE (file)-[:IS_FILE_FORMAT {_uuid: randomUUID()}]->(file_format)\n'

    match_compression_format_stmt = 'OPTIONAL MATCH (compression_format:FileFormat {id: row.compression_format})\n'
    merge_compression_format_stmt = 'MERGE (file)-[:IS_FILE_FORMAT {_uuid: randomUUID()}]->(compression_format)\n'

    match_analysis_type_stmt = 'OPTIONAL MATCH (analysis_type:AnalysisType {id: row.analysis_type})\n'
    merge_analysis_type_stmt = 'MERGE (file)-[:GENERATED_BY_ANALYSIS_TYPE {_uuid: randomUUID()}]->(analysis_type)\n'

    match_data_type_stmt = 'OPTIONAL MATCH (data_type:DataType {id: row.data_type})\n'
    merge_data_type_stmt = 'MERGE (file)-[:IS_DATA_TYPE {_uuid: randomUUID()}]->(data_type)\n'

    match_assay_type_stmt = 'OPTIONAL MATCH (assay_type:AssayType {id: row.assay_type})\n'
    merge_assay_type_stmt = 'MERGE (file)-[:GENERATED_BY_ASSAY_TYPE {_uuid: randomUUID()}]->(assay_type)\n'

    # Merge the id namespace and project
    merge_id_namespace_and_project_stmt = 'MERGE (id_namespace)-[:CONTAINS {_uuid: randomUUID()}]->(file)<-[:CONTAINS {_uuid: randomUUID()}]-(project)'

    # Note that the 'NEO4J_dbms_cypher_lenient__create__relationship' env variable must be set to 'true' for these merges to work as expected!
    return (
        match_file_stmt +
        remove_props_stmt +
        with_stmt +
        match_file_format_stmt +
        merge_file_format_stmt +
        with_stmt +
        match_compression_format_stmt +
        merge_compression_format_stmt +
        with_stmt +
        match_analysis_type_stmt +
        merge_analysis_type_stmt +
        with_stmt +
        match_data_type_stmt +
        merge_data_type_stmt +
        with_stmt +
        match_assay_type_stmt +
        merge_assay_type_stmt +
        with_stmt +
        MATCH_ID_NAMESPACE_STR +
        MATCH_PROJECT_STR +
        merge_id_namespace_and_project_stmt
    )


def create_file_describes_biosample_cypher():
    # file_id_namespace	file_local_id	biosample_id_namespace	biosample_local_id
    merge_stmt = 'MERGE (file)-[:DESCRIBES {_uuid: randomUUID()}]->(biosample)'
    return MATCH_FILE_STR + MATCH_BIOSAMPLE_STR + merge_stmt


def create_file_describes_collection_cypher():
    # file_id_namespace	file_local_id	collection_id_namespace	collection_local_id
    merge_stmt = 'MERGE (file)-[:DESCRIBES {_uuid: randomUUID()}]->(collection)'
    return MATCH_FILE_STR + MATCH_COLLECTION_STR + merge_stmt


def create_file_describes_subject_cypher():
    # file_id_namespace	file_local_id	subject_id_namespace	subject_local_id
    merge_stmt = 'MERGE (file)-[:DESCRIBES {_uuid: randomUUID()}]->(subject)'
    return MATCH_FILE_STR + MATCH_SUBJECT_STR + merge_stmt


def create_file_format_cypher():
    # id	name	description	synonyms
    return f'CREATE (:FileFormat {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_file_in_collection_cypher():
    # file_id_namespace	file_local_id	collection_id_namespace	collection_local_id
    merge_stmt = 'MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(file)'
    return MATCH_COLLECTION_STR + MATCH_FILE_STR + merge_stmt


def create_gene_cypher():
    # id	name	description	synonyms	organism
    props = '{id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms), organism: row.organism, _uuid: randomUUID()}'
    return f'CREATE (gene:Gene {props})'


def create_gene_relationships_cypher():
    # id	name	description	synonyms	organism
    match_gene_stmt = 'MATCH (gene:Gene {id: row.id})\n'
    match_taxonomy_stmt = 'MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.organism})\n'
    merge_stmt = 'MERGE (gene)-[:HAS_SOURCE {_uuid: randomUUID()}]->(ncbi_taxonomy)'
    return match_gene_stmt + match_taxonomy_stmt + merge_stmt


def create_id_namespace_cypher():
    # id	abbreviation	name	description
    props = '{id: row.id, abbreviation: row.abbreviation, name: row.name, description: row.description, _uuid: randomUUID()}'
    return f'CREATE (:IDNamespace {props})'


def create_id_namespace_constraints_cypher():
    return create_node_unique_constraint('IDNamespace', 'id')


def create_ncbi_taxonomy_cypher():
    # id	clade	name	description	synonyms
    props = '{id: row.id, clade: row.clade, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms), _uuid: randomUUID()}'
    return f'CREATE (:NCBITaxonomy {props})'


def create_phenotype_cypher():
    # id	name	description	synonyms
    return f'CREATE (:Phenotype {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_phenotype_disease_cypher():
    # phenotype	disease
    merge_stmt = 'MERGE (phenotype)-[:ASSOCIATED_WITH {_uuid: randomUUID()}]-(disease)'
    return MATCH_PHENOTYPE_STR + MATCH_DISEASE_STR + merge_stmt


def create_phenotype_gene_cypher():
    # phenotype	gene
    merge_stmt = 'MERGE (phenotype)-[:ASSOCIATED_WITH {_uuid: randomUUID()}]-(gene)'
    return MATCH_PHENOTYPE_STR + MATCH_GENE_STR + merge_stmt


def create_project_cypher():
    # id_namespace	local_id	persistent_id	creation_time	abbreviation	name	description
    props = '{local_id: row.local_id, id_namespace: row.id_namespace, persistent_id: row.persistent_id, creation_time: row.creation_time, abbreviation: row.abbreviation, name: row.name, description: row.description, _uuid: randomUUID()}'
    return f'CREATE (project:Project {props})'


def create_project_relationships_cypher():
    # id_namespace	local_id	persistent_id	creation_time	abbreviation	name	description
    match_project_stmt = 'MATCH (project:Project {local_id: row.local_id, id_namespace: row.id_namespace})\n'
    remove_prop_stmt = 'REMOVE project.id_namespace\n'
    with_stmt = 'WITH project, row\n'
    merge_stmt = 'MERGE (id_namespace)-[:CONTAINS {_uuid: randomUUID()}]->(project)'
    return match_project_stmt + remove_prop_stmt + with_stmt + MATCH_ID_NAMESPACE_STR + merge_stmt


def create_project_in_project_cypher():
    # parent_project_id_namespace	parent_project_local_id	child_project_id_namespace	child_project_local_id
    match_parent_project = 'MATCH (:IDNamespace {id: row.parent_project_id_namespace})-[:CONTAINS]->(parent_project:Project {local_id: row.parent_project_local_id})\n'
    match_child_project = 'MATCH (:IDNamespace {id: row.child_project_id_namespace})-[:CONTAINS]->(child_project:Project {local_id: row.child_project_local_id})\n'
    merge_stmt = 'MERGE (parent_project)-[:IS_PARENT_OF {_uuid: randomUUID()}]->(child_project)'
    return match_parent_project + match_child_project + merge_stmt


def create_protein_cypher():
    # id	name	description	synonyms	organism
    props = '{id: row.id, name: row.name, description: row.description, synonyms: apoc.convert.fromJsonList(row.synonyms), _uuid: randomUUID()}'
    return f'CREATE (protein:Protein {props})'


def create_protein_relationships_cypher():
    match_protein_stmt = 'MATCH (protein:Protein {id: row.id})\n'
    match_taxonomy_stmt = 'OPTIONAL MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.organism})\n'
    merge_stmt = 'MERGE (protein)-[:HAS_SOURCE {_uuid: randomUUID()}]->(ncbi_taxonomy)'
    return match_protein_stmt + match_taxonomy_stmt + merge_stmt


def create_protein_gene_cypher():
    # protein	gene
    merge_stmt = 'MERGE (protein)-[:ASSOCIATED_WITH {_uuid: randomUUID()}]-(gene)'
    return MATCH_PROTEIN_STR + MATCH_GENE_STR + merge_stmt


def create_subject_cypher():
    # id_namespace	local_id	project_id_namespace	project_local_id	persistent_id	creation_time	granularity	sex	ethnicity	age_at_enrollment
    props = '{local_id: row.local_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id, persistent_id: row.persistent_id, creation_time: row.creation_time, granularity: row.granularity, sex: row.sex, ethnicity: row.ethnicity, age_at_enrollment: row.age_at_enrollment, _uuid: randomUUID()}'

    return f'CREATE (subject:Subject {props})'


def create_subject_relationships_cypher():
    match_subject_stmt = 'MATCH (subject:Subject {local_id: row.local_id, id_namespace: row.id_namespace, project_local_id: row.project_local_id})\n'

    remove_props_stmt = 'REMOVE subject.id_namespace\nREMOVE subject.project_local_id\n'

    # Match all related term entities (optionally, so bound nodes can be NULL) and merge term relationships (if bound nodes are NULL, then the statement is ignored and discarded)
    with_stmt = 'WITH subject, row\n'

    match_subject_ethnicity_stmt = 'OPTIONAL MATCH (subject_ethnicity:SubjectEthnicity {id: row.ethnicity})\n'
    merge_subject_ethnicity_stmt = 'MERGE (subject)-[:IS_ETHNICITY {_uuid: randomUUID()}]->(subject_ethnicity)\n'

    match_subject_granularity_stmt = 'OPTIONAL MATCH (subject_granularity:SubjectGranularity {id: row.granularity})\n'
    merge_subject_granularity_stmt = 'MERGE (subject)-[:IS_GRANULARITY {_uuid: randomUUID()}]->(subject_granularity)\n'

    match_subject_sex_stmt = 'OPTIONAL MATCH (subject_sex:SubjectSex {id: row.sex})\n'
    merge_subject_sex_stmt = 'MERGE (subject)-[:IS_SEX {_uuid: randomUUID()}]->(subject_sex)\n'

    # Merge the id namespace and project
    merge_id_namespace_and_project_stmt = 'MERGE (id_namespace)-[:CONTAINS {_uuid: randomUUID()}]->(subject)<-[:CONTAINS {_uuid: randomUUID()}]-(project)'

    return (
        match_subject_stmt +
        remove_props_stmt +
        with_stmt +
        match_subject_ethnicity_stmt +
        merge_subject_ethnicity_stmt +
        with_stmt +
        match_subject_granularity_stmt +
        merge_subject_granularity_stmt +
        with_stmt +
        match_subject_sex_stmt +
        merge_subject_sex_stmt +
        with_stmt +
        MATCH_ID_NAMESPACE_STR +
        MATCH_PROJECT_STR +
        merge_id_namespace_and_project_stmt
    )


def create_sample_prep_method_cypher():
    # id	name	description	synonyms
    return f'CREATE (:SamplePrepMethod {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_subject_disease_cypher():
    # subject_id_namespace	subject_local_id	association_type	disease
    merge_stmt = 'MERGE (subject)-[:TESTED_FOR {observed: row.association_type = "cfde_disease_association_type:1", _uuid: randomUUID()}]->(disease)'
    return MATCH_SUBJECT_STR + MATCH_DISEASE_STR + merge_stmt


def create_subject_ethnicity_cypher():
    # id	name	description
    return f'CREATE (:SubjectEthnicity {STANDARD_TERM_PROPS})'


def create_subject_granularity_cypher():
    # id	name	description
    return f'CREATE (:SubjectGranularity {STANDARD_TERM_PROPS})'


def create_subject_in_collection_cypher():
    # subject_id_namespace	subject_local_id	collection_id_namespace	collection_local_id
    merge_stmt = 'MERGE (collection)-[:CONTAINS {_uuid: randomUUID()}]->(subject)'
    return MATCH_COLLECTION_STR + MATCH_SUBJECT_STR + merge_stmt


def create_subject_phenotype_cypher():
    # subject_id_namespace	subject_local_id	association_type	phenotype
    merge_stmt = 'MERGE (subject)-[:TESTED_FOR {observed: row.association_type = "cfde_phenotype_association_type:1", _uuid: randomUUID()}]->(phenotype)'
    return MATCH_SUBJECT_STR + MATCH_PHENOTYPE_STR + merge_stmt


def create_subject_race_cypher():
    # subject_id_namespace	subject_local_id	race
    match_subject_race_stmt = 'MATCH (subject_race:SubjectRace {id: row.race})\n'
    merge_stmt = 'MERGE (subject)-[:IS_RACE {_uuid: randomUUID()}]->(subject_race)'
    return match_subject_race_stmt + MATCH_SUBJECT_STR + merge_stmt


def create_subject_race_cv_cypher():
    # id	name	description
    return f'CREATE (:SubjectRace {STANDARD_TERM_PROPS})'


def create_subject_role_cypher():
    # id	name	description
    return f'CREATE (:SubjectRole {STANDARD_TERM_PROPS})'


def create_subject_role_taxonomy_cypher():
    # subject_id_namespace	subject_local_id	role_id	taxonomy_id
    match_taxonomy_stmt = 'MATCH (ncbi_taxonomy:NCBITaxonomy {id: row.taxonomy_id})\n'
    merge_stmt = 'MERGE (subject)-[:ASSOCIATED_WITH {role_id: row.role_id, _uuid: randomUUID()}]-(ncbi_taxonomy)'
    return MATCH_SUBJECT_STR + match_taxonomy_stmt + merge_stmt


def create_subject_sex_cypher():
    # id	name	description
    return f'CREATE (:SubjectSex {STANDARD_TERM_PROPS})'


def create_subject_substance_cypher():
    # subject_id_namespace	subject_local_id	substance
    merge_stmt = 'MERGE (subject)-[:ASSOCIATED_WITH {_uuid: randomUUID()}]-(substance)'
    return MATCH_SUBJECT_STR + MATCH_SUBSTANCE_STR + merge_stmt


def create_substance_cypher():
    # id	name	description	synonyms	compound
    return f'CREATE (substance:Substance {STANDARD_TERM_PROPS_WITH_SYNONYMS})'


def create_substance_relationships_cypher():
    match_substance_stmt = 'MATCH (substance:Substance {id: row.id})'
    merge_stmt = 'MERGE (substance)-[:ASSOCIATED_WITH {_uuid: randomUUID()}]-(compound)'
    return match_substance_stmt + MATCH_COMPOUND_STR + merge_stmt


def create_term_constraints_cypher():
    term_id_constraints = '\n'.join(
        [create_node_unique_constraint(label, 'id') for label in TERM_NODES])
    return term_id_constraints


def create_term_name_indexes_cypher():
    return '\n'.join([
        f"CREATE TEXT INDEX node_text_index_{label}_name FOR (n:{label}) ON (n.name);" for label in TERM_NODES
    ])


def create_node_uuid_constraints_cypher():
    uuid_constraints = '\n'.join(
        [create_node_unique_constraint(label, '_uuid') for label in ALL_NODES])
    return uuid_constraints


def create_relationship_uuid_constraints_cypher():
    uuid_constraints = '\n'.join([create_relationship_unique_constraint(
        type, '_uuid') for type in ALL_RELATIONSHIPS])
    return uuid_constraints


def create_load_query(data_file_name: str, stmts: str):
    formatted_stmts = '\n\t'.join(stmts.split('\n'))
    load_csv_stmt = f"LOAD CSV WITH HEADERS FROM 'file:///data/{data_file_name}' AS row FIELDTERMINATOR '\\t'\n"
    call_stmt = f'CALL {{\n\tWITH row\n\t{formatted_stmts}\n}} IN TRANSACTIONS OF 10000 ROWS\n'
    return load_csv_stmt + call_stmt


def main():
    # Order of this list doesn't matter in the context of this script, but it *does* matter when the
    # cypher files are actually loaded into the database. So, this list is arranged in the order they
    # should be loaded, for clarity and consistency.
    dataf_cypherf_fn_threeple = [
        # Add nodes without their relationships first:
        ('analysis_type.tsv', 'analysis_type.cypher', create_analysis_type_cypher),
        ('anatomy.tsv', 'anatomy.cypher', create_anatomy_cypher),
        ('assay_type.tsv', 'assay_type.cypher', create_assay_type_cypher),
        ('biofluid.tsv', 'biofluid.cypher', create_biofluid_cypher),
        ('biosample.tsv', 'biosample.cypher', create_biosample_cypher),
        ('collection.tsv', 'collection.cypher', create_collection_cypher),
        ('compound.tsv', 'compound.cypher', create_compound_cypher),
        ('data_type.tsv', 'data_type.cypher', create_data_type_cypher),
        ('dcc.tsv', 'dcc.cypher', create_dcc_cypher),
        ('disease.tsv', 'disease.cypher', create_disease_cypher),
        ('file.tsv', 'file.cypher', create_file_cypher),
        ('file_format.tsv', 'file_format.cypher', create_file_format_cypher),
        ('gene.tsv', 'gene.cypher', create_gene_cypher),
        ('id_namespace.tsv', 'id_namespace.cypher', create_id_namespace_cypher),
        ('ncbi_taxonomy.tsv', 'ncbi_taxonomy.cypher', create_ncbi_taxonomy_cypher),
        ('phenotype.tsv', 'phenotype.cypher', create_phenotype_cypher),
        ('project.tsv', 'project.cypher', create_project_cypher),
        ('protein.tsv', 'protein.cypher', create_protein_cypher),
        ('sample_prep_method.tsv', 'sample_prep_method.cypher',
         create_sample_prep_method_cypher),
        ('subject.tsv', 'subject.cypher', create_subject_cypher),
        ('subject_ethnicity.tsv', 'subject_ethnicity.cypher',
         create_subject_ethnicity_cypher),
        ('subject_granularity.tsv', 'subject_granularity.cypher',
         create_subject_granularity_cypher),
        ('subject_race_cv.tsv', 'subject_race_cv.cypher',
            create_subject_race_cv_cypher),
        ('subject_role.tsv', 'subject_role.cypher', create_subject_role_cypher),
        ('subject_sex.tsv', 'subject_sex.cypher', create_subject_sex_cypher),
        ('substance.tsv', 'substance.cypher', create_substance_cypher),
        # Add indexes/constraints after adding all nodes to avoid unnecessary label scans, but also to make adding relationships faster:
        ('id_namespace_constraints.tsv', 'id_namespace_constraints.cypher',
         create_id_namespace_constraints_cypher),
        ('container_indexes.tsv', 'container_indexes.cypher',
         create_container_indexes_cypher),
        ('dcc_constraints.tsv', 'dcc_constraints.cypher',
            create_dcc_constraints_cypher),
        ('term_constraints.tsv', 'term_constraints.cypher',
         create_term_constraints_cypher),
        ('term_name_indexes.tsv', 'term_name_indexes.cypher',
         create_term_name_indexes_cypher),
        ('core_indexes.tsv', 'core_indexes.cypher', create_core_indexes_cypher),
        ('admin_indexes.tsv', 'admin_indexes.cypher', create_admin_indexes_cypher),
        ('node_uuid_constraints.tsv', 'node_uuid_constraints.cypher',
         create_node_uuid_constraints_cypher),
        # Add relationships last:
        # Project relationships must come before the others, because they rely on it existing
        ('project.tsv', 'project_relationships.cypher',
         create_project_relationships_cypher),
        # Collections come before others for a similar reason as projects
        ('collection.tsv', 'collection_relationships.cypher',
         create_collection_relationships_cypher),
        ('biosample.tsv', 'biosample_relationships.cypher',
         create_biosample_relationships_cypher),
        ('file.tsv', 'file_relationships.cypher', create_file_relationships_cypher),
        ('gene.tsv', 'gene_relationships.cypher', create_gene_relationships_cypher),
        ('protein.tsv', 'protein_relationships.cypher',
         create_protein_relationships_cypher),
        ('subject.tsv', 'subject_relationships.cypher',
         create_subject_relationships_cypher),
        ('substance.tsv', 'substance_relationships.cypher',
         create_substance_relationships_cypher),
        ('biosample_substance.tsv', 'biosample_substance.cypher',
         create_biosample_substance_cypher),
        ('biosample_disease.tsv', 'biosample_disease.cypher',
         create_biosample_disease_cypher),
        ('biosample_from_subject.tsv', 'biosample_from_subject.cypher',
         create_biosample_from_subject_cypher),
        ('biosample_gene.tsv', 'biosample_gene.cypher', create_biosample_gene_cypher),
        ('biosample_in_collection.tsv', 'biosample_in_collection.cypher',
         create_biosample_in_collection_cypher),
        ('collection_anatomy.tsv', 'collection_anatomy.cypher',
         create_collection_anatomy_cypher),
        ('collection_biofluid.tsv', 'collection_biofluid.cypher',
         create_collection_biofluid_cypher),
        ('collection_compound.tsv', 'collection_compound.cypher',
         create_collection_compound_cypher),
        ('collection_defined_by_project.tsv', 'collection_defined_by_project.cypher',
         create_collection_defined_by_project_cypher),
        ('collection_disease.tsv', 'collection_disease.cypher',
         create_collection_disease_cypher),
        ('collection_gene.tsv', 'collection_gene.cypher',
            create_collection_gene_cypher),
        ('collection_in_collection.tsv', 'collection_in_collection.cypher',
         create_collection_in_collection_cypher),
        ('collection_phenotype.tsv', 'collection_phenotype.cypher',
         create_collection_phenotype_cypher),
        ('collection_protein.tsv', 'collection_protein.cypher',
         create_collection_protein_cypher),
        ('collection_substance.tsv', 'collection_substance.cypher',
         create_collection_substance_cypher),
        ('collection_taxonomy.tsv', 'collection_taxonomy.cypher',
         create_collection_taxonomy_cypher),
        ('file_describes_biosample.tsv', 'file_describes_biosample.cypher',
         create_file_describes_biosample_cypher),
        ('file_describes_collection.tsv', 'file_describes_collection.cypher',
         create_file_describes_collection_cypher),
        ('file_describes_subject.tsv', 'file_describes_subject.cypher',
         create_file_describes_subject_cypher),
        ('file_in_collection.tsv', 'file_in_collection.cypher',
         create_file_in_collection_cypher),
        ('id_namespace_dcc_id.tsv', 'id_namespace_dcc_id.cypher',
         create_id_namespace_dcc_id_cypher),
        ('phenotype_disease.tsv', 'phenotype_disease.cypher',
         create_phenotype_disease_cypher),
        ('phenotype_gene.tsv', 'phenotype_gene.cypher', create_phenotype_gene_cypher),
        ('project_in_project.tsv', 'project_in_project.cypher',
         create_project_in_project_cypher),
        ('protein_gene.tsv', 'protein_gene.cypher', create_protein_gene_cypher),
        ('subject_disease.tsv', 'subject_disease.cypher',
            create_subject_disease_cypher),
        ('subject_in_collection.tsv', 'subject_in_collection.cypher',
         create_subject_in_collection_cypher),
        ('subject_phenotype.tsv', 'subject_phenotype.cypher',
         create_subject_phenotype_cypher),
        ('subject_race.tsv', 'subject_race.cypher', create_subject_race_cypher),
        ('subject_role_taxonomy.tsv', 'subject_role_taxonomy.cypher',
         create_subject_role_taxonomy_cypher),
        ('subject_substance.tsv', 'subject_substance.cypher',
         create_subject_substance_cypher),
        # Finally, add relationship UUID constraints *after* adding all relationships
        ('relationship_uuid_constraints.tsv', 'relationship_uuid_constraints.cypher',
         create_relationship_uuid_constraints_cypher),
    ]

    for data_filename, cypher_filename, query_builder_fn in dataf_cypherf_fn_threeple:
        with open(f'./import/cypher/{cypher_filename}', 'w') as cypher_fp:
            # Constraints/indexes are special load files, we don't need to load from a TSV for them
            if cypher_filename in ['id_namespace_constraints.cypher', 'container_indexes.cypher', 'dcc_constraints.cypher', 'term_constraints.cypher', 'term_name_indexes.cypher', 'core_indexes.cypher', 'admin_indexes.cypher', 'node_uuid_constraints.cypher', 'relationship_uuid_constraints.cypher']:
                cypher_fp.write(query_builder_fn())
            else:
                cypher_fp.write(create_load_query(
                    data_filename, query_builder_fn()))


if __name__ == '__main__':
    main()
