/*
  Warnings:

  - You are about to drop the `analysis_type` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `anatomy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assay_type` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `biosample` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `biosample_disease` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `biosample_from_subject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `biosample_gene` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `biosample_in_collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `biosample_substance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection_anatomy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection_compound` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection_defined_by_project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection_disease` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection_gene` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection_in_collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection_phenotype` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection_protein` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection_substance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection_taxonomy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `compound` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `data_type` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dcc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `disease` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file_describes_biosample` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file_describes_collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file_describes_subject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file_format` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file_in_collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gene` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `id_namespace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ncbi_taxonomy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `phenotype` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `phenotype_disease` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `phenotype_gene` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_in_project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `protein` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `protein_gene` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sample_prep_method` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subject_disease` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subject_in_collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subject_phenotype` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subject_race` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subject_role_taxonomy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subject_substance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `substance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "biosample" DROP CONSTRAINT "fk_biosample_anatomy_4";

-- DropForeignKey
ALTER TABLE "biosample" DROP CONSTRAINT "fk_biosample_id_namespace_1";

-- DropForeignKey
ALTER TABLE "biosample" DROP CONSTRAINT "fk_biosample_project_2";

-- DropForeignKey
ALTER TABLE "biosample" DROP CONSTRAINT "fk_biosample_sample_prep_method_3";

-- DropForeignKey
ALTER TABLE "biosample_disease" DROP CONSTRAINT "fk_biosample_disease_biosample_1";

-- DropForeignKey
ALTER TABLE "biosample_disease" DROP CONSTRAINT "fk_biosample_disease_disease_2";

-- DropForeignKey
ALTER TABLE "biosample_from_subject" DROP CONSTRAINT "fk_biosample_from_subject_biosample_1";

-- DropForeignKey
ALTER TABLE "biosample_from_subject" DROP CONSTRAINT "fk_biosample_from_subject_subject_2";

-- DropForeignKey
ALTER TABLE "biosample_gene" DROP CONSTRAINT "fk_biosample_gene_biosample_1";

-- DropForeignKey
ALTER TABLE "biosample_gene" DROP CONSTRAINT "fk_biosample_gene_gene_2";

-- DropForeignKey
ALTER TABLE "biosample_in_collection" DROP CONSTRAINT "fk_biosample_in_collection_biosample_1";

-- DropForeignKey
ALTER TABLE "biosample_in_collection" DROP CONSTRAINT "fk_biosample_in_collection_collection_2";

-- DropForeignKey
ALTER TABLE "biosample_substance" DROP CONSTRAINT "fk_biosample_substance_biosample_1";

-- DropForeignKey
ALTER TABLE "biosample_substance" DROP CONSTRAINT "fk_biosample_substance_substance_2";

-- DropForeignKey
ALTER TABLE "collection" DROP CONSTRAINT "fk_collection_id_namespace_1";

-- DropForeignKey
ALTER TABLE "collection_anatomy" DROP CONSTRAINT "fk_collection_anatomy_anatomy_2";

-- DropForeignKey
ALTER TABLE "collection_anatomy" DROP CONSTRAINT "fk_collection_anatomy_collection_1";

-- DropForeignKey
ALTER TABLE "collection_compound" DROP CONSTRAINT "fk_collection_compound_collection_1";

-- DropForeignKey
ALTER TABLE "collection_compound" DROP CONSTRAINT "fk_collection_compound_compound_2";

-- DropForeignKey
ALTER TABLE "collection_defined_by_project" DROP CONSTRAINT "fk_collection_defined_by_project_collection_1";

-- DropForeignKey
ALTER TABLE "collection_defined_by_project" DROP CONSTRAINT "fk_collection_defined_by_project_project_2";

-- DropForeignKey
ALTER TABLE "collection_disease" DROP CONSTRAINT "fk_collection_disease_collection_1";

-- DropForeignKey
ALTER TABLE "collection_disease" DROP CONSTRAINT "fk_collection_disease_disease_2";

-- DropForeignKey
ALTER TABLE "collection_gene" DROP CONSTRAINT "fk_collection_gene_collection_1";

-- DropForeignKey
ALTER TABLE "collection_gene" DROP CONSTRAINT "fk_collection_gene_gene_2";

-- DropForeignKey
ALTER TABLE "collection_in_collection" DROP CONSTRAINT "fk_collection_in_collection_collection_1";

-- DropForeignKey
ALTER TABLE "collection_in_collection" DROP CONSTRAINT "fk_collection_in_collection_collection_2";

-- DropForeignKey
ALTER TABLE "collection_phenotype" DROP CONSTRAINT "fk_collection_phenotype_collection_1";

-- DropForeignKey
ALTER TABLE "collection_phenotype" DROP CONSTRAINT "fk_collection_phenotype_phenotype_2";

-- DropForeignKey
ALTER TABLE "collection_protein" DROP CONSTRAINT "fk_collection_protein_collection_1";

-- DropForeignKey
ALTER TABLE "collection_protein" DROP CONSTRAINT "fk_collection_protein_protein_2";

-- DropForeignKey
ALTER TABLE "collection_substance" DROP CONSTRAINT "fk_collection_substance_collection_1";

-- DropForeignKey
ALTER TABLE "collection_substance" DROP CONSTRAINT "fk_collection_substance_substance_2";

-- DropForeignKey
ALTER TABLE "collection_taxonomy" DROP CONSTRAINT "fk_collection_taxonomy_collection_1";

-- DropForeignKey
ALTER TABLE "collection_taxonomy" DROP CONSTRAINT "fk_collection_taxonomy_ncbi_taxonomy_2";

-- DropForeignKey
ALTER TABLE "dcc" DROP CONSTRAINT "fk_dcc_project_1";

-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "fk_file_analysis_type_7";

-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "fk_file_assay_type_6";

-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "fk_file_collection_8";

-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "fk_file_data_type_5";

-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "fk_file_file_format_3";

-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "fk_file_file_format_4";

-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "fk_file_id_namespace_1";

-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "fk_file_project_2";

-- DropForeignKey
ALTER TABLE "file_describes_biosample" DROP CONSTRAINT "fk_file_describes_biosample_biosample_2";

-- DropForeignKey
ALTER TABLE "file_describes_biosample" DROP CONSTRAINT "fk_file_describes_biosample_file_1";

-- DropForeignKey
ALTER TABLE "file_describes_collection" DROP CONSTRAINT "fk_file_describes_collection_collection_2";

-- DropForeignKey
ALTER TABLE "file_describes_collection" DROP CONSTRAINT "fk_file_describes_collection_file_1";

-- DropForeignKey
ALTER TABLE "file_describes_subject" DROP CONSTRAINT "fk_file_describes_subject_file_1";

-- DropForeignKey
ALTER TABLE "file_describes_subject" DROP CONSTRAINT "fk_file_describes_subject_subject_2";

-- DropForeignKey
ALTER TABLE "file_in_collection" DROP CONSTRAINT "fk_file_in_collection_collection_2";

-- DropForeignKey
ALTER TABLE "file_in_collection" DROP CONSTRAINT "fk_file_in_collection_file_1";

-- DropForeignKey
ALTER TABLE "gene" DROP CONSTRAINT "fk_gene_ncbi_taxonomy_1";

-- DropForeignKey
ALTER TABLE "phenotype_disease" DROP CONSTRAINT "fk_phenotype_disease_disease_2";

-- DropForeignKey
ALTER TABLE "phenotype_disease" DROP CONSTRAINT "fk_phenotype_disease_phenotype_1";

-- DropForeignKey
ALTER TABLE "phenotype_gene" DROP CONSTRAINT "fk_phenotype_gene_gene_2";

-- DropForeignKey
ALTER TABLE "phenotype_gene" DROP CONSTRAINT "fk_phenotype_gene_phenotype_1";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "fk_project_id_namespace_1";

-- DropForeignKey
ALTER TABLE "project_in_project" DROP CONSTRAINT "fk_project_in_project_project_1";

-- DropForeignKey
ALTER TABLE "project_in_project" DROP CONSTRAINT "fk_project_in_project_project_2";

-- DropForeignKey
ALTER TABLE "protein" DROP CONSTRAINT "fk_protein_ncbi_taxonomy_1";

-- DropForeignKey
ALTER TABLE "protein_gene" DROP CONSTRAINT "fk_protein_gene_gene_2";

-- DropForeignKey
ALTER TABLE "protein_gene" DROP CONSTRAINT "fk_protein_gene_protein_1";

-- DropForeignKey
ALTER TABLE "subject" DROP CONSTRAINT "fk_subject_id_namespace_1";

-- DropForeignKey
ALTER TABLE "subject" DROP CONSTRAINT "fk_subject_project_2";

-- DropForeignKey
ALTER TABLE "subject_disease" DROP CONSTRAINT "fk_subject_disease_disease_2";

-- DropForeignKey
ALTER TABLE "subject_disease" DROP CONSTRAINT "fk_subject_disease_subject_1";

-- DropForeignKey
ALTER TABLE "subject_in_collection" DROP CONSTRAINT "fk_subject_in_collection_collection_2";

-- DropForeignKey
ALTER TABLE "subject_in_collection" DROP CONSTRAINT "fk_subject_in_collection_subject_1";

-- DropForeignKey
ALTER TABLE "subject_phenotype" DROP CONSTRAINT "fk_subject_phenotype_phenotype_2";

-- DropForeignKey
ALTER TABLE "subject_phenotype" DROP CONSTRAINT "fk_subject_phenotype_subject_1";

-- DropForeignKey
ALTER TABLE "subject_race" DROP CONSTRAINT "fk_subject_race_subject_1";

-- DropForeignKey
ALTER TABLE "subject_role_taxonomy" DROP CONSTRAINT "fk_subject_role_taxonomy_ncbi_taxonomy_2";

-- DropForeignKey
ALTER TABLE "subject_role_taxonomy" DROP CONSTRAINT "fk_subject_role_taxonomy_subject_1";

-- DropForeignKey
ALTER TABLE "subject_substance" DROP CONSTRAINT "fk_subject_substance_subject_1";

-- DropForeignKey
ALTER TABLE "subject_substance" DROP CONSTRAINT "fk_subject_substance_substance_2";

-- DropForeignKey
ALTER TABLE "substance" DROP CONSTRAINT "fk_substance_compound_1";

-- DropTable
DROP TABLE "analysis_type";

-- DropTable
DROP TABLE "anatomy";

-- DropTable
DROP TABLE "assay_type";

-- DropTable
DROP TABLE "biosample";

-- DropTable
DROP TABLE "biosample_disease";

-- DropTable
DROP TABLE "biosample_from_subject";

-- DropTable
DROP TABLE "biosample_gene";

-- DropTable
DROP TABLE "biosample_in_collection";

-- DropTable
DROP TABLE "biosample_substance";

-- DropTable
DROP TABLE "collection";

-- DropTable
DROP TABLE "collection_anatomy";

-- DropTable
DROP TABLE "collection_compound";

-- DropTable
DROP TABLE "collection_defined_by_project";

-- DropTable
DROP TABLE "collection_disease";

-- DropTable
DROP TABLE "collection_gene";

-- DropTable
DROP TABLE "collection_in_collection";

-- DropTable
DROP TABLE "collection_phenotype";

-- DropTable
DROP TABLE "collection_protein";

-- DropTable
DROP TABLE "collection_substance";

-- DropTable
DROP TABLE "collection_taxonomy";

-- DropTable
DROP TABLE "compound";

-- DropTable
DROP TABLE "data_type";

-- DropTable
DROP TABLE "dcc";

-- DropTable
DROP TABLE "disease";

-- DropTable
DROP TABLE "file";

-- DropTable
DROP TABLE "file_describes_biosample";

-- DropTable
DROP TABLE "file_describes_collection";

-- DropTable
DROP TABLE "file_describes_subject";

-- DropTable
DROP TABLE "file_format";

-- DropTable
DROP TABLE "file_in_collection";

-- DropTable
DROP TABLE "gene";

-- DropTable
DROP TABLE "id_namespace";

-- DropTable
DROP TABLE "ncbi_taxonomy";

-- DropTable
DROP TABLE "phenotype";

-- DropTable
DROP TABLE "phenotype_disease";

-- DropTable
DROP TABLE "phenotype_gene";

-- DropTable
DROP TABLE "project";

-- DropTable
DROP TABLE "project_in_project";

-- DropTable
DROP TABLE "protein";

-- DropTable
DROP TABLE "protein_gene";

-- DropTable
DROP TABLE "sample_prep_method";

-- DropTable
DROP TABLE "subject";

-- DropTable
DROP TABLE "subject_disease";

-- DropTable
DROP TABLE "subject_in_collection";

-- DropTable
DROP TABLE "subject_phenotype";

-- DropTable
DROP TABLE "subject_race";

-- DropTable
DROP TABLE "subject_role_taxonomy";

-- DropTable
DROP TABLE "subject_substance";

-- DropTable
DROP TABLE "substance";
