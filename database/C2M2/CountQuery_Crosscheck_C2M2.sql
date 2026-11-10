/* =============== DCC short label: ExRNA =============== */
/* ==== c2m2_path: ingest/c2m2s/ExRNA/2026-08-28_02-43-38.748/CFDE08272026_C2M2.zip === */
select count(*) from c2m2.collection_anatomy where collection_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.collection_biofluid where collection_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.file where id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.biosample where id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.subject where id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.project where id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.collection where id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.file_in_collection where file_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.biosample_in_collection where biosample_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.subject_in_collection where subject_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.file_describes_biosample where file_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.file_describes_subject where file_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.biosample_disease where biosample_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.subject_disease where subject_id_namespace IN ('ERCC-exRNA');
select count(*) from c2m2.collection_disease where collection_id_namespace IN ('ERCC-exRNA');
/* =============== DCC short label: Metabolomics =============== */
/* ==== c2m2_path: ingest/c2m2s/Metabolomics/2026-09-14_19-12-37.842/MW_submission_packet_20260914.zip === */
select count(*) from c2m2.file where id_namespace IN ('https://www.metabolomicsworkbench.org/');
select count(*) from c2m2.project where id_namespace IN ('https://www.metabolomicsworkbench.org/');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('https://www.metabolomicsworkbench.org/');
select count(*) from c2m2.subject where id_namespace IN ('https://www.metabolomicsworkbench.org/');
select count(*) from c2m2.subject_disease where subject_id_namespace IN ('https://www.metabolomicsworkbench.org/');
select count(*) from c2m2.subject_phenotype where subject_id_namespace IN ('https://www.metabolomicsworkbench.org/');
select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('https://www.metabolomicsworkbench.org/');
select count(*) from c2m2.biosample where id_namespace IN ('https://www.metabolomicsworkbench.org/');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('https://www.metabolomicsworkbench.org/');
/* =============== DCC short label: geo_project =============== */
/* ==== c2m2_path: ingest/c2m2s/geo_project/2026-09-16_15-37-42.091/GEO_metadata_20260914.zip === */
select count(*) from c2m2.project where id_namespace IN ('NCBIGEO');
select count(*) from c2m2.file where id_namespace IN ('NCBIGEO');
select count(*) from c2m2.biosample where id_namespace IN ('NCBIGEO');
select count(*) from c2m2.biosample_disease where biosample_id_namespace IN ('NCBIGEO');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('NCBIGEO');
select count(*) from c2m2.subject where id_namespace IN ('NCBIGEO');
select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('NCBIGEO');
/* =============== DCC short label: Kids First =============== */
/* ==== c2m2_path: ingest/c2m2s/Kids First/2026-09-16_19-33-44.525/2026Q4_C2M2_datapackage.zip === */
select count(*) from c2m2.collection_anatomy where collection_id_namespace IN ('kidsfirst:');
select count(*) from c2m2.subject_phenotype where subject_id_namespace IN ('kidsfirst:');
select count(*) from c2m2.subject_race where subject_id_namespace IN ('kidsfirst:');
select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('kidsfirst:');
select count(*) from c2m2.file where id_namespace IN ('kidsfirst:');
select count(*) from c2m2.biosample where id_namespace IN ('kidsfirst:');
select count(*) from c2m2.subject where id_namespace IN ('kidsfirst:');
select count(*) from c2m2.project where id_namespace IN ('kidsfirst:');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('kidsfirst:');
select count(*) from c2m2.collection where id_namespace IN ('kidsfirst:');
select count(*) from c2m2.biosample_in_collection where biosample_id_namespace IN ('kidsfirst:');
select count(*) from c2m2.file_describes_biosample where file_id_namespace IN ('kidsfirst:');
select count(*) from c2m2.file_describes_subject where file_id_namespace IN ('kidsfirst:');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('kidsfirst:');
select count(*) from c2m2.biosample_disease where biosample_id_namespace IN ('kidsfirst:');
select count(*) from c2m2.subject_disease where subject_id_namespace IN ('kidsfirst:');
/* =============== DCC short label: SPARC =============== */
/* ==== c2m2_path: ingest/c2m2s/SPARC/2026-09-17_01-49-40.406/C2M2_datapackage_20260916.zip === */
select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('SPARC.subject:');
select count(*) from c2m2.file where id_namespace IN ('SPARC.file:');
select count(*) from c2m2.biosample where id_namespace IN ('SPARC.sample:');
select count(*) from c2m2.subject where id_namespace IN ('SPARC.subject:');
select count(*) from c2m2.project where id_namespace IN ('SPARC:', 'SPARC.project:');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('SPARC:', 'SPARC.project:');
select count(*) from c2m2.collection where id_namespace IN ('SPARC.collection:');
select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('SPARC.collection:');
select count(*) from c2m2.file_in_collection where file_id_namespace IN ('SPARC.file:');
select count(*) from c2m2.biosample_in_collection where biosample_id_namespace IN ('SPARC.sample:');
select count(*) from c2m2.subject_in_collection where subject_id_namespace IN ('SPARC.subject:');
select count(*) from c2m2.file_describes_biosample where file_id_namespace IN ('SPARC.file:');
select count(*) from c2m2.file_describes_subject where file_id_namespace IN ('SPARC.file:');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('SPARC.sample:');
/* =============== DCC short label: GlyGen =============== */
/* ==== c2m2_path: ingest/c2m2s/GlyGen/2026-09-18_15-21-45.166/glygen_2026_09_15_C2M2.zip === */
select count(*) from c2m2.collection_compound where collection_id_namespace IN ('https://www.data.glygen.org/');
select count(*) from c2m2.collection_taxonomy where collection_id_namespace IN ('https://www.data.glygen.org/');
select count(*) from c2m2.collection_anatomy where collection_id_namespace IN ('https://www.data.glygen.org/');
select count(*) from c2m2.collection_protein where collection_id_namespace IN ('https://www.data.glygen.org/');
select count(*) from c2m2.collection_ptm where collection_id_namespace IN ('https://www.data.glygen.org/');
select count(*) from c2m2.file where id_namespace IN ('https://www.data.glygen.org/');
select count(*) from c2m2.project where id_namespace IN ('https://www.data.glygen.org/');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('https://www.data.glygen.org/');
select count(*) from c2m2.collection where id_namespace IN ('https://www.data.glygen.org/');
select count(*) from c2m2.file_describes_collection where file_id_namespace IN ('https://www.data.glygen.org/');
select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('https://www.data.glygen.org/');
/* =============== DCC short label: SenNet =============== */
/* ==== c2m2_path: ingest/c2m2s/SenNet/2026-09-24_17-12-48.477/sennet_c2m2_sep26.zip === */
select count(*) from c2m2.collection_taxonomy where collection_id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.collection_anatomy where collection_id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.subject_race where subject_id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.file where id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.biosample where id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.subject where id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.project where id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.collection where id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.collection_in_collection where superset_collection_id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.file_describes_collection where file_id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.file_in_collection where file_id_namespace IN ('tag:sennetconsortium.org,2025:');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('tag:sennetconsortium.org,2025:');
/* =============== DCC short label: LINCS =============== */
/* ==== c2m2_path: ingest/c2m2s/LINCS/2023-09-18_00-00-00.000/datapackage.zip === */
select count(*) from c2m2.subject_disease where subject_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.file_in_collection where file_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.collection where id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.collection_taxonomy where collection_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.collection_anatomy where collection_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.biosample_in_collection where biosample_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.file where id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.project where id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.file_describes_subject where file_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.file_describes_biosample where file_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.biosample_gene where biosample_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.biosample_substance where biosample_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.biosample_disease where biosample_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.biosample where id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.subject where id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('https://www.lincsproject.org/');
select count(*) from c2m2.subject_in_collection where subject_id_namespace IN ('https://www.lincsproject.org/');
/* =============== DCC short label: HuBMAP =============== */
/* ==== c2m2_path: ingest/c2m2s/HuBMAP/2026-09-25_02-46-14.983/hubmap_c2m2_sep26.zip === */
select count(*) from c2m2.collection_taxonomy where collection_id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.collection_anatomy where collection_id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.subject_race where subject_id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.file where id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.biosample where id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.subject where id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.project where id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.collection where id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.collection_in_collection where superset_collection_id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.file_describes_collection where file_id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.file_in_collection where file_id_namespace IN ('tag:hubmapconsortium.org,2025:');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('tag:hubmapconsortium.org,2025:');
/* =============== DCC short label: MoTrPAC =============== */
/* ==== c2m2_path: ingest/c2m2s/MoTrPAC/2024-04-03_14-33-29.904/datapackage.zip === */
select count(*) from c2m2.project where id_namespace IN ('tag:motrpac-data.org,2023:');
select count(*) from c2m2.biosample where id_namespace IN ('tag:motrpac-data.org,2023:');
select count(*) from c2m2.subject where id_namespace IN ('tag:motrpac-data.org,2023:');
select count(*) from c2m2.collection where id_namespace IN ('tag:motrpac-data.org,2023:');
select count(*) from c2m2.subject_in_collection where subject_id_namespace IN ('tag:motrpac-data.org,2023:');
select count(*) from c2m2.file_in_collection where file_id_namespace IN ('tag:motrpac-data.org,2023:');
select count(*) from c2m2.biosample_in_collection where biosample_id_namespace IN ('tag:motrpac-data.org,2023:');
select count(*) from c2m2.file where id_namespace IN ('tag:motrpac-data.org,2023:');
select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('tag:motrpac-data.org,2023:');
/* =============== DCC short label: GTEx =============== */
/* ==== c2m2_path: ingest/c2m2s/GTEx/2025-01-15_15-57-28.898/submission.zip === */
select count(*) from c2m2.collection_in_collection where superset_collection_id_namespace IN ('egtex', 'adult_gtex');
select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('egtex', 'adult_gtex');
select count(*) from c2m2.project where id_namespace IN ('gtex', 'adult_gtex', 'egtex');
select count(*) from c2m2.biosample where id_namespace IN ('adult_gtex');
select count(*) from c2m2.subject where id_namespace IN ('adult_gtex');
select count(*) from c2m2.collection where id_namespace IN ('egtex', 'adult_gtex');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('gtex');
select count(*) from c2m2.file_in_collection where file_id_namespace IN ('egtex', 'adult_gtex');
select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('adult_gtex');
select count(*) from c2m2.file where id_namespace IN ('egtex', 'adult_gtex');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('adult_gtex');
/* =============== DCC short label: HMP =============== */
/* ==== c2m2_path: ingest/c2m2s/HMP/2022-06-20_00-00-00.000/datapackage.zip === */
select count(*) from c2m2.file_describes_biosample where file_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.collection where id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.biosample_in_collection where biosample_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.biosample_disease where biosample_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.subject where id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.file where id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.file_in_collection where file_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.project where id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.biosample where id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.collection_taxonomy where collection_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.subject_in_collection where subject_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.collection_in_collection where superset_collection_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.file_describes_subject where file_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
select count(*) from c2m2.subject_disease where subject_id_namespace IN ('tag:hmpdacc.org,2022-04-04:');
/* =============== DCC short label: Bridge2AI =============== */
/* ==== c2m2_path: ingest/c2m2s/Bridge2AI/2026-06-10_21-34-45.456/bridge2ai_voice_2026_06_C2M2.zip === */
select count(*) from c2m2.subject_race where subject_id_namespace IN ('bridge2ai_voice');
select count(*) from c2m2.file where id_namespace IN ('bridge2ai_voice');
select count(*) from c2m2.biosample where id_namespace IN ('bridge2ai_voice');
select count(*) from c2m2.subject where id_namespace IN ('bridge2ai_voice');
select count(*) from c2m2.project where id_namespace IN ('bridge2ai_voice');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('bridge2ai_voice');
select count(*) from c2m2.file_describes_biosample where file_id_namespace IN ('bridge2ai_voice');
select count(*) from c2m2.biosample_disease where biosample_id_namespace IN ('bridge2ai_voice');
/* =============== DCC short label: Bridge2AI =============== */
/* ==== c2m2_path: ingest/c2m2s/Bridge2AI/2026-01-08_07-14-53.636/C2M2_datapackage.zip === */
select count(*) from c2m2.file where id_namespace IN ('ai-readi');
select count(*) from c2m2.biosample where id_namespace IN ('ai-readi');
select count(*) from c2m2.subject where id_namespace IN ('ai-readi');
select count(*) from c2m2.project where id_namespace IN ('ai-readi');
select count(*) from c2m2.file_describes_biosample where file_id_namespace IN ('ai-readi');
select count(*) from c2m2.file_describes_subject where file_id_namespace IN ('ai-readi');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('ai-readi');
select count(*) from c2m2.subject_disease where subject_id_namespace IN ('ai-readi');
/* =============== DCC short label: Bridge2AI =============== */
/* ==== c2m2_path: ingest/c2m2s/Bridge2AI/2026-02-12_21-30-19.236/C2M2_datapackage.zip === */
select count(*) from c2m2.biosample_substance where biosample_id_namespace IN ('cm4ai');
select count(*) from c2m2.biosample_gene where biosample_id_namespace IN ('cm4ai');
select count(*) from c2m2.subject_race where subject_id_namespace IN ('cm4ai');
select count(*) from c2m2.file where id_namespace IN ('cm4ai');
select count(*) from c2m2.biosample where id_namespace IN ('cm4ai');
select count(*) from c2m2.subject where id_namespace IN ('cm4ai');
select count(*) from c2m2.project where id_namespace IN ('cm4ai', 'cm4ai_perturbseq', 'cm4ai_ppi', 'cm4ai_ploc', 'cm4ai_cellmaps');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('cm4ai');
select count(*) from c2m2.file_describes_biosample where file_id_namespace IN ('cm4ai');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('cm4ai');
select count(*) from c2m2.subject_disease where subject_id_namespace IN ('cm4ai');
/* =============== DCC short label: IDG =============== */
/* ==== c2m2_path: ingest/c2m2s/IDG/2024-07-03_18-19-15.671/IDG_C2M2_2024-01-09_datapackage_validated.zip === */
select count(*) from c2m2.collection where id_namespace IN ('https://www.druggablegenome.net/', 'https://druggablegenome.net/cfde_idg_tcrd_diseases', 'https://druggablegenome.net/cfde_idg_drugcentral_drugs', 'https://druggablegenome.net/cfde_idg_tcrd_targets');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('https://www.druggablegenome.net/');
select count(*) from c2m2.collection_taxonomy where collection_id_namespace IN ('https://www.druggablegenome.net/');
select count(*) from c2m2.collection_disease where collection_id_namespace IN ('https://druggablegenome.net/cfde_idg_tcrd_diseases');
select count(*) from c2m2.file_in_collection where file_id_namespace IN ('https://www.druggablegenome.net/', 'https://druggablegenome.net/cfde_idg_tcrd_diseases', 'https://druggablegenome.net/cfde_idg_drugcentral_drugs', 'https://druggablegenome.net/cfde_idg_tcrd_targets');
select count(*) from c2m2.collection_compound where collection_id_namespace IN ('https://www.druggablegenome.net/', 'https://druggablegenome.net/cfde_idg_drugcentral_drugs');
select count(*) from c2m2.file where id_namespace IN ('https://www.druggablegenome.net/', 'https://druggablegenome.net/cfde_idg_tcrd_diseases', 'https://druggablegenome.net/cfde_idg_drugcentral_drugs', 'https://druggablegenome.net/cfde_idg_tcrd_targets');
select count(*) from c2m2.collection_gene where collection_id_namespace IN ('https://www.druggablegenome.net/', 'https://druggablegenome.net/cfde_idg_tcrd_targets');
select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('https://www.druggablegenome.net/', 'https://druggablegenome.net/cfde_idg_tcrd_diseases', 'https://druggablegenome.net/cfde_idg_drugcentral_drugs', 'https://druggablegenome.net/cfde_idg_tcrd_targets');
select count(*) from c2m2.project where id_namespace IN ('https://www.druggablegenome.net/', 'https://druggablegenome.net/cfde_idg_tcrd_diseases', 'https://druggablegenome.net/cfde_idg_drugcentral_drugs', 'https://druggablegenome.net/cfde_idg_tcrd_targets');
/* =============== DCC short label: 4DN =============== */
/* ==== c2m2_path: ingest/c2m2s/4DN/2025-12-15_21-43-16.197/251215_4dn_c2m2_submission.zip === */
select count(*) from c2m2.collection_in_collection where superset_collection_id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.collection_defined_by_project where collection_id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.project where id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.biosample where id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.subject where id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.collection where id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.subject_in_collection where subject_id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.file_in_collection where file_id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.biosample_in_collection where biosample_id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.file where id_namespace IN ('https://data.4dnucleome.org');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('https://data.4dnucleome.org');
/* =============== DCC short label: SCGE =============== */
/* ==== c2m2_path: ingest/c2m2s/SCGE/2025-10-16_19-34-53.305/scge_cfde_submission_20251016_143304.zip === */
select count(*) from c2m2.biosample_gene where biosample_id_namespace IN ('scge.mcw.edu');
select count(*) from c2m2.subject_role_taxonomy where subject_id_namespace IN ('scge.mcw.edu');
select count(*) from c2m2.biosample where id_namespace IN ('scge.mcw.edu');
select count(*) from c2m2.subject where id_namespace IN ('scge.mcw.edu');
select count(*) from c2m2.project where id_namespace IN ('scge.mcw.edu');
select count(*) from c2m2.project_in_project where parent_project_id_namespace IN ('scge.mcw.edu');
select count(*) from c2m2.biosample_from_subject where biosample_id_namespace IN ('scge.mcw.edu');

