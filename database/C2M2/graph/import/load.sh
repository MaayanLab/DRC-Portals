#!/bin/bash
set -e

files=(
    # Add nodes without their relationships first:
    "analysis_type.cypher"
    "anatomy.cypher"
    "assay_type.cypher"
    "biosample.cypher"
    "collection.cypher"
    "compound.cypher"
    "data_type.cypher"
    "dcc.cypher"
    "disease_association_type.cypher"
    "disease.cypher"
    "file.cypher"
    "file_format.cypher"
    "gene.cypher"
    "id_namespace.cypher"
    "ncbi_taxonomy.cypher"
    "phenotype_association_type.cypher"
    "phenotype.cypher"
    "project.cypher"
    "protein.cypher"
    "sample_prep_method.cypher"
    "subject.cypher"
    "subject_ethnicity.cypher"
    "subject_granularity.cypher"
    "subject_race_cv.cypher"
    "subject_role.cypher"
    "subject_sex.cypher"
    "substance.cypher"
    # Add indexes/constraints after adding all nodes to avoid unnecessary label scans, but also to make adding relationships faster (via index lookups):
    "id_namespace_constraints.cypher"
    "container_indexes.cypher"
    "dcc_constraints.cypher"
    "term_constraints.cypher"
    "core_indexes.cypher"
    "node_uuid_constraints.cypher"
    # Add relationships last:
    "project_relationships.cypher" # Project relationships must come before the others, because they rely on it existing
    "collection_relationships.cypher" # Collections come before others for a similar reason as projects
    "biosample_relationships.cypher"
    "file_relationships.cypher"
    "subject_relationships.cypher"
    "gene_relationships.cypher"
    "protein_relationships.cypher"
    "substance_relationships.cypher"
    "biosample_substance.cypher"
    "biosample_disease.cypher"
    "biosample_from_subject.cypher"
    "biosample_gene.cypher"
    "biosample_in_collection.cypher"
    "collection_anatomy.cypher"
    "collection_compound.cypher"
    "collection_defined_by_project.cypher"
    "collection_disease.cypher"
    "collection_gene.cypher"
    "collection_in_collection.cypher"
    "collection_phenotype.cypher"
    "collection_protein.cypher"
    "collection_substance.cypher"
    "collection_taxonomy.cypher"
    "file_describes_biosample.cypher"
    "file_describes_collection.cypher"
    "file_describes_subject.cypher"
    "file_in_collection.cypher"
    "id_namespace_dcc_id.cypher"
    "phenotype_disease.cypher"
    "phenotype_gene.cypher"
    "project_in_project.cypher"
    "protein_gene.cypher"
    "subject_disease.cypher"
    "subject_in_collection.cypher"
    "subject_phenotype.cypher"
    "subject_race.cypher"
    "subject_role_taxonomy.cypher"
    "subject_substance.cypher"
    # Finally, add relationship UUID constraints *after* adding all relationships
    "relationship_uuid_constraints.cypher"
)

# Make sure the C2M2 database exists before putting any data into it
printf '%s\n' "[$(date)] Creating the C2M2 database..."
./init_c2m2_db.sh

# Iterate over the array of filenames
for filename in "${files[@]}"; do
    # Check if it's a file
    if [ -f "/import/cypher/$filename" ]; then
        printf '%s\n' "[$(date)] Loading file $filename..."
        cypher-shell -p $PASSWORD -u $USERNAME -d $GRAPH_C2M2_DBNAME -f "/import/cypher/$filename"
    fi
done

printf '%s\n' "[$(date)] Applying revisions..."
./apply_revisions.sh

# Make sure the C2M2 database is read-only once the data has been written
printf '%s\n' "[$(date)] Setting C2M2 database as read only..."
cypher-shell -p $PASSWORD -u $USERNAME "ALTER DATABASE $GRAPH_C2M2_DBNAME SET ACCESS READ ONLY"

# Create a read only user for the C2M2 database if it doesn't already exist
printf '%s\n' "[$(date)] Creating C2M2 readonly user..."
./init_c2m2_user.sh
