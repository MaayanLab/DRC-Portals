set statement_timeout = 0;
/* How to run: on psql prompt: be in the folder with this file or give full path:
\i biosample_join.sql;
 */

/* It is good convention to use alias for tables especially if two tables may 
have the same colum name and we want one in the output, then it is easier to 
refer by the alias instead of along table name. */

--- Mano: 2024/02/02: in the output, now using association_type as disease_association_type
--- Mano: 2024/02/03: in the output, now using disease as biosample_disease
--- Made the corresponding change in the sql file biosample_fully_flattened.sql

CREATE TABLE c2m2.fl_biosample as (SELECT DISTINCT
id_namespace, local_id, project_id_namespace, project_local_id, persistent_id, creation_time, sample_prep_method, anatomy,
association_type as disease_association_type, disease as biosample_disease,
subject_id_namespace, subject_local_id, age_at_sampling,
gene,
collection_id_namespace, collection_local_id,
substance
from c2m2.biosample 
    full join c2m2.biosample_disease
        on (c2m2.biosample.local_id = c2m2.biosample_disease.biosample_local_id and
        c2m2.biosample.id_namespace = c2m2.biosample_disease.biosample_id_namespace)

    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)

    full join c2m2.biosample_gene 
        on (c2m2.biosample.local_id = c2m2.biosample_gene.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_gene.biosample_id_namespace)

    full join c2m2.biosample_in_collection
        on (c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and
        c2m2.biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace)

    full join c2m2.biosample_substance 
        on (c2m2.biosample.local_id = c2m2.biosample_substance.biosample_local_id and
        c2m2.biosample.id_namespace = c2m2.biosample_substance.biosample_id_namespace)
)
;

/* Just for ref:
ORDER BY project_id_namespace, project_local_id, subject_id_namespace, subject_local_id, id_namespace, local_id,
persistent_id, creation_time, sample_prep_method, anatomy, association_type, disease, age_at_sampling, gene,
collection_id_namespace, collection_local_id, substance
*/