/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DCCToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GeneEntityToGeneSetLibraryNode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GeneEntityToGeneSetNode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `c2m2_datapackage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `c2m2_file_node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `code_assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dcc_asset_node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dcc_assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dcc_outreach` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dcc_partnerships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dcc_publications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dcc_usecase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dccs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `entity_node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file_assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gene_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gene_set_library_node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gene_set_node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kg_assertion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kg_relation_node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kvstore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `outreach` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `partnership_publications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `partnerships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `publications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tools` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usecase` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('entity', 'gene_set', 'gene_set_library', 'c2m2_file', 'kg_relation', 'dcc_asset');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'DCC_APPROVER', 'UPLOADER', 'DRC_APPROVER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_DCCToUser" DROP CONSTRAINT "_DCCToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_DCCToUser" DROP CONSTRAINT "_DCCToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_GeneEntityToGeneSetLibraryNode" DROP CONSTRAINT "_GeneEntityToGeneSetLibraryNode_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_GeneEntityToGeneSetLibraryNode" DROP CONSTRAINT "_GeneEntityToGeneSetLibraryNode_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_GeneEntityToGeneSetNode" DROP CONSTRAINT "_GeneEntityToGeneSetNode_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_GeneEntityToGeneSetNode" DROP CONSTRAINT "_GeneEntityToGeneSetNode_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."c2m2_datapackage" DROP CONSTRAINT "c2m2_datapackage_dcc_asset_link_fkey";

-- DropForeignKey
ALTER TABLE "public"."c2m2_file_node" DROP CONSTRAINT "c2m2_file_node_c2m2_datapackage_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."c2m2_file_node" DROP CONSTRAINT "c2m2_file_node_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."code_assets" DROP CONSTRAINT "code_assets_link_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_asset_node" DROP CONSTRAINT "dcc_asset_node_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_asset_node" DROP CONSTRAINT "dcc_asset_node_link_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_assets" DROP CONSTRAINT "dcc_assets_creator_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_assets" DROP CONSTRAINT "dcc_assets_dcc_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_outreach" DROP CONSTRAINT "dcc_outreach_dcc_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_outreach" DROP CONSTRAINT "dcc_outreach_outreach_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_partnerships" DROP CONSTRAINT "dcc_partnerships_dcc_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_partnerships" DROP CONSTRAINT "dcc_partnerships_partnership_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_publications" DROP CONSTRAINT "dcc_publications_dcc_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_publications" DROP CONSTRAINT "dcc_publications_publication_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_usecase" DROP CONSTRAINT "dcc_usecase_dcc_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."dcc_usecase" DROP CONSTRAINT "dcc_usecase_usecase_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."entity_node" DROP CONSTRAINT "entity_node_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."file_assets" DROP CONSTRAINT "file_assets_link_fkey";

-- DropForeignKey
ALTER TABLE "public"."gene_entity" DROP CONSTRAINT "gene_entity_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."gene_set_library_node" DROP CONSTRAINT "gene_set_library_node_dcc_asset_link_fkey";

-- DropForeignKey
ALTER TABLE "public"."gene_set_library_node" DROP CONSTRAINT "gene_set_library_node_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."gene_set_node" DROP CONSTRAINT "gene_set_node_gene_set_library_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."gene_set_node" DROP CONSTRAINT "gene_set_node_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."kg_assertion" DROP CONSTRAINT "kg_assertion_dcc_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."kg_assertion" DROP CONSTRAINT "kg_assertion_relation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."kg_assertion" DROP CONSTRAINT "kg_assertion_source_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."kg_assertion" DROP CONSTRAINT "kg_assertion_target_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."kg_relation_node" DROP CONSTRAINT "kg_relation_node_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."node" DROP CONSTRAINT "node_dcc_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."partnership_publications" DROP CONSTRAINT "partnership_publications_partnership_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."partnership_publications" DROP CONSTRAINT "partnership_publications_publication_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."publications" DROP CONSTRAINT "publications_tool_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."usecase" DROP CONSTRAINT "usecase_creator_dcc_id_fkey";

-- DropTable
DROP TABLE "public"."Account";

-- DropTable
DROP TABLE "public"."Session";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."VerificationToken";

-- DropTable
DROP TABLE "public"."_DCCToUser";

-- DropTable
DROP TABLE "public"."_GeneEntityToGeneSetLibraryNode";

-- DropTable
DROP TABLE "public"."_GeneEntityToGeneSetNode";

-- DropTable
DROP TABLE "public"."c2m2_datapackage";

-- DropTable
DROP TABLE "public"."c2m2_file_node";

-- DropTable
DROP TABLE "public"."code_assets";

-- DropTable
DROP TABLE "public"."dcc_asset_node";

-- DropTable
DROP TABLE "public"."dcc_assets";

-- DropTable
DROP TABLE "public"."dcc_outreach";

-- DropTable
DROP TABLE "public"."dcc_partnerships";

-- DropTable
DROP TABLE "public"."dcc_publications";

-- DropTable
DROP TABLE "public"."dcc_usecase";

-- DropTable
DROP TABLE "public"."dccs";

-- DropTable
DROP TABLE "public"."entity_node";

-- DropTable
DROP TABLE "public"."file_assets";

-- DropTable
DROP TABLE "public"."gene_entity";

-- DropTable
DROP TABLE "public"."gene_set_library_node";

-- DropTable
DROP TABLE "public"."gene_set_node";

-- DropTable
DROP TABLE "public"."kg_assertion";

-- DropTable
DROP TABLE "public"."kg_relation_node";

-- DropTable
DROP TABLE "public"."kvstore";

-- DropTable
DROP TABLE "public"."node";

-- DropTable
DROP TABLE "public"."outreach";

-- DropTable
DROP TABLE "public"."partnership_publications";

-- DropTable
DROP TABLE "public"."partnerships";

-- DropTable
DROP TABLE "public"."publications";

-- DropTable
DROP TABLE "public"."tools";

-- DropTable
DROP TABLE "public"."usecase";

