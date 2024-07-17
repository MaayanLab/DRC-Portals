#!/bin/bash
set -e

files=(
    # Add all constraints/indexes first to help with query performance...
    "id_namespace_constraints.cypher"
    "container_indexes.cypher"
    "dcc_constraints.cypher"
    "term_constraints.cypher"
    "core_indexes.cypher"
    # ID Namespace must be added first...
    "id_namespace.cypher"
    # Container entities next...
    "collection.cypher"
    "project.cypher"
    # DCC relies on project existing, so we add it after adding container entities...
    "dcc.cypher"
    "id_namespace_dcc_id.cypher"
    # Term entities next...
    "ncbi_taxonomy.cypher"
    "compound.cypher"
    "disease.cypher"
    "disease_association_type.cypher"
    "gene.cypher"
    "phenotype.cypher"
    "phenotype_association_type.cypher"
    "protein.cypher"
    "substance.cypher"
    "sample_prep_method.cypher"
    "anatomy.cypher"
    "subject_race_cv.cypher"
    "subject_role.cypher"
    "subject_ethnicity.cypher"
    "subject_granularity.cypher"
    "subject_sex.cypher"
    "analysis_type.cypher"
    "assay_type.cypher"
    "data_type.cypher"
    "file_format.cypher"
    # Then core entities...
    "biosample.cypher"
    "file.cypher"
    "subject.cypher"
    # Container-container relationships next...
    "collection_defined_by_project.cypher"
    "collection_in_collection.cypher"
    "project_in_project.cypher"
    # Then core-core relationships...
    "biosample_from_subject.cypher"
    "file_describes_biosample.cypher"
    "file_describes_subject.cypher"
    # And core-container relationships...
    "biosample_in_collection.cypher"
    "file_describes_collection.cypher"
    "file_in_collection.cypher"
    "subject_in_collection.cypher"
    # Then term-term relationships...
    "phenotype_disease.cypher"
    "phenotype_gene.cypher"
    "protein_gene.cypher"
    # Next core-term relationships...
    "biosample_disease.cypher"
    "biosample_gene.cypher"
    "biosample_substance.cypher"
    "subject_disease.cypher"
    "subject_phenotype.cypher"
    "subject_race.cypher"
    "subject_role_taxonomy.cypher"
    "subject_substance.cypher"
    # And finally container-term relationships...
    "collection_anatomy.cypher"
    "collection_compound.cypher"
    "collection_disease.cypher"
    "collection_gene.cypher"
    "collection_phenotype.cypher"
    "collection_protein.cypher"
    "collection_substance.cypher"
    "collection_taxonomy.cypher"
)

# Make sure the C2M2 database exists before putting any data into it
echo "Creating C2M2 database..."
sh ./init_c2m2_db.sh

# Iterate over the array of filenames
for filename in "${files[@]}"; do
    # Check if it's a file
    if [ -f "/import/cypher/$filename" ]; then
        echo Loading file $filename...
        cypher-shell -p $PASSWORD -u $USERNAME -d $GRAPH_C2M2_DBNAME -f "/import/cypher/$filename"
    fi
done

echo "Applying revisions..."
sh ./apply_revisions.sh

# Make sure the C2M2 database is read-only once the data has been written
echo "Setting C2M2 database as read only..."
cypher-shell -p $PASSWORD -u $USERNAME "ALTER DATABASE $GRAPH_C2M2_DBNAME SET ACCESS READ ONLY"

# Create a read only user for the C2M2 database if it doesn't already exist
echo "Creating C2M2 readonly user..."
sh ./init_c2m2_user.sh
