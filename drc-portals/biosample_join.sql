select
id_namespace, local_id, project_id_namespace, project_local_id, creation_time, sample_prep_method, anatomy,
association_type, disease,
subject_id_namespace, subject_local_id, age_at_sampling,
gene,
collection_id_namespace, collection_local_id,
substance,
persistent_id
from c2m2.fl_biosample 
full join c2m2.biosample_disease on (c2m2.fl_biosample.local_id = c2m2.biosample_disease.biosample_local_id and c2m2.fl_biosample.id_namespace = c2m2.biosample_disease.biosample_id_namespace)
full join c2m2.biosample_from_subject on (c2m2.fl_biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and c2m2.fl_biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
full join c2m2.biosample_gene on (c2m2.fl_biosample.local_id = c2m2.biosample_gene.biosample_local_id and c2m2.fl_biosample.id_namespace = c2m2.biosample_gene.biosample_id_namespace)
full join c2m2.biosample_in_collection on (c2m2.fl_biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and c2m2.fl_biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace)
full join c2m2.biosample_substance on (c2m2.fl_biosample.local_id = c2m2.biosample_substance.biosample_local_id and c2m2.fl_biosample.id_namespace = c2m2.biosample_substance.biosample_id_namespace)
where disease ilike "";