-- DropEnum
DROP TYPE "public"."NodeType";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "dcc" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "c2m2_datapackage" (
    "id" UUID NOT NULL,
    "dcc_asset_link" TEXT NOT NULL,

    CONSTRAINT "c2m2_datapackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "c2m2_file_node" (
    "id" UUID NOT NULL,
    "c2m2_datapackage_id" UUID NOT NULL,
    "creation_time" TIMESTAMPTZ(6),
    "persistent_id" TEXT,
    "size_in_bytes" BIGINT,
    "file_format" TEXT,
    "data_type" TEXT,
    "assay_type" TEXT,

    CONSTRAINT "c2m2_file_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_assets" (
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "description" TEXT,
    "openAPISpec" BOOLEAN,
    "smartAPISpec" BOOLEAN,
    "smartAPIURL" TEXT,

    CONSTRAINT "code_assets_pkey" PRIMARY KEY ("type","link")
);

-- CreateTable
CREATE TABLE "dcc_asset_node" (
    "id" UUID NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "dcc_asset_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcc_assets" (
    "link" TEXT NOT NULL,
    "lastmodified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current" BOOLEAN NOT NULL DEFAULT true,
    "creator" TEXT,
    "dcc_id" TEXT NOT NULL,
    "drcapproved" BOOLEAN NOT NULL DEFAULT false,
    "dccapproved" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created" VARCHAR,

    CONSTRAINT "dcc_assets_pkey" PRIMARY KEY ("dcc_id","link","lastmodified")
);

-- CreateTable
CREATE TABLE "dcc_outreach" (
    "outreach_id" TEXT NOT NULL,
    "dcc_id" TEXT NOT NULL,

    CONSTRAINT "dcc_outreach_pkey" PRIMARY KEY ("outreach_id","dcc_id")
);

-- CreateTable
CREATE TABLE "dcc_partnerships" (
    "partnership_id" TEXT NOT NULL,
    "dcc_id" TEXT NOT NULL,

    CONSTRAINT "dcc_partnerships_pkey" PRIMARY KEY ("partnership_id","dcc_id")
);

-- CreateTable
CREATE TABLE "dcc_publications" (
    "dcc_id" TEXT NOT NULL,
    "publication_id" TEXT NOT NULL,

    CONSTRAINT "dcc_publications_pkey" PRIMARY KEY ("publication_id","dcc_id")
);

-- CreateTable
CREATE TABLE "dcc_usecase" (
    "usecase_id" TEXT NOT NULL,
    "dcc_id" TEXT NOT NULL,

    CONSTRAINT "dcc_usecase_pkey" PRIMARY KEY ("usecase_id","dcc_id")
);

-- CreateTable
CREATE TABLE "dccs" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "homepage" TEXT NOT NULL,
    "icon" TEXT,
    "annotation" JSONB,
    "short_label" TEXT,
    "cfde_partner" BOOLEAN NOT NULL DEFAULT false,
    "cf_site" TEXT,

    CONSTRAINT "dccs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_node" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "entity_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_assets" (
    "filetype" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "size" BIGINT,
    "sha256checksum" TEXT,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("filetype","link")
);

-- CreateTable
CREATE TABLE "gene_entity" (
    "id" UUID NOT NULL,
    "entrez" TEXT NOT NULL,
    "ensembl" TEXT NOT NULL,

    CONSTRAINT "gene_entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gene_set_library_node" (
    "id" UUID NOT NULL,
    "dcc_asset_link" TEXT NOT NULL,

    CONSTRAINT "gene_set_library_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gene_set_node" (
    "id" UUID NOT NULL,
    "gene_set_library_id" UUID NOT NULL,

    CONSTRAINT "gene_set_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kg_assertion" (
    "id" UUID NOT NULL,
    "relation_id" UUID NOT NULL,
    "source_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "dcc_id" TEXT,
    "SAB" TEXT NOT NULL,
    "evidence" JSONB,

    CONSTRAINT "kg_assertion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kg_relation_node" (
    "id" UUID NOT NULL,

    CONSTRAINT "kg_relation_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node" (
    "dcc_id" TEXT,
    "id" UUID NOT NULL,
    "type" "NodeType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "searchable" tsvector DEFAULT to_tsvector('english'::regconfig, ((label || ' '::text) || description)),

    CONSTRAINT "node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "short_description" TEXT NOT NULL,
    "end_date" TIMESTAMPTZ(3),
    "start_date" TIMESTAMPTZ(3),
    "image" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB NOT NULL,
    "application_end" TIMESTAMPTZ(3),
    "application_start" TIMESTAMPTZ(3),
    "carousel" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "outreach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partnership_publications" (
    "partnership_id" TEXT NOT NULL,
    "publication_id" TEXT NOT NULL,

    CONSTRAINT "partnership_publications_pkey" PRIMARY KEY ("partnership_id","publication_id")
);

-- CreateTable
CREATE TABLE "partnerships" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "status" TEXT,
    "website" TEXT,

    CONSTRAINT "partnerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "doi" TEXT,
    "issue" TEXT,
    "journal" TEXT,
    "page" TEXT,
    "pmcid" TEXT,
    "pmid" TEXT,
    "title" TEXT NOT NULL,
    "volume" TEXT,
    "year" TEXT,
    "tool_id" TEXT,
    "landmark" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usecase" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "sources" JSONB NOT NULL,
    "link" TEXT,
    "image" TEXT,
    "tutorial" TEXT,
    "creator_dcc_id" TEXT,

    CONSTRAINT "usecase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_type" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',

    CONSTRAINT "analysis_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anatomy" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',

    CONSTRAINT "anatomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assay_type" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',

    CONSTRAINT "assay_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biosample" (
    "id_namespace" VARCHAR NOT NULL,
    "local_id" VARCHAR NOT NULL,
    "project_id_namespace" VARCHAR NOT NULL,
    "project_local_id" VARCHAR NOT NULL,
    "persistent_id" VARCHAR DEFAULT '',
    "creation_time" VARCHAR DEFAULT '',
    "sample_prep_method" VARCHAR DEFAULT '',
    "anatomy" VARCHAR DEFAULT '',

    CONSTRAINT "biosample_pkey" PRIMARY KEY ("id_namespace","local_id")
);

-- CreateTable
CREATE TABLE "biosample_disease" (
    "biosample_id_namespace" VARCHAR NOT NULL,
    "biosample_local_id" VARCHAR NOT NULL,
    "association_type" VARCHAR NOT NULL,
    "disease" VARCHAR NOT NULL,

    CONSTRAINT "biosample_disease_pkey" PRIMARY KEY ("biosample_id_namespace","biosample_local_id","association_type","disease")
);

-- CreateTable
CREATE TABLE "biosample_from_subject" (
    "biosample_id_namespace" VARCHAR NOT NULL,
    "biosample_local_id" VARCHAR NOT NULL,
    "subject_id_namespace" VARCHAR NOT NULL,
    "subject_local_id" VARCHAR NOT NULL,
    "age_at_sampling" VARCHAR DEFAULT '',

    CONSTRAINT "biosample_from_subject_pkey" PRIMARY KEY ("biosample_id_namespace","biosample_local_id","subject_id_namespace","subject_local_id")
);

-- CreateTable
CREATE TABLE "biosample_gene" (
    "biosample_id_namespace" VARCHAR NOT NULL,
    "biosample_local_id" VARCHAR NOT NULL,
    "gene" VARCHAR NOT NULL,

    CONSTRAINT "biosample_gene_pkey" PRIMARY KEY ("biosample_id_namespace","biosample_local_id","gene")
);

-- CreateTable
CREATE TABLE "biosample_in_collection" (
    "biosample_id_namespace" VARCHAR NOT NULL,
    "biosample_local_id" VARCHAR NOT NULL,
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,

    CONSTRAINT "biosample_in_collection_pkey" PRIMARY KEY ("biosample_id_namespace","biosample_local_id","collection_id_namespace","collection_local_id")
);

-- CreateTable
CREATE TABLE "biosample_substance" (
    "biosample_id_namespace" VARCHAR NOT NULL,
    "biosample_local_id" VARCHAR NOT NULL,
    "substance" VARCHAR NOT NULL,

    CONSTRAINT "biosample_substance_pkey" PRIMARY KEY ("biosample_id_namespace","biosample_local_id","substance")
);

-- CreateTable
CREATE TABLE "collection" (
    "id_namespace" VARCHAR NOT NULL,
    "local_id" VARCHAR NOT NULL,
    "persistent_id" VARCHAR DEFAULT '',
    "creation_time" VARCHAR DEFAULT '',
    "abbreviation" VARCHAR DEFAULT '',
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "has_time_series_data" VARCHAR DEFAULT '',

    CONSTRAINT "collection_pkey" PRIMARY KEY ("id_namespace","local_id")
);

-- CreateTable
CREATE TABLE "collection_anatomy" (
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,
    "anatomy" VARCHAR NOT NULL,

    CONSTRAINT "collection_anatomy_pkey" PRIMARY KEY ("collection_id_namespace","collection_local_id","anatomy")
);

-- CreateTable
CREATE TABLE "collection_compound" (
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,
    "compound" VARCHAR NOT NULL,

    CONSTRAINT "collection_compound_pkey" PRIMARY KEY ("collection_id_namespace","collection_local_id","compound")
);

-- CreateTable
CREATE TABLE "collection_defined_by_project" (
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,
    "project_id_namespace" VARCHAR NOT NULL,
    "project_local_id" VARCHAR NOT NULL,

    CONSTRAINT "collection_defined_by_project_pkey" PRIMARY KEY ("collection_id_namespace","collection_local_id","project_id_namespace","project_local_id")
);

-- CreateTable
CREATE TABLE "collection_disease" (
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,
    "disease" VARCHAR NOT NULL,

    CONSTRAINT "collection_disease_pkey" PRIMARY KEY ("collection_id_namespace","collection_local_id","disease")
);

-- CreateTable
CREATE TABLE "collection_gene" (
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,
    "gene" VARCHAR NOT NULL,

    CONSTRAINT "collection_gene_pkey" PRIMARY KEY ("collection_id_namespace","collection_local_id","gene")
);

-- CreateTable
CREATE TABLE "collection_in_collection" (
    "superset_collection_id_namespace" VARCHAR NOT NULL,
    "superset_collection_local_id" VARCHAR NOT NULL,
    "subset_collection_id_namespace" VARCHAR NOT NULL,
    "subset_collection_local_id" VARCHAR NOT NULL,

    CONSTRAINT "collection_in_collection_pkey" PRIMARY KEY ("superset_collection_id_namespace","superset_collection_local_id","subset_collection_id_namespace","subset_collection_local_id")
);

-- CreateTable
CREATE TABLE "collection_phenotype" (
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,
    "phenotype" VARCHAR NOT NULL,

    CONSTRAINT "collection_phenotype_pkey" PRIMARY KEY ("collection_id_namespace","collection_local_id","phenotype")
);

-- CreateTable
CREATE TABLE "collection_protein" (
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,
    "protein" VARCHAR NOT NULL,

    CONSTRAINT "collection_protein_pkey" PRIMARY KEY ("collection_id_namespace","collection_local_id","protein")
);

-- CreateTable
CREATE TABLE "collection_substance" (
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,
    "substance" VARCHAR NOT NULL,

    CONSTRAINT "collection_substance_pkey" PRIMARY KEY ("collection_id_namespace","collection_local_id","substance")
);

-- CreateTable
CREATE TABLE "collection_taxonomy" (
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,
    "taxon" VARCHAR NOT NULL,

    CONSTRAINT "collection_taxonomy_pkey" PRIMARY KEY ("collection_id_namespace","collection_local_id","taxon")
);

-- CreateTable
CREATE TABLE "compound" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',

    CONSTRAINT "compound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_type" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',

    CONSTRAINT "data_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcc" (
    "id" VARCHAR NOT NULL,
    "dcc_name" VARCHAR NOT NULL,
    "dcc_abbreviation" VARCHAR NOT NULL,
    "dcc_description" VARCHAR DEFAULT '',
    "contact_email" VARCHAR NOT NULL,
    "contact_name" VARCHAR NOT NULL,
    "dcc_url" VARCHAR NOT NULL,
    "project_id_namespace" VARCHAR NOT NULL,
    "project_local_id" VARCHAR NOT NULL,

    CONSTRAINT "dcc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disease" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',

    CONSTRAINT "disease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disease_association_type" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,

    CONSTRAINT "disease_association_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ffl_biosample" (
    "searchable" tsvector,
    "biosample_id_namespace" VARCHAR NOT NULL,
    "biosample_local_id" VARCHAR NOT NULL,
    "project_id_namespace" VARCHAR,
    "project_local_id" VARCHAR,
    "biosample_persistent_id" VARCHAR,
    "biosample_creation_time" VARCHAR,
    "sample_prep_method" VARCHAR,
    "anatomy" VARCHAR,
    "disease_association_type" VARCHAR,
    "disease" VARCHAR,
    "subject_id_namespace" VARCHAR,
    "subject_local_id" VARCHAR,
    "biosample_age_at_sampling" VARCHAR,
    "gene" VARCHAR,
    "collection_id_namespace" VARCHAR,
    "collection_local_id" VARCHAR,
    "substance" VARCHAR,
    "dcc_name" VARCHAR,
    "dcc_abbreviation" VARCHAR,
    "anatomy_name" VARCHAR,
    "gene_name" VARCHAR,
    "disease_name" VARCHAR,
    "subject_granularity" VARCHAR,
    "subject_sex" VARCHAR,
    "subject_ethnicity" VARCHAR,
    "subject_age_at_enrollment" VARCHAR,
    "substance_name" VARCHAR,
    "substance_compound" VARCHAR,
    "compound_name" VARCHAR,
    "project_name" VARCHAR,
    "project_abbreviation" VARCHAR,
    "data_type_id" VARCHAR,
    "data_type_name" VARCHAR,
    "subject_role_taxonomy_taxonomy_id" VARCHAR,
    "ncbi_taxonomy_name" VARCHAR,
    "collection_name" VARCHAR,
    "collection_abbreviation" VARCHAR,
    "collection_has_time_series_data" VARCHAR,
    "sample_prep_method_name" VARCHAR,
    "subject_race" VARCHAR,
    "subject_race_name" VARCHAR,
    "subject_granularity_name" VARCHAR,
    "subject_sex_name" VARCHAR,
    "subject_ethnicity_name" VARCHAR,
    "subject_role_taxonomy_role_id" VARCHAR,
    "subject_role_name" VARCHAR,
    "disease_association_type_name" VARCHAR,
    "phenotype_association_type" VARCHAR,
    "phenotype" VARCHAR,
    "phenotype_association_type_name" VARCHAR,
    "phenotype_name" VARCHAR,

    CONSTRAINT "ffl_biosample_pkey" PRIMARY KEY ("biosample_id_namespace","biosample_local_id")
);

-- CreateTable
CREATE TABLE "project_data_type" (
    "project_id_namespace" VARCHAR,
    "project_local_id" VARCHAR,
    "data_type_id" VARCHAR,
    "data_type_name" VARCHAR,
    "data_type_description" VARCHAR,
    "pk_id" INTEGER NOT NULL,

    CONSTRAINT "project_data_type_pkey" PRIMARY KEY ("pk_id")
);

-- CreateTable
CREATE TABLE "file" (
    "id_namespace" VARCHAR NOT NULL,
    "local_id" VARCHAR NOT NULL,
    "project_id_namespace" VARCHAR NOT NULL,
    "project_local_id" VARCHAR NOT NULL,
    "persistent_id" VARCHAR DEFAULT '',
    "creation_time" VARCHAR DEFAULT '',
    "size_in_bytes" VARCHAR DEFAULT '',
    "uncompressed_size_in_bytes" VARCHAR DEFAULT '',
    "sha256" VARCHAR DEFAULT '',
    "md5" VARCHAR DEFAULT '',
    "filename" VARCHAR NOT NULL,
    "file_format" VARCHAR DEFAULT '',
    "compression_format" VARCHAR DEFAULT '',
    "data_type" VARCHAR DEFAULT '',
    "assay_type" VARCHAR DEFAULT '',
    "analysis_type" VARCHAR DEFAULT '',
    "mime_type" VARCHAR DEFAULT '',
    "bundle_collection_id_namespace" VARCHAR DEFAULT '',
    "bundle_collection_local_id" VARCHAR DEFAULT '',
    "dbgap_study_id" VARCHAR DEFAULT '',

    CONSTRAINT "file_pkey" PRIMARY KEY ("id_namespace","local_id")
);

-- CreateTable
CREATE TABLE "file_describes_biosample" (
    "file_id_namespace" VARCHAR NOT NULL,
    "file_local_id" VARCHAR NOT NULL,
    "biosample_id_namespace" VARCHAR NOT NULL,
    "biosample_local_id" VARCHAR NOT NULL,

    CONSTRAINT "file_describes_biosample_pkey" PRIMARY KEY ("file_id_namespace","file_local_id","biosample_id_namespace","biosample_local_id")
);

-- CreateTable
CREATE TABLE "file_describes_collection" (
    "file_id_namespace" VARCHAR NOT NULL,
    "file_local_id" VARCHAR NOT NULL,
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,

    CONSTRAINT "file_describes_collection_pkey" PRIMARY KEY ("file_id_namespace","file_local_id","collection_id_namespace","collection_local_id")
);

-- CreateTable
CREATE TABLE "file_describes_subject" (
    "file_id_namespace" VARCHAR NOT NULL,
    "file_local_id" VARCHAR NOT NULL,
    "subject_id_namespace" VARCHAR NOT NULL,
    "subject_local_id" VARCHAR NOT NULL,

    CONSTRAINT "file_describes_subject_pkey" PRIMARY KEY ("file_id_namespace","file_local_id","subject_id_namespace","subject_local_id")
);

-- CreateTable
CREATE TABLE "file_format" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',

    CONSTRAINT "file_format_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_in_collection" (
    "file_id_namespace" VARCHAR NOT NULL,
    "file_local_id" VARCHAR NOT NULL,
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,

    CONSTRAINT "file_in_collection_pkey" PRIMARY KEY ("file_id_namespace","file_local_id","collection_id_namespace","collection_local_id")
);

-- CreateTable
CREATE TABLE "fl_biosample" (
    "id_namespace" VARCHAR,
    "local_id" VARCHAR,
    "project_id_namespace" VARCHAR,
    "project_local_id" VARCHAR,
    "persistent_id" VARCHAR,
    "creation_time" VARCHAR,
    "sample_prep_method" VARCHAR,
    "anatomy" VARCHAR,
    "association_type" VARCHAR,
    "disease" VARCHAR,
    "subject_id_namespace" VARCHAR,
    "subject_local_id" VARCHAR,
    "age_at_sampling" VARCHAR,
    "gene" VARCHAR,
    "collection_id_namespace" VARCHAR,
    "collection_local_id" VARCHAR,
    "substance" VARCHAR
);

-- CreateTable
CREATE TABLE "gene" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',
    "organism" VARCHAR NOT NULL,

    CONSTRAINT "gene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_namespace" (
    "id" VARCHAR NOT NULL,
    "abbreviation" VARCHAR DEFAULT '',
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',

    CONSTRAINT "id_namespace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ncbi_taxonomy" (
    "id" VARCHAR NOT NULL,
    "clade" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',

    CONSTRAINT "ncbi_taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phenotype" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',

    CONSTRAINT "phenotype_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phenotype_association_type" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,

    CONSTRAINT "phenotype_association_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phenotype_disease" (
    "phenotype" VARCHAR NOT NULL,
    "disease" VARCHAR NOT NULL,

    CONSTRAINT "phenotype_disease_pkey" PRIMARY KEY ("phenotype","disease")
);

-- CreateTable
CREATE TABLE "phenotype_gene" (
    "phenotype" VARCHAR NOT NULL,
    "gene" VARCHAR NOT NULL,

    CONSTRAINT "phenotype_gene_pkey" PRIMARY KEY ("phenotype","gene")
);

-- CreateTable
CREATE TABLE "project" (
    "id_namespace" VARCHAR NOT NULL,
    "local_id" VARCHAR NOT NULL,
    "persistent_id" VARCHAR DEFAULT '',
    "creation_time" VARCHAR DEFAULT '',
    "abbreviation" VARCHAR DEFAULT '',
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',

    CONSTRAINT "project_pkey" PRIMARY KEY ("id_namespace","local_id")
);

-- CreateTable
CREATE TABLE "project_in_project" (
    "parent_project_id_namespace" VARCHAR NOT NULL,
    "parent_project_local_id" VARCHAR NOT NULL,
    "child_project_id_namespace" VARCHAR NOT NULL,
    "child_project_local_id" VARCHAR NOT NULL,

    CONSTRAINT "project_in_project_pkey" PRIMARY KEY ("parent_project_id_namespace","parent_project_local_id","child_project_id_namespace","child_project_local_id")
);

-- CreateTable
CREATE TABLE "protein" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',
    "organism" VARCHAR DEFAULT '',

    CONSTRAINT "protein_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protein_gene" (
    "protein" VARCHAR NOT NULL,
    "gene" VARCHAR NOT NULL,

    CONSTRAINT "protein_gene_pkey" PRIMARY KEY ("protein","gene")
);

-- CreateTable
CREATE TABLE "sample_prep_method" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',

    CONSTRAINT "sample_prep_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject" (
    "id_namespace" VARCHAR NOT NULL,
    "local_id" VARCHAR NOT NULL,
    "project_id_namespace" VARCHAR NOT NULL,
    "project_local_id" VARCHAR NOT NULL,
    "persistent_id" VARCHAR DEFAULT '',
    "creation_time" VARCHAR DEFAULT '',
    "granularity" VARCHAR NOT NULL,
    "sex" VARCHAR DEFAULT '',
    "ethnicity" VARCHAR DEFAULT '',
    "age_at_enrollment" VARCHAR DEFAULT '',

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id_namespace","local_id")
);

-- CreateTable
CREATE TABLE "subject_disease" (
    "subject_id_namespace" VARCHAR NOT NULL,
    "subject_local_id" VARCHAR NOT NULL,
    "association_type" VARCHAR NOT NULL,
    "disease" VARCHAR NOT NULL,

    CONSTRAINT "subject_disease_pkey" PRIMARY KEY ("subject_id_namespace","subject_local_id","association_type","disease")
);

-- CreateTable
CREATE TABLE "subject_ethnicity" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,

    CONSTRAINT "subject_ethnicity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_granularity" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,

    CONSTRAINT "subject_granularity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_in_collection" (
    "subject_id_namespace" VARCHAR NOT NULL,
    "subject_local_id" VARCHAR NOT NULL,
    "collection_id_namespace" VARCHAR NOT NULL,
    "collection_local_id" VARCHAR NOT NULL,

    CONSTRAINT "subject_in_collection_pkey" PRIMARY KEY ("subject_id_namespace","subject_local_id","collection_id_namespace","collection_local_id")
);

-- CreateTable
CREATE TABLE "subject_phenotype" (
    "subject_id_namespace" VARCHAR NOT NULL,
    "subject_local_id" VARCHAR NOT NULL,
    "association_type" VARCHAR NOT NULL,
    "phenotype" VARCHAR NOT NULL,

    CONSTRAINT "subject_phenotype_pkey" PRIMARY KEY ("subject_id_namespace","subject_local_id","association_type","phenotype")
);

-- CreateTable
CREATE TABLE "subject_race" (
    "subject_id_namespace" VARCHAR NOT NULL,
    "subject_local_id" VARCHAR NOT NULL,
    "race" VARCHAR NOT NULL DEFAULT '',

    CONSTRAINT "subject_race_pkey" PRIMARY KEY ("subject_id_namespace","subject_local_id","race")
);

-- CreateTable
CREATE TABLE "subject_race_cv" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,

    CONSTRAINT "subject_race_cv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_role" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,

    CONSTRAINT "subject_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_role_taxonomy" (
    "subject_id_namespace" VARCHAR NOT NULL,
    "subject_local_id" VARCHAR NOT NULL,
    "role_id" VARCHAR NOT NULL,
    "taxonomy_id" VARCHAR NOT NULL,

    CONSTRAINT "subject_role_taxonomy_pkey" PRIMARY KEY ("subject_id_namespace","subject_local_id","role_id","taxonomy_id")
);

-- CreateTable
CREATE TABLE "subject_sex" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,

    CONSTRAINT "subject_sex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_substance" (
    "subject_id_namespace" VARCHAR NOT NULL,
    "subject_local_id" VARCHAR NOT NULL,
    "substance" VARCHAR NOT NULL,

    CONSTRAINT "subject_substance_pkey" PRIMARY KEY ("subject_id_namespace","subject_local_id","substance")
);

-- CreateTable
CREATE TABLE "substance" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR DEFAULT '',
    "synonyms" VARCHAR DEFAULT '',
    "compound" VARCHAR NOT NULL,

    CONSTRAINT "substance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GeneEntityToGeneSetLibraryNode" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_GeneEntityToGeneSetNode" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "c2m2_datapackage_dcc_asset_link_key" ON "c2m2_datapackage"("dcc_asset_link");

-- CreateIndex
CREATE UNIQUE INDEX "code_assets_link_key" ON "code_assets"("link");

-- CreateIndex
CREATE UNIQUE INDEX "code_assets_type_link_key" ON "code_assets"("type", "link");

-- CreateIndex
CREATE UNIQUE INDEX "dcc_asset_node_link_key" ON "dcc_asset_node"("link");

-- CreateIndex
CREATE UNIQUE INDEX "dcc_assets_link_key" ON "dcc_assets"("link");

-- CreateIndex
CREATE UNIQUE INDEX "dcc_assets_dcc_id_link_lastmodified_key" ON "dcc_assets"("dcc_id", "link", "lastmodified");

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_link_key" ON "file_assets"("link");

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_filetype_link_key" ON "file_assets"("filetype", "link");

-- CreateIndex
CREATE UNIQUE INDEX "gene_set_library_node_dcc_asset_link_key" ON "gene_set_library_node"("dcc_asset_link");

-- CreateIndex
CREATE INDEX "node_label_trgm" ON "node" USING GIN ("label" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "node_searchable_fts" ON "node" USING GIN ("searchable");

-- CreateIndex
CREATE INDEX "node_type_idx" ON "node"("type");

-- CreateIndex
CREATE INDEX "ffl_biosample_idx_searchable" ON "ffl_biosample" USING GIN ("searchable");

-- CreateIndex
CREATE INDEX "ffl_biosample_idx_dcc_sp_dis_ana" ON "ffl_biosample"("dcc_name", "ncbi_taxonomy_name", "disease_name", "anatomy_name");

-- CreateIndex
CREATE INDEX "ffl_biosample_idx_dcc_proj_sp_dis_ana_gene_data" ON "ffl_biosample"("dcc_name", "project_local_id", "ncbi_taxonomy_name", "disease_name", "anatomy_name", "gene_name", "data_type_name");

-- CreateIndex
CREATE UNIQUE INDEX "_GeneEntityToGeneSetLibraryNode_AB_unique" ON "_GeneEntityToGeneSetLibraryNode"("A", "B");

-- CreateIndex
CREATE INDEX "_GeneEntityToGeneSetLibraryNode_B_index" ON "_GeneEntityToGeneSetLibraryNode"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GeneEntityToGeneSetNode_AB_unique" ON "_GeneEntityToGeneSetNode"("A", "B");

-- CreateIndex
CREATE INDEX "_GeneEntityToGeneSetNode_B_index" ON "_GeneEntityToGeneSetNode"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "c2m2_datapackage" ADD CONSTRAINT "c2m2_datapackage_dcc_asset_link_fkey" FOREIGN KEY ("dcc_asset_link") REFERENCES "dcc_assets"("link") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "c2m2_file_node" ADD CONSTRAINT "c2m2_file_node_c2m2_datapackage_id_fkey" FOREIGN KEY ("c2m2_datapackage_id") REFERENCES "c2m2_datapackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "c2m2_file_node" ADD CONSTRAINT "c2m2_file_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_assets" ADD CONSTRAINT "code_assets_link_fkey" FOREIGN KEY ("link") REFERENCES "dcc_assets"("link") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_asset_node" ADD CONSTRAINT "dcc_asset_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_asset_node" ADD CONSTRAINT "dcc_asset_node_link_fkey" FOREIGN KEY ("link") REFERENCES "dcc_assets"("link") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_assets" ADD CONSTRAINT "dcc_assets_creator_fkey" FOREIGN KEY ("creator") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_assets" ADD CONSTRAINT "dcc_assets_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_outreach" ADD CONSTRAINT "dcc_outreach_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_outreach" ADD CONSTRAINT "dcc_outreach_outreach_id_fkey" FOREIGN KEY ("outreach_id") REFERENCES "outreach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_partnerships" ADD CONSTRAINT "dcc_partnerships_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_partnerships" ADD CONSTRAINT "dcc_partnerships_partnership_id_fkey" FOREIGN KEY ("partnership_id") REFERENCES "partnerships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_publications" ADD CONSTRAINT "dcc_publications_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_publications" ADD CONSTRAINT "dcc_publications_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_usecase" ADD CONSTRAINT "dcc_usecase_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_usecase" ADD CONSTRAINT "dcc_usecase_usecase_id_fkey" FOREIGN KEY ("usecase_id") REFERENCES "usecase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_node" ADD CONSTRAINT "entity_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_link_fkey" FOREIGN KEY ("link") REFERENCES "dcc_assets"("link") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gene_entity" ADD CONSTRAINT "gene_entity_id_fkey" FOREIGN KEY ("id") REFERENCES "entity_node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gene_set_library_node" ADD CONSTRAINT "gene_set_library_node_dcc_asset_link_fkey" FOREIGN KEY ("dcc_asset_link") REFERENCES "dcc_assets"("link") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gene_set_library_node" ADD CONSTRAINT "gene_set_library_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gene_set_node" ADD CONSTRAINT "gene_set_node_gene_set_library_id_fkey" FOREIGN KEY ("gene_set_library_id") REFERENCES "gene_set_library_node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gene_set_node" ADD CONSTRAINT "gene_set_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kg_assertion" ADD CONSTRAINT "kg_assertion_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kg_assertion" ADD CONSTRAINT "kg_assertion_relation_id_fkey" FOREIGN KEY ("relation_id") REFERENCES "kg_relation_node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kg_assertion" ADD CONSTRAINT "kg_assertion_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "entity_node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kg_assertion" ADD CONSTRAINT "kg_assertion_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "entity_node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kg_relation_node" ADD CONSTRAINT "kg_relation_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node" ADD CONSTRAINT "node_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnership_publications" ADD CONSTRAINT "partnership_publications_partnership_id_fkey" FOREIGN KEY ("partnership_id") REFERENCES "partnerships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnership_publications" ADD CONSTRAINT "partnership_publications_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usecase" ADD CONSTRAINT "usecase_creator_dcc_id_fkey" FOREIGN KEY ("creator_dcc_id") REFERENCES "dccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biosample" ADD CONSTRAINT "fk_biosample_anatomy_4" FOREIGN KEY ("anatomy") REFERENCES "anatomy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample" ADD CONSTRAINT "fk_biosample_id_namespace_1" FOREIGN KEY ("id_namespace") REFERENCES "id_namespace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample" ADD CONSTRAINT "fk_biosample_project_2" FOREIGN KEY ("project_id_namespace", "project_local_id") REFERENCES "project"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample" ADD CONSTRAINT "fk_biosample_sample_prep_method_3" FOREIGN KEY ("sample_prep_method") REFERENCES "sample_prep_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample_disease" ADD CONSTRAINT "fk_biosample_disease_biosample_1" FOREIGN KEY ("biosample_id_namespace", "biosample_local_id") REFERENCES "biosample"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample_disease" ADD CONSTRAINT "fk_biosample_disease_disease_2" FOREIGN KEY ("disease") REFERENCES "disease"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample_from_subject" ADD CONSTRAINT "fk_biosample_from_subject_biosample_1" FOREIGN KEY ("biosample_id_namespace", "biosample_local_id") REFERENCES "biosample"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample_from_subject" ADD CONSTRAINT "fk_biosample_from_subject_subject_2" FOREIGN KEY ("subject_id_namespace", "subject_local_id") REFERENCES "subject"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample_gene" ADD CONSTRAINT "fk_biosample_gene_biosample_1" FOREIGN KEY ("biosample_id_namespace", "biosample_local_id") REFERENCES "biosample"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample_gene" ADD CONSTRAINT "fk_biosample_gene_gene_2" FOREIGN KEY ("gene") REFERENCES "gene"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample_in_collection" ADD CONSTRAINT "fk_biosample_in_collection_biosample_1" FOREIGN KEY ("biosample_id_namespace", "biosample_local_id") REFERENCES "biosample"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample_in_collection" ADD CONSTRAINT "fk_biosample_in_collection_collection_2" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample_substance" ADD CONSTRAINT "fk_biosample_substance_biosample_1" FOREIGN KEY ("biosample_id_namespace", "biosample_local_id") REFERENCES "biosample"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "biosample_substance" ADD CONSTRAINT "fk_biosample_substance_substance_2" FOREIGN KEY ("substance") REFERENCES "substance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection" ADD CONSTRAINT "fk_collection_id_namespace_1" FOREIGN KEY ("id_namespace") REFERENCES "id_namespace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_anatomy" ADD CONSTRAINT "fk_collection_anatomy_anatomy_2" FOREIGN KEY ("anatomy") REFERENCES "anatomy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_anatomy" ADD CONSTRAINT "fk_collection_anatomy_collection_1" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_compound" ADD CONSTRAINT "fk_collection_compound_collection_1" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_compound" ADD CONSTRAINT "fk_collection_compound_compound_2" FOREIGN KEY ("compound") REFERENCES "compound"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_defined_by_project" ADD CONSTRAINT "fk_collection_defined_by_project_collection_1" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_defined_by_project" ADD CONSTRAINT "fk_collection_defined_by_project_project_2" FOREIGN KEY ("project_id_namespace", "project_local_id") REFERENCES "project"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_disease" ADD CONSTRAINT "fk_collection_disease_collection_1" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_disease" ADD CONSTRAINT "fk_collection_disease_disease_2" FOREIGN KEY ("disease") REFERENCES "disease"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_gene" ADD CONSTRAINT "fk_collection_gene_collection_1" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_gene" ADD CONSTRAINT "fk_collection_gene_gene_2" FOREIGN KEY ("gene") REFERENCES "gene"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_in_collection" ADD CONSTRAINT "fk_collection_in_collection_collection_1" FOREIGN KEY ("superset_collection_id_namespace", "superset_collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_in_collection" ADD CONSTRAINT "fk_collection_in_collection_collection_2" FOREIGN KEY ("subset_collection_id_namespace", "subset_collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_phenotype" ADD CONSTRAINT "fk_collection_phenotype_collection_1" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_phenotype" ADD CONSTRAINT "fk_collection_phenotype_phenotype_2" FOREIGN KEY ("phenotype") REFERENCES "phenotype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_protein" ADD CONSTRAINT "fk_collection_protein_collection_1" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_protein" ADD CONSTRAINT "fk_collection_protein_protein_2" FOREIGN KEY ("protein") REFERENCES "protein"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_substance" ADD CONSTRAINT "fk_collection_substance_collection_1" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_substance" ADD CONSTRAINT "fk_collection_substance_substance_2" FOREIGN KEY ("substance") REFERENCES "substance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_taxonomy" ADD CONSTRAINT "fk_collection_taxonomy_collection_1" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_taxonomy" ADD CONSTRAINT "fk_collection_taxonomy_ncbi_taxonomy_2" FOREIGN KEY ("taxon") REFERENCES "ncbi_taxonomy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dcc" ADD CONSTRAINT "fk_dcc_project_1" FOREIGN KEY ("project_id_namespace", "project_local_id") REFERENCES "project"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "fk_file_analysis_type_7" FOREIGN KEY ("analysis_type") REFERENCES "analysis_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "fk_file_assay_type_6" FOREIGN KEY ("assay_type") REFERENCES "assay_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "fk_file_collection_8" FOREIGN KEY ("bundle_collection_id_namespace", "bundle_collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "fk_file_data_type_5" FOREIGN KEY ("data_type") REFERENCES "data_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "fk_file_file_format_3" FOREIGN KEY ("file_format") REFERENCES "file_format"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "fk_file_file_format_4" FOREIGN KEY ("compression_format") REFERENCES "file_format"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "fk_file_id_namespace_1" FOREIGN KEY ("id_namespace") REFERENCES "id_namespace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "fk_file_project_2" FOREIGN KEY ("project_id_namespace", "project_local_id") REFERENCES "project"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file_describes_biosample" ADD CONSTRAINT "fk_file_describes_biosample_biosample_2" FOREIGN KEY ("biosample_id_namespace", "biosample_local_id") REFERENCES "biosample"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file_describes_biosample" ADD CONSTRAINT "fk_file_describes_biosample_file_1" FOREIGN KEY ("file_id_namespace", "file_local_id") REFERENCES "file"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file_describes_collection" ADD CONSTRAINT "fk_file_describes_collection_collection_2" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file_describes_collection" ADD CONSTRAINT "fk_file_describes_collection_file_1" FOREIGN KEY ("file_id_namespace", "file_local_id") REFERENCES "file"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file_describes_subject" ADD CONSTRAINT "fk_file_describes_subject_file_1" FOREIGN KEY ("file_id_namespace", "file_local_id") REFERENCES "file"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file_describes_subject" ADD CONSTRAINT "fk_file_describes_subject_subject_2" FOREIGN KEY ("subject_id_namespace", "subject_local_id") REFERENCES "subject"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file_in_collection" ADD CONSTRAINT "fk_file_in_collection_collection_2" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file_in_collection" ADD CONSTRAINT "fk_file_in_collection_file_1" FOREIGN KEY ("file_id_namespace", "file_local_id") REFERENCES "file"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gene" ADD CONSTRAINT "fk_gene_ncbi_taxonomy_1" FOREIGN KEY ("organism") REFERENCES "ncbi_taxonomy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "phenotype_disease" ADD CONSTRAINT "fk_phenotype_disease_disease_2" FOREIGN KEY ("disease") REFERENCES "disease"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "phenotype_disease" ADD CONSTRAINT "fk_phenotype_disease_phenotype_1" FOREIGN KEY ("phenotype") REFERENCES "phenotype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "phenotype_gene" ADD CONSTRAINT "fk_phenotype_gene_gene_2" FOREIGN KEY ("gene") REFERENCES "gene"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "phenotype_gene" ADD CONSTRAINT "fk_phenotype_gene_phenotype_1" FOREIGN KEY ("phenotype") REFERENCES "phenotype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "fk_project_id_namespace_1" FOREIGN KEY ("id_namespace") REFERENCES "id_namespace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_in_project" ADD CONSTRAINT "fk_project_in_project_project_1" FOREIGN KEY ("parent_project_id_namespace", "parent_project_local_id") REFERENCES "project"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_in_project" ADD CONSTRAINT "fk_project_in_project_project_2" FOREIGN KEY ("child_project_id_namespace", "child_project_local_id") REFERENCES "project"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "protein" ADD CONSTRAINT "fk_protein_ncbi_taxonomy_1" FOREIGN KEY ("organism") REFERENCES "ncbi_taxonomy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "protein_gene" ADD CONSTRAINT "fk_protein_gene_gene_2" FOREIGN KEY ("gene") REFERENCES "gene"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "protein_gene" ADD CONSTRAINT "fk_protein_gene_protein_1" FOREIGN KEY ("protein") REFERENCES "protein"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "fk_subject_id_namespace_1" FOREIGN KEY ("id_namespace") REFERENCES "id_namespace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "fk_subject_project_2" FOREIGN KEY ("project_id_namespace", "project_local_id") REFERENCES "project"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject_disease" ADD CONSTRAINT "fk_subject_disease_disease_2" FOREIGN KEY ("disease") REFERENCES "disease"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject_disease" ADD CONSTRAINT "fk_subject_disease_subject_1" FOREIGN KEY ("subject_id_namespace", "subject_local_id") REFERENCES "subject"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject_in_collection" ADD CONSTRAINT "fk_subject_in_collection_collection_2" FOREIGN KEY ("collection_id_namespace", "collection_local_id") REFERENCES "collection"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject_in_collection" ADD CONSTRAINT "fk_subject_in_collection_subject_1" FOREIGN KEY ("subject_id_namespace", "subject_local_id") REFERENCES "subject"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject_phenotype" ADD CONSTRAINT "fk_subject_phenotype_phenotype_2" FOREIGN KEY ("phenotype") REFERENCES "phenotype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject_phenotype" ADD CONSTRAINT "fk_subject_phenotype_subject_1" FOREIGN KEY ("subject_id_namespace", "subject_local_id") REFERENCES "subject"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject_race" ADD CONSTRAINT "fk_subject_race_subject_1" FOREIGN KEY ("subject_id_namespace", "subject_local_id") REFERENCES "subject"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject_role_taxonomy" ADD CONSTRAINT "fk_subject_role_taxonomy_ncbi_taxonomy_2" FOREIGN KEY ("taxonomy_id") REFERENCES "ncbi_taxonomy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject_role_taxonomy" ADD CONSTRAINT "fk_subject_role_taxonomy_subject_1" FOREIGN KEY ("subject_id_namespace", "subject_local_id") REFERENCES "subject"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject_substance" ADD CONSTRAINT "fk_subject_substance_subject_1" FOREIGN KEY ("subject_id_namespace", "subject_local_id") REFERENCES "subject"("id_namespace", "local_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject_substance" ADD CONSTRAINT "fk_subject_substance_substance_2" FOREIGN KEY ("substance") REFERENCES "substance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "substance" ADD CONSTRAINT "fk_substance_compound_1" FOREIGN KEY ("compound") REFERENCES "compound"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_GeneEntityToGeneSetLibraryNode" ADD CONSTRAINT "_GeneEntityToGeneSetLibraryNode_A_fkey" FOREIGN KEY ("A") REFERENCES "gene_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneEntityToGeneSetLibraryNode" ADD CONSTRAINT "_GeneEntityToGeneSetLibraryNode_B_fkey" FOREIGN KEY ("B") REFERENCES "gene_set_library_node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneEntityToGeneSetNode" ADD CONSTRAINT "_GeneEntityToGeneSetNode_A_fkey" FOREIGN KEY ("A") REFERENCES "gene_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneEntityToGeneSetNode" ADD CONSTRAINT "_GeneEntityToGeneSetNode_B_fkey" FOREIGN KEY ("B") REFERENCES "gene_set_node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
