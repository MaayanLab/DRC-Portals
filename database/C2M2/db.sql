set statement_timeout = 0;
COPY c2m2Metadata.file FROM '/home/shiva/c2m2/4DN/data/file.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample FROM '/home/shiva/c2m2/4DN/data/biosample.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject FROM '/home/shiva/c2m2/4DN/data/subject.tsv' WITH CSV HEADER;
COPY c2m2Metadata.dcc FROM '/home/shiva/c2m2/4DN/data/dcc.tsv' WITH CSV HEADER;
COPY c2m2Metadata.project FROM '/home/shiva/c2m2/4DN/data/project.tsv' WITH CSV HEADER;
COPY c2m2Metadata.project_in_project FROM '/home/shiva/c2m2/4DN/data/project_in_project.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection FROM '/home/shiva/c2m2/4DN/data/collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_in_collection FROM '/home/shiva/c2m2/4DN/data/collection_in_collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.file_describes_collection FROM '/home/shiva/c2m2/4DN/data/file_describes_collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_defined_by_project FROM '/home/shiva/c2m2/4DN/data/collection_defined_by_project.tsv' WITH CSV HEADER;
COPY c2m2Metadata.file_in_collection FROM '/home/shiva/c2m2/4DN/data/file_in_collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample_in_collection FROM '/home/shiva/c2m2/4DN/data/biosample_in_collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_in_collection FROM '/home/shiva/c2m2/4DN/data/subject_in_collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.file_describes_biosample FROM '/home/shiva/c2m2/4DN/data/file_describes_biosample.tsv' WITH CSV HEADER;
COPY c2m2Metadata.file_describes_subject FROM '/home/shiva/c2m2/4DN/data/file_describes_subject.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample_from_subject FROM '/home/shiva/c2m2/4DN/data/biosample_from_subject.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample_disease FROM '/home/shiva/c2m2/4DN/data/biosample_disease.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_disease FROM '/home/shiva/c2m2/4DN/data/subject_disease.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_disease FROM '/home/shiva/c2m2/4DN/data/collection_disease.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_phenotype FROM '/home/shiva/c2m2/4DN/data/collection_phenotype.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_gene FROM '/home/shiva/c2m2/4DN/data/collection_gene.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_compound FROM '/home/shiva/c2m2/4DN/data/collection_compound.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_substance FROM '/home/shiva/c2m2/4DN/data/collection_substance.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_taxonomy FROM '/home/shiva/c2m2/4DN/data/collection_taxonomy.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_anatomy FROM '/home/shiva/c2m2/4DN/data/collection_anatomy.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_protein FROM '/home/shiva/c2m2/4DN/data/collection_protein.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_phenotype FROM '/home/shiva/c2m2/4DN/data/subject_phenotype.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample_substance FROM '/home/shiva/c2m2/4DN/data/biosample_substance.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_substance FROM '/home/shiva/c2m2/4DN/data/subject_substance.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample_gene FROM '/home/shiva/c2m2/4DN/data/biosample_gene.tsv' WITH CSV HEADER;
COPY c2m2Metadata.phenotype_gene FROM '/home/shiva/c2m2/4DN/data/phenotype_gene.tsv' WITH CSV HEADER;
COPY c2m2Metadata.phenotype_disease FROM '/home/shiva/c2m2/4DN/data/phenotype_disease.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_race FROM '/home/shiva/c2m2/4DN/data/subject_race.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_role_taxonomy FROM '/home/shiva/c2m2/4DN/data/subject_role_taxonomy.tsv' WITH CSV HEADER;
COPY c2m2Metadata.assay_type FROM '/home/shiva/c2m2/4DN/data/assay_type.tsv' WITH CSV HEADER;
COPY c2m2Metadata.analysis_type FROM '/home/shiva/c2m2/4DN/data/analysis_type.tsv' WITH CSV HEADER;
COPY c2m2Metadata.ncbi_taxonomy FROM '/home/shiva/c2m2/4DN/data/ncbi_taxonomy.tsv' WITH CSV HEADER;
COPY c2m2Metadata.anatomy FROM '/home/shiva/c2m2/4DN/data/anatomy.tsv' WITH CSV HEADER;
COPY c2m2Metadata.file_format FROM '/home/shiva/c2m2/4DN/data/file_format.tsv' WITH CSV HEADER;
COPY c2m2Metadata.data_type FROM '/home/shiva/c2m2/4DN/data/data_type.tsv' WITH CSV HEADER;
COPY c2m2Metadata.disease FROM '/home/shiva/c2m2/4DN/data/disease.tsv' WITH CSV HEADER;
COPY c2m2Metadata.phenotype FROM '/home/shiva/c2m2/4DN/data/phenotype.tsv' WITH CSV HEADER;
COPY c2m2Metadata.compound FROM '/home/shiva/c2m2/4DN/data/compound.tsv' WITH CSV HEADER;
COPY c2m2Metadata.substance FROM '/home/shiva/c2m2/4DN/data/substance.tsv' WITH CSV HEADER;
COPY c2m2Metadata.gene FROM '/home/shiva/c2m2/4DN/data/gene.tsv' WITH CSV HEADER;
COPY c2m2Metadata.protein FROM '/home/shiva/c2m2/4DN/data/protein.tsv' WITH CSV HEADER;
COPY c2m2Metadata.protein_gene FROM '/home/shiva/c2m2/4DN/data/protein_gene.tsv' WITH CSV HEADER;
COPY c2m2Metadata.sample_prep_method FROM '/home/shiva/c2m2/4DN/data/sample_prep_method.tsv' WITH CSV HEADER;
COPY c2m2Metadata.id_namespace FROM '/home/shiva/c2m2/4DN/data/id_namespace.tsv' WITH CSV HEADER;
COPY c2m2Metadata.file FROM '/home/shiva/c2m2/SPARC/data/file.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample FROM '/home/shiva/c2m2/SPARC/data/biosample.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject FROM '/home/shiva/c2m2/SPARC/data/subject.tsv' WITH CSV HEADER;
COPY c2m2Metadata.dcc FROM '/home/shiva/c2m2/SPARC/data/dcc.tsv' WITH CSV HEADER;
COPY c2m2Metadata.project FROM '/home/shiva/c2m2/SPARC/data/project.tsv' WITH CSV HEADER;
COPY c2m2Metadata.project_in_project FROM '/home/shiva/c2m2/SPARC/data/project_in_project.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection FROM '/home/shiva/c2m2/SPARC/data/collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_in_collection FROM '/home/shiva/c2m2/SPARC/data/collection_in_collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.file_describes_collection FROM '/home/shiva/c2m2/SPARC/data/file_describes_collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_defined_by_project FROM '/home/shiva/c2m2/SPARC/data/collection_defined_by_project.tsv' WITH CSV HEADER;
COPY c2m2Metadata.file_in_collection FROM '/home/shiva/c2m2/SPARC/data/file_in_collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample_in_collection FROM '/home/shiva/c2m2/SPARC/data/biosample_in_collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_in_collection FROM '/home/shiva/c2m2/SPARC/data/subject_in_collection.tsv' WITH CSV HEADER;
COPY c2m2Metadata.file_describes_biosample FROM '/home/shiva/c2m2/SPARC/data/file_describes_biosample.tsv' WITH CSV HEADER;
COPY c2m2Metadata.file_describes_subject FROM '/home/shiva/c2m2/SPARC/data/file_describes_subject.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample_from_subject FROM '/home/shiva/c2m2/SPARC/data/biosample_from_subject.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample_disease FROM '/home/shiva/c2m2/SPARC/data/biosample_disease.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_disease FROM '/home/shiva/c2m2/SPARC/data/subject_disease.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_disease FROM '/home/shiva/c2m2/SPARC/data/collection_disease.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_phenotype FROM '/home/shiva/c2m2/SPARC/data/collection_phenotype.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_gene FROM '/home/shiva/c2m2/SPARC/data/collection_gene.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_compound FROM '/home/shiva/c2m2/SPARC/data/collection_compound.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_substance FROM '/home/shiva/c2m2/SPARC/data/collection_substance.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_taxonomy FROM '/home/shiva/c2m2/SPARC/data/collection_taxonomy.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_anatomy FROM '/home/shiva/c2m2/SPARC/data/collection_anatomy.tsv' WITH CSV HEADER;
COPY c2m2Metadata.collection_protein FROM '/home/shiva/c2m2/SPARC/data/collection_protein.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_phenotype FROM '/home/shiva/c2m2/SPARC/data/subject_phenotype.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample_substance FROM '/home/shiva/c2m2/SPARC/data/biosample_substance.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_substance FROM '/home/shiva/c2m2/SPARC/data/subject_substance.tsv' WITH CSV HEADER;
COPY c2m2Metadata.biosample_gene FROM '/home/shiva/c2m2/SPARC/data/biosample_gene.tsv' WITH CSV HEADER;
COPY c2m2Metadata.phenotype_gene FROM '/home/shiva/c2m2/SPARC/data/phenotype_gene.tsv' WITH CSV HEADER;
COPY c2m2Metadata.phenotype_disease FROM '/home/shiva/c2m2/SPARC/data/phenotype_disease.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_race FROM '/home/shiva/c2m2/SPARC/data/subject_race.tsv' WITH CSV HEADER;
COPY c2m2Metadata.subject_role_taxonomy FROM '/home/shiva/c2m2/SPARC/data/subject_role_taxonomy.tsv' WITH CSV HEADER;
COPY c2m2Metadata.assay_type FROM '/home/shiva/c2m2/SPARC/data/assay_type.tsv' WITH CSV HEADER;
COPY c2m2Metadata.analysis_type FROM '/home/shiva/c2m2/SPARC/data/analysis_type.tsv' WITH CSV HEADER;
COPY c2m2Metadata.ncbi_taxonomy FROM '/home/shiva/c2m2/SPARC/data/ncbi_taxonomy.tsv' WITH CSV HEADER;
COPY c2m2Metadata.anatomy FROM '/home/shiva/c2m2/SPARC/data/anatomy.tsv' WITH CSV HEADER;
COPY c2m2Metadata.file_format FROM '/home/shiva/c2m2/SPARC/data/file_format.tsv' WITH CSV HEADER;
COPY c2m2Metadata.data_type FROM '/home/shiva/c2m2/SPARC/data/data_type.tsv' WITH CSV HEADER;
COPY c2m2Metadata.disease FROM '/home/shiva/c2m2/SPARC/data/disease.tsv' WITH CSV HEADER;
COPY c2m2Metadata.phenotype FROM '/home/shiva/c2m2/SPARC/data/phenotype.tsv' WITH CSV HEADER;
COPY c2m2Metadata.compound FROM '/home/shiva/c2m2/SPARC/data/compound.tsv' WITH CSV HEADER;
COPY c2m2Metadata.substance FROM '/home/shiva/c2m2/SPARC/data/substance.tsv' WITH CSV HEADER;
COPY c2m2Metadata.gene FROM '/home/shiva/c2m2/SPARC/data/gene.tsv' WITH CSV HEADER;
COPY c2m2Metadata.protein FROM '/home/shiva/c2m2/SPARC/data/protein.tsv' WITH CSV HEADER;
COPY c2m2Metadata.protein_gene FROM '/home/shiva/c2m2/SPARC/data/protein_gene.tsv' WITH CSV HEADER;
COPY c2m2Metadata.sample_prep_method FROM '/home/shiva/c2m2/SPARC/data/sample_prep_method.tsv' WITH CSV HEADER;
COPY c2m2Metadata.id_namespace FROM '/home/shiva/c2m2/SPARC/data/id_namespace.tsv' WITH CSV HEADER;