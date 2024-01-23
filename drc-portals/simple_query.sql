--- COLUMNS TO SHOW TO USER ---

select 
    concat('Project: ', c2m2.project.name) as name, concat('Project: ', c2m2.project.description) as description,
    c2m2.fl_biosample.id_namespace as biosample_id_namespace, c2m2.fl_biosample.local_id as biosample_local_id, 
    c2m2.fl_biosample.project_id_namespace as project_id_namespace, c2m2.fl_biosample.project_local_id as project_local_id, 
    c2m2.dcc.dcc_name as dcc_name, c2m2.dcc.dcc_abbreviation as dcc_abbreviation,
    c2m2.project.name as project_name,  c2m2.project.abbreviation as project_abbreviation, c2m2.project.description as project_description
from c2m2.fl_biosample 
    full join c2m2.dcc
        on (c2m2.fl_biosample.project_id_namespace = c2m2.dcc.project_id_namespace)
    full join c2m2.project
        on (c2m2.fl_biosample.project_local_id = c2m2.project.local_id and
        c2m2.fl_biosample.project_id_namespace = c2m2.project.id_namespace) 
    where
        c2m2.project.name like '%liver biopsy%' or
        c2m2.project.abbreviation like '%liver biopsy%' or
        c2m2.project.description like '%liver biopsy%' 
        limit 5;
