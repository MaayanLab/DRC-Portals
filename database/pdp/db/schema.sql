SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgraphile_watch; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA postgraphile_watch;


--
-- Name: notify_watchers_ddl(); Type: FUNCTION; Schema: postgraphile_watch; Owner: -
--

CREATE FUNCTION postgraphile_watch.notify_watchers_ddl() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform pg_notify(
    'postgraphile_watch',
    json_build_object(
      'type',
      'ddl',
      'payload',
      (select json_agg(json_build_object('schema', schema_name, 'command', command_tag)) from pg_event_trigger_ddl_commands() as x)
    )::text
  );
end;
$$;


--
-- Name: notify_watchers_drop(); Type: FUNCTION; Schema: postgraphile_watch; Owner: -
--

CREATE FUNCTION postgraphile_watch.notify_watchers_drop() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform pg_notify(
    'postgraphile_watch',
    json_build_object(
      'type',
      'drop',
      'payload',
      (select json_agg(distinct x.schema_name) from pg_event_trigger_dropped_objects() as x)
    )::text
  );
end;
$$;


SET default_tablespace = '';

--
-- Name: node; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
)
PARTITION BY LIST (type);


SET default_table_access_method = heap;

--
-- Name: node__4DN Dataset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__4DN Dataset" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__4DN File; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__4DN File" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__4DN Loop; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__4DN Loop" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__4DN QVal Bin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__4DN QVal Bin" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Amino Acid; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Amino Acid" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Anatomy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Anatomy" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Assay; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Assay" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Compound; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Compound" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Disease or Phenotype; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Disease or Phenotype" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__GO; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__GO" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__GP ID2PRO; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__GP ID2PRO" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__GlyGen Glycosequence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__GlyGen Glycosequence" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__GlyGen Location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__GlyGen Location" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__GlyGen Residue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__GlyGen Residue" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__GlyGen src; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__GlyGen src" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Glycan Motif; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Glycan Motif" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Glycoprotein; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Glycoprotein" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Glycoprotein Citation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Glycoprotein Citation" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Glycoprotein Evidence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Glycoprotein Evidence" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Glycosylation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Glycosylation" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Glycosylation Site; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Glycosylation Site" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Glycosyltransferase Reaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Glycosyltransferase Reaction" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Glytoucan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Glytoucan" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__HSCLO; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__HSCLO" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__ILX; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__ILX" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Isoform; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Isoform" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__KFCOHORT; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__KFCOHORT" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__KFGENEBIN; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__KFGENEBIN" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__KFPT; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__KFPT" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__MOTRPAC; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__MOTRPAC" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Metabolite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Metabolite" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__NIFSTD; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__NIFSTD" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__PATO; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__PATO" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Protein; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Protein" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__SO; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__SO" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Sex; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Sex" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__Taxon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."node__Taxon" (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_analysis_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_analysis_type (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_anatomy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_anatomy (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_assay_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_assay_type (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_biosample; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_biosample (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_biosample_disease; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_biosample_disease (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_biosample_from_subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_biosample_from_subject (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_biosample_gene; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_biosample_gene (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_biosample_in_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_biosample_in_collection (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_biosample_substance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_biosample_substance (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_collection (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_collection_anatomy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_collection_anatomy (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_collection_defined_by_project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_collection_defined_by_project (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_collection_taxonomy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_collection_taxonomy (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_compound; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_compound (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_data_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_data_type (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_dcc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_dcc (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_disease; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_disease (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_file (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_file_describes_biosample; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_file_describes_biosample (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_file_describes_subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_file_describes_subject (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_file_format; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_file_format (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_file_in_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_file_in_collection (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_gene; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_gene (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_id_namespace; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_id_namespace (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_ncbi_taxonomy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_ncbi_taxonomy (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_project (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_project_in_project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_project_in_project (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_sample_prep_method; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_sample_prep_method (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_subject (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_subject_disease; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_subject_disease (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_subject_in_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_subject_in_collection (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_subject_role_taxonomy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_subject_role_taxonomy (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__c2m2_substance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__c2m2_substance (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__dcc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__dcc (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__dcc_asset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__dcc_asset (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__gene; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__gene (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__gene_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__gene_set (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__gene_set_library; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__gene_set_library (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__kg_assertion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__kg_assertion (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__kg_assertion_relation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__kg_assertion_relation (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__kg_assertion_source; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__kg_assertion_source (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__kg_assertion_target; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__kg_assertion_target (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: node__kg_relation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node__kg_relation (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0,
    searchable tsvector GENERATED ALWAYS AS (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb)) STORED
);


--
-- Name: relation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
)
PARTITION BY LIST (predicate);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__anatomy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample__c2m2__anatomy (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__id_namespace; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample__c2m2__id_namespace (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample__c2m2__project (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__sample_prep_method; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample__c2m2__sample_prep_method (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__biosample; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample_disease__c2m2__biosample (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__disease; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample_disease__c2m2__disease (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m2__biosample; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample_from_subject__c2m2__biosample (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m2__subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample_from_subject__c2m2__subject (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__biosample; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample_gene__c2m2__biosample (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__gene; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample_gene__c2m2__gene (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2m2__biosample; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample_in_collection__c2m2__biosample (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2m2__collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample_in_collection__c2m2__collection (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__biosample; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample_substance__c2m2__biosample (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__substance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_biosample_substance__c2m2__substance (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_collection__c2m2__id_namespace; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_collection__c2m2__id_namespace (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__anatomy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_collection_anatomy__c2m2__anatomy (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_collection_anatomy__c2m2__collection (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_collection_defined_by_project__c2m2__colle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_collection_defined_by_project__c2m2__colle (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_collection_defined_by_project__c2m2__proje; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_collection_defined_by_project__c2m2__proje (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_collection_taxonomy__c2m2__collection (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxonomy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxonomy (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_dcc__c2m2__project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_dcc__c2m2__project (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file__c2m2__analysis_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file__c2m2__analysis_type (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file__c2m2__assay_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file__c2m2__assay_type (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file__c2m2__data_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file__c2m2__data_type (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file__c2m2__file_format; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file__c2m2__file_format (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file__c2m2__id_namespace; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file__c2m2__id_namespace (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file__c2m2__project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file__c2m2__project (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c2m2__biosample; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file_describes_biosample__c2m2__biosample (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c2m2__file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file_describes_biosample__c2m2__file (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m2__file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file_describes_subject__c2m2__file (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m2__subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file_describes_subject__c2m2__subject (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file_in_collection__c2m2__collection (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_file_in_collection__c2m2__file (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_project__c2m2__id_namespace; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_project__c2m2__id_namespace (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_project_in_project__c2m2__project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_project_in_project__c2m2__project (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_subject__c2m2__id_namespace; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_subject__c2m2__id_namespace (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_subject__c2m2__project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_subject__c2m2__project (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__disease; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_subject_disease__c2m2__disease (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_subject_disease__c2m2__subject (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2__collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_subject_in_collection__c2m2__collection (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2__subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_subject_in_collection__c2m2__subject (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_taxonomy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_taxonomy (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2__subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2__subject (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__c2m2__c2m2_substance__c2m2__compound; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__c2m2__c2m2_substance__c2m2__compound (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__dcc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__dcc (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__is_from_dcc_asset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__is_from_dcc_asset (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__is_in_gene_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__is_in_gene_set (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__is_in_gene_set_library; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__is_in_gene_set_library (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__kg_assertion_relation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__kg_assertion_relation (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__kg_assertion_source; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__kg_assertion_source (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: relation__kg_assertion_target; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relation__kg_assertion_target (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: node__4DN Dataset; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__4DN Dataset" FOR VALUES IN ('4DN Dataset');


--
-- Name: node__4DN File; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__4DN File" FOR VALUES IN ('4DN File');


--
-- Name: node__4DN Loop; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__4DN Loop" FOR VALUES IN ('4DN Loop');


--
-- Name: node__4DN QVal Bin; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__4DN QVal Bin" FOR VALUES IN ('4DN QVal Bin');


--
-- Name: node__Amino Acid; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Amino Acid" FOR VALUES IN ('Amino Acid');


--
-- Name: node__Anatomy; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Anatomy" FOR VALUES IN ('Anatomy');


--
-- Name: node__Assay; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Assay" FOR VALUES IN ('Assay');


--
-- Name: node__Compound; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Compound" FOR VALUES IN ('Compound');


--
-- Name: node__Disease or Phenotype; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Disease or Phenotype" FOR VALUES IN ('Disease or Phenotype');


--
-- Name: node__GO; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__GO" FOR VALUES IN ('GO');


--
-- Name: node__GP ID2PRO; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__GP ID2PRO" FOR VALUES IN ('GP ID2PRO');


--
-- Name: node__GlyGen Glycosequence; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__GlyGen Glycosequence" FOR VALUES IN ('GlyGen Glycosequence');


--
-- Name: node__GlyGen Location; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__GlyGen Location" FOR VALUES IN ('GlyGen Location');


--
-- Name: node__GlyGen Residue; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__GlyGen Residue" FOR VALUES IN ('GlyGen Residue');


--
-- Name: node__GlyGen src; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__GlyGen src" FOR VALUES IN ('GlyGen src');


--
-- Name: node__Glycan Motif; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Glycan Motif" FOR VALUES IN ('Glycan Motif');


--
-- Name: node__Glycoprotein; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Glycoprotein" FOR VALUES IN ('Glycoprotein');


--
-- Name: node__Glycoprotein Citation; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Glycoprotein Citation" FOR VALUES IN ('Glycoprotein Citation');


--
-- Name: node__Glycoprotein Evidence; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Glycoprotein Evidence" FOR VALUES IN ('Glycoprotein Evidence');


--
-- Name: node__Glycosylation; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Glycosylation" FOR VALUES IN ('Glycosylation');


--
-- Name: node__Glycosylation Site; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Glycosylation Site" FOR VALUES IN ('Glycosylation Site');


--
-- Name: node__Glycosyltransferase Reaction; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Glycosyltransferase Reaction" FOR VALUES IN ('Glycosyltransferase Reaction');


--
-- Name: node__Glytoucan; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Glytoucan" FOR VALUES IN ('Glytoucan');


--
-- Name: node__HSCLO; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__HSCLO" FOR VALUES IN ('HSCLO');


--
-- Name: node__ILX; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__ILX" FOR VALUES IN ('ILX');


--
-- Name: node__Isoform; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Isoform" FOR VALUES IN ('Isoform');


--
-- Name: node__KFCOHORT; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__KFCOHORT" FOR VALUES IN ('KFCOHORT');


--
-- Name: node__KFGENEBIN; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__KFGENEBIN" FOR VALUES IN ('KFGENEBIN');


--
-- Name: node__KFPT; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__KFPT" FOR VALUES IN ('KFPT');


--
-- Name: node__MOTRPAC; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__MOTRPAC" FOR VALUES IN ('MOTRPAC');


--
-- Name: node__Metabolite; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Metabolite" FOR VALUES IN ('Metabolite');


--
-- Name: node__NIFSTD; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__NIFSTD" FOR VALUES IN ('NIFSTD');


--
-- Name: node__PATO; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__PATO" FOR VALUES IN ('PATO');


--
-- Name: node__Protein; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Protein" FOR VALUES IN ('Protein');


--
-- Name: node__SO; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__SO" FOR VALUES IN ('SO');


--
-- Name: node__Sex; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Sex" FOR VALUES IN ('Sex');


--
-- Name: node__Taxon; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public."node__Taxon" FOR VALUES IN ('Taxon');


--
-- Name: node__c2m2_analysis_type; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_analysis_type FOR VALUES IN ('c2m2_analysis_type');


--
-- Name: node__c2m2_anatomy; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_anatomy FOR VALUES IN ('c2m2_anatomy');


--
-- Name: node__c2m2_assay_type; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_assay_type FOR VALUES IN ('c2m2_assay_type');


--
-- Name: node__c2m2_biosample; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_biosample FOR VALUES IN ('c2m2_biosample');


--
-- Name: node__c2m2_biosample_disease; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_biosample_disease FOR VALUES IN ('c2m2_biosample_disease');


--
-- Name: node__c2m2_biosample_from_subject; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_biosample_from_subject FOR VALUES IN ('c2m2_biosample_from_subject');


--
-- Name: node__c2m2_biosample_gene; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_biosample_gene FOR VALUES IN ('c2m2_biosample_gene');


--
-- Name: node__c2m2_biosample_in_collection; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_biosample_in_collection FOR VALUES IN ('c2m2_biosample_in_collection');


--
-- Name: node__c2m2_biosample_substance; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_biosample_substance FOR VALUES IN ('c2m2_biosample_substance');


--
-- Name: node__c2m2_collection; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_collection FOR VALUES IN ('c2m2_collection');


--
-- Name: node__c2m2_collection_anatomy; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_collection_anatomy FOR VALUES IN ('c2m2_collection_anatomy');


--
-- Name: node__c2m2_collection_defined_by_project; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_collection_defined_by_project FOR VALUES IN ('c2m2_collection_defined_by_project');


--
-- Name: node__c2m2_collection_taxonomy; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_collection_taxonomy FOR VALUES IN ('c2m2_collection_taxonomy');


--
-- Name: node__c2m2_compound; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_compound FOR VALUES IN ('c2m2_compound');


--
-- Name: node__c2m2_data_type; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_data_type FOR VALUES IN ('c2m2_data_type');


--
-- Name: node__c2m2_dcc; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_dcc FOR VALUES IN ('c2m2_dcc');


--
-- Name: node__c2m2_disease; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_disease FOR VALUES IN ('c2m2_disease');


--
-- Name: node__c2m2_file; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_file FOR VALUES IN ('c2m2_file');


--
-- Name: node__c2m2_file_describes_biosample; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_file_describes_biosample FOR VALUES IN ('c2m2_file_describes_biosample');


--
-- Name: node__c2m2_file_describes_subject; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_file_describes_subject FOR VALUES IN ('c2m2_file_describes_subject');


--
-- Name: node__c2m2_file_format; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_file_format FOR VALUES IN ('c2m2_file_format');


--
-- Name: node__c2m2_file_in_collection; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_file_in_collection FOR VALUES IN ('c2m2_file_in_collection');


--
-- Name: node__c2m2_gene; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_gene FOR VALUES IN ('c2m2_gene');


--
-- Name: node__c2m2_id_namespace; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_id_namespace FOR VALUES IN ('c2m2_id_namespace');


--
-- Name: node__c2m2_ncbi_taxonomy; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_ncbi_taxonomy FOR VALUES IN ('c2m2_ncbi_taxonomy');


--
-- Name: node__c2m2_project; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_project FOR VALUES IN ('c2m2_project');


--
-- Name: node__c2m2_project_in_project; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_project_in_project FOR VALUES IN ('c2m2_project_in_project');


--
-- Name: node__c2m2_sample_prep_method; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_sample_prep_method FOR VALUES IN ('c2m2_sample_prep_method');


--
-- Name: node__c2m2_subject; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_subject FOR VALUES IN ('c2m2_subject');


--
-- Name: node__c2m2_subject_disease; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_subject_disease FOR VALUES IN ('c2m2_subject_disease');


--
-- Name: node__c2m2_subject_in_collection; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_subject_in_collection FOR VALUES IN ('c2m2_subject_in_collection');


--
-- Name: node__c2m2_subject_role_taxonomy; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_subject_role_taxonomy FOR VALUES IN ('c2m2_subject_role_taxonomy');


--
-- Name: node__c2m2_substance; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__c2m2_substance FOR VALUES IN ('c2m2_substance');


--
-- Name: node__dcc; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__dcc FOR VALUES IN ('dcc');


--
-- Name: node__dcc_asset; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__dcc_asset FOR VALUES IN ('dcc_asset');


--
-- Name: node__gene; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__gene FOR VALUES IN ('gene');


--
-- Name: node__gene_set; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__gene_set FOR VALUES IN ('gene_set');


--
-- Name: node__gene_set_library; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__gene_set_library FOR VALUES IN ('gene_set_library');


--
-- Name: node__kg_assertion; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__kg_assertion FOR VALUES IN ('kg_assertion');


--
-- Name: node__kg_assertion_relation; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__kg_assertion_relation FOR VALUES IN ('kg_assertion_relation');


--
-- Name: node__kg_assertion_source; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__kg_assertion_source FOR VALUES IN ('kg_assertion_source');


--
-- Name: node__kg_assertion_target; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__kg_assertion_target FOR VALUES IN ('kg_assertion_target');


--
-- Name: node__kg_relation; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node ATTACH PARTITION public.node__kg_relation FOR VALUES IN ('kg_relation');


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__anatomy; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__anatomy FOR VALUES IN ('c2m2__c2m2_biosample__c2m2__anatomy');


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__id_namespace; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__id_namespace FOR VALUES IN ('c2m2__c2m2_biosample__c2m2__id_namespace');


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__project; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__project FOR VALUES IN ('c2m2__c2m2_biosample__c2m2__project');


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__sample_prep_method; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__sample_prep_method FOR VALUES IN ('c2m2__c2m2_biosample__c2m2__sample_prep_method');


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__biosample; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample_disease__c2m2__biosample FOR VALUES IN ('c2m2__c2m2_biosample_disease__c2m2__biosample');


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__disease; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample_disease__c2m2__disease FOR VALUES IN ('c2m2__c2m2_biosample_disease__c2m2__disease');


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m2__biosample; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample_from_subject__c2m2__biosample FOR VALUES IN ('c2m2__c2m2_biosample_from_subject__c2m2__biosample');


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m2__subject; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample_from_subject__c2m2__subject FOR VALUES IN ('c2m2__c2m2_biosample_from_subject__c2m2__subject');


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__biosample; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample_gene__c2m2__biosample FOR VALUES IN ('c2m2__c2m2_biosample_gene__c2m2__biosample');


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__gene; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample_gene__c2m2__gene FOR VALUES IN ('c2m2__c2m2_biosample_gene__c2m2__gene');


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2m2__biosample; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample_in_collection__c2m2__biosample FOR VALUES IN ('c2m2__c2m2_biosample_in_collection__c2m2__biosample');


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2m2__collection; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample_in_collection__c2m2__collection FOR VALUES IN ('c2m2__c2m2_biosample_in_collection__c2m2__collection');


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__biosample; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample_substance__c2m2__biosample FOR VALUES IN ('c2m2__c2m2_biosample_substance__c2m2__biosample');


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__substance; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_biosample_substance__c2m2__substance FOR VALUES IN ('c2m2__c2m2_biosample_substance__c2m2__substance');


--
-- Name: relation__c2m2__c2m2_collection__c2m2__id_namespace; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_collection__c2m2__id_namespace FOR VALUES IN ('c2m2__c2m2_collection__c2m2__id_namespace');


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__anatomy; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_collection_anatomy__c2m2__anatomy FOR VALUES IN ('c2m2__c2m2_collection_anatomy__c2m2__anatomy');


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__collection; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_collection_anatomy__c2m2__collection FOR VALUES IN ('c2m2__c2m2_collection_anatomy__c2m2__collection');


--
-- Name: relation__c2m2__c2m2_collection_defined_by_project__c2m2__colle; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_collection_defined_by_project__c2m2__colle FOR VALUES IN ('c2m2__c2m2_collection_defined_by_project__c2m2__collection');


--
-- Name: relation__c2m2__c2m2_collection_defined_by_project__c2m2__proje; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_collection_defined_by_project__c2m2__proje FOR VALUES IN ('c2m2__c2m2_collection_defined_by_project__c2m2__project');


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__collection; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_collection_taxonomy__c2m2__collection FOR VALUES IN ('c2m2__c2m2_collection_taxonomy__c2m2__collection');


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxonomy; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxonomy FOR VALUES IN ('c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxonomy');


--
-- Name: relation__c2m2__c2m2_dcc__c2m2__project; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_dcc__c2m2__project FOR VALUES IN ('c2m2__c2m2_dcc__c2m2__project');


--
-- Name: relation__c2m2__c2m2_file__c2m2__analysis_type; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__analysis_type FOR VALUES IN ('c2m2__c2m2_file__c2m2__analysis_type');


--
-- Name: relation__c2m2__c2m2_file__c2m2__assay_type; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__assay_type FOR VALUES IN ('c2m2__c2m2_file__c2m2__assay_type');


--
-- Name: relation__c2m2__c2m2_file__c2m2__data_type; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__data_type FOR VALUES IN ('c2m2__c2m2_file__c2m2__data_type');


--
-- Name: relation__c2m2__c2m2_file__c2m2__file_format; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__file_format FOR VALUES IN ('c2m2__c2m2_file__c2m2__file_format');


--
-- Name: relation__c2m2__c2m2_file__c2m2__id_namespace; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__id_namespace FOR VALUES IN ('c2m2__c2m2_file__c2m2__id_namespace');


--
-- Name: relation__c2m2__c2m2_file__c2m2__project; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__project FOR VALUES IN ('c2m2__c2m2_file__c2m2__project');


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c2m2__biosample; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_biosample__c2m2__biosample FOR VALUES IN ('c2m2__c2m2_file_describes_biosample__c2m2__biosample');


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c2m2__file; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_biosample__c2m2__file FOR VALUES IN ('c2m2__c2m2_file_describes_biosample__c2m2__file');


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m2__file; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_subject__c2m2__file FOR VALUES IN ('c2m2__c2m2_file_describes_subject__c2m2__file');


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m2__subject; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_subject__c2m2__subject FOR VALUES IN ('c2m2__c2m2_file_describes_subject__c2m2__subject');


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__collection; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file_in_collection__c2m2__collection FOR VALUES IN ('c2m2__c2m2_file_in_collection__c2m2__collection');


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__file; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_file_in_collection__c2m2__file FOR VALUES IN ('c2m2__c2m2_file_in_collection__c2m2__file');


--
-- Name: relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy FOR VALUES IN ('c2m2__c2m2_gene__c2m2__ncbi_taxonomy');


--
-- Name: relation__c2m2__c2m2_project__c2m2__id_namespace; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_project__c2m2__id_namespace FOR VALUES IN ('c2m2__c2m2_project__c2m2__id_namespace');


--
-- Name: relation__c2m2__c2m2_project_in_project__c2m2__project; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_project_in_project__c2m2__project FOR VALUES IN ('c2m2__c2m2_project_in_project__c2m2__project');


--
-- Name: relation__c2m2__c2m2_subject__c2m2__id_namespace; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_subject__c2m2__id_namespace FOR VALUES IN ('c2m2__c2m2_subject__c2m2__id_namespace');


--
-- Name: relation__c2m2__c2m2_subject__c2m2__project; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_subject__c2m2__project FOR VALUES IN ('c2m2__c2m2_subject__c2m2__project');


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__disease; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_subject_disease__c2m2__disease FOR VALUES IN ('c2m2__c2m2_subject_disease__c2m2__disease');


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__subject; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_subject_disease__c2m2__subject FOR VALUES IN ('c2m2__c2m2_subject_disease__c2m2__subject');


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2__collection; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_subject_in_collection__c2m2__collection FOR VALUES IN ('c2m2__c2m2_subject_in_collection__c2m2__collection');


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2__subject; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_subject_in_collection__c2m2__subject FOR VALUES IN ('c2m2__c2m2_subject_in_collection__c2m2__subject');


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_taxonomy; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_taxonomy FOR VALUES IN ('c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_taxonomy');


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2__subject; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2__subject FOR VALUES IN ('c2m2__c2m2_subject_role_taxonomy__c2m2__subject');


--
-- Name: relation__c2m2__c2m2_substance__c2m2__compound; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__c2m2__c2m2_substance__c2m2__compound FOR VALUES IN ('c2m2__c2m2_substance__c2m2__compound');


--
-- Name: relation__dcc; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__dcc FOR VALUES IN ('dcc');


--
-- Name: relation__is_from_dcc_asset; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__is_from_dcc_asset FOR VALUES IN ('is_from_dcc_asset');


--
-- Name: relation__is_in_gene_set; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__is_in_gene_set FOR VALUES IN ('is_in_gene_set');


--
-- Name: relation__is_in_gene_set_library; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__is_in_gene_set_library FOR VALUES IN ('is_in_gene_set_library');


--
-- Name: relation__kg_assertion_relation; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__kg_assertion_relation FOR VALUES IN ('kg_assertion_relation');


--
-- Name: relation__kg_assertion_source; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__kg_assertion_source FOR VALUES IN ('kg_assertion_source');


--
-- Name: relation__kg_assertion_target; Type: TABLE ATTACH; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation ATTACH PARTITION public.relation__kg_assertion_target FOR VALUES IN ('kg_assertion_target');


--
-- Name: node node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_pkey PRIMARY KEY (type, id);


--
-- Name: node__4DN Dataset node__4DN Dataset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__4DN Dataset"
    ADD CONSTRAINT "node__4DN Dataset_pkey" PRIMARY KEY (type, id);


--
-- Name: node__4DN File node__4DN File_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__4DN File"
    ADD CONSTRAINT "node__4DN File_pkey" PRIMARY KEY (type, id);


--
-- Name: node__4DN Loop node__4DN Loop_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__4DN Loop"
    ADD CONSTRAINT "node__4DN Loop_pkey" PRIMARY KEY (type, id);


--
-- Name: node__4DN QVal Bin node__4DN QVal Bin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__4DN QVal Bin"
    ADD CONSTRAINT "node__4DN QVal Bin_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Amino Acid node__Amino Acid_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Amino Acid"
    ADD CONSTRAINT "node__Amino Acid_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Anatomy node__Anatomy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Anatomy"
    ADD CONSTRAINT "node__Anatomy_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Assay node__Assay_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Assay"
    ADD CONSTRAINT "node__Assay_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Compound node__Compound_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Compound"
    ADD CONSTRAINT "node__Compound_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Disease or Phenotype node__Disease or Phenotype_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Disease or Phenotype"
    ADD CONSTRAINT "node__Disease or Phenotype_pkey" PRIMARY KEY (type, id);


--
-- Name: node__GO node__GO_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__GO"
    ADD CONSTRAINT "node__GO_pkey" PRIMARY KEY (type, id);


--
-- Name: node__GP ID2PRO node__GP ID2PRO_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__GP ID2PRO"
    ADD CONSTRAINT "node__GP ID2PRO_pkey" PRIMARY KEY (type, id);


--
-- Name: node__GlyGen Glycosequence node__GlyGen Glycosequence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__GlyGen Glycosequence"
    ADD CONSTRAINT "node__GlyGen Glycosequence_pkey" PRIMARY KEY (type, id);


--
-- Name: node__GlyGen Location node__GlyGen Location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__GlyGen Location"
    ADD CONSTRAINT "node__GlyGen Location_pkey" PRIMARY KEY (type, id);


--
-- Name: node__GlyGen Residue node__GlyGen Residue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__GlyGen Residue"
    ADD CONSTRAINT "node__GlyGen Residue_pkey" PRIMARY KEY (type, id);


--
-- Name: node__GlyGen src node__GlyGen src_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__GlyGen src"
    ADD CONSTRAINT "node__GlyGen src_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Glycan Motif node__Glycan Motif_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Glycan Motif"
    ADD CONSTRAINT "node__Glycan Motif_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Glycoprotein Citation node__Glycoprotein Citation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Glycoprotein Citation"
    ADD CONSTRAINT "node__Glycoprotein Citation_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Glycoprotein Evidence node__Glycoprotein Evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Glycoprotein Evidence"
    ADD CONSTRAINT "node__Glycoprotein Evidence_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Glycoprotein node__Glycoprotein_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Glycoprotein"
    ADD CONSTRAINT "node__Glycoprotein_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Glycosylation Site node__Glycosylation Site_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Glycosylation Site"
    ADD CONSTRAINT "node__Glycosylation Site_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Glycosylation node__Glycosylation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Glycosylation"
    ADD CONSTRAINT "node__Glycosylation_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Glycosyltransferase Reaction node__Glycosyltransferase Reaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Glycosyltransferase Reaction"
    ADD CONSTRAINT "node__Glycosyltransferase Reaction_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Glytoucan node__Glytoucan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Glytoucan"
    ADD CONSTRAINT "node__Glytoucan_pkey" PRIMARY KEY (type, id);


--
-- Name: node__HSCLO node__HSCLO_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__HSCLO"
    ADD CONSTRAINT "node__HSCLO_pkey" PRIMARY KEY (type, id);


--
-- Name: node__ILX node__ILX_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__ILX"
    ADD CONSTRAINT "node__ILX_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Isoform node__Isoform_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Isoform"
    ADD CONSTRAINT "node__Isoform_pkey" PRIMARY KEY (type, id);


--
-- Name: node__KFCOHORT node__KFCOHORT_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__KFCOHORT"
    ADD CONSTRAINT "node__KFCOHORT_pkey" PRIMARY KEY (type, id);


--
-- Name: node__KFGENEBIN node__KFGENEBIN_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__KFGENEBIN"
    ADD CONSTRAINT "node__KFGENEBIN_pkey" PRIMARY KEY (type, id);


--
-- Name: node__KFPT node__KFPT_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__KFPT"
    ADD CONSTRAINT "node__KFPT_pkey" PRIMARY KEY (type, id);


--
-- Name: node__MOTRPAC node__MOTRPAC_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__MOTRPAC"
    ADD CONSTRAINT "node__MOTRPAC_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Metabolite node__Metabolite_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Metabolite"
    ADD CONSTRAINT "node__Metabolite_pkey" PRIMARY KEY (type, id);


--
-- Name: node__NIFSTD node__NIFSTD_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__NIFSTD"
    ADD CONSTRAINT "node__NIFSTD_pkey" PRIMARY KEY (type, id);


--
-- Name: node__PATO node__PATO_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__PATO"
    ADD CONSTRAINT "node__PATO_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Protein node__Protein_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Protein"
    ADD CONSTRAINT "node__Protein_pkey" PRIMARY KEY (type, id);


--
-- Name: node__SO node__SO_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__SO"
    ADD CONSTRAINT "node__SO_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Sex node__Sex_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Sex"
    ADD CONSTRAINT "node__Sex_pkey" PRIMARY KEY (type, id);


--
-- Name: node__Taxon node__Taxon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."node__Taxon"
    ADD CONSTRAINT "node__Taxon_pkey" PRIMARY KEY (type, id);


--
-- Name: node__c2m2_analysis_type node__c2m2_analysis_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_analysis_type
    ADD CONSTRAINT node__c2m2_analysis_type_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_anatomy node__c2m2_anatomy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_anatomy
    ADD CONSTRAINT node__c2m2_anatomy_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_assay_type node__c2m2_assay_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_assay_type
    ADD CONSTRAINT node__c2m2_assay_type_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_biosample_disease node__c2m2_biosample_disease_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_biosample_disease
    ADD CONSTRAINT node__c2m2_biosample_disease_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_biosample_from_subject node__c2m2_biosample_from_subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_biosample_from_subject
    ADD CONSTRAINT node__c2m2_biosample_from_subject_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_biosample_gene node__c2m2_biosample_gene_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_biosample_gene
    ADD CONSTRAINT node__c2m2_biosample_gene_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_biosample_in_collection node__c2m2_biosample_in_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_biosample_in_collection
    ADD CONSTRAINT node__c2m2_biosample_in_collection_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_biosample node__c2m2_biosample_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_biosample
    ADD CONSTRAINT node__c2m2_biosample_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_biosample_substance node__c2m2_biosample_substance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_biosample_substance
    ADD CONSTRAINT node__c2m2_biosample_substance_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_collection_anatomy node__c2m2_collection_anatomy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_collection_anatomy
    ADD CONSTRAINT node__c2m2_collection_anatomy_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_collection_defined_by_project node__c2m2_collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_collection_defined_by_project
    ADD CONSTRAINT node__c2m2_collection_defined_by_project_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_collection node__c2m2_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_collection
    ADD CONSTRAINT node__c2m2_collection_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_collection_taxonomy node__c2m2_collection_taxonomy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_collection_taxonomy
    ADD CONSTRAINT node__c2m2_collection_taxonomy_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_compound node__c2m2_compound_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_compound
    ADD CONSTRAINT node__c2m2_compound_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_data_type node__c2m2_data_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_data_type
    ADD CONSTRAINT node__c2m2_data_type_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_dcc node__c2m2_dcc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_dcc
    ADD CONSTRAINT node__c2m2_dcc_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_disease node__c2m2_disease_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_disease
    ADD CONSTRAINT node__c2m2_disease_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_file_describes_biosample node__c2m2_file_describes_biosample_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_file_describes_biosample
    ADD CONSTRAINT node__c2m2_file_describes_biosample_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_file_describes_subject node__c2m2_file_describes_subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_file_describes_subject
    ADD CONSTRAINT node__c2m2_file_describes_subject_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_file_format node__c2m2_file_format_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_file_format
    ADD CONSTRAINT node__c2m2_file_format_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_file_in_collection node__c2m2_file_in_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_file_in_collection
    ADD CONSTRAINT node__c2m2_file_in_collection_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_file node__c2m2_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_file
    ADD CONSTRAINT node__c2m2_file_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_gene node__c2m2_gene_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_gene
    ADD CONSTRAINT node__c2m2_gene_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_id_namespace node__c2m2_id_namespace_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_id_namespace
    ADD CONSTRAINT node__c2m2_id_namespace_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_ncbi_taxonomy node__c2m2_ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_ncbi_taxonomy
    ADD CONSTRAINT node__c2m2_ncbi_taxonomy_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_project_in_project node__c2m2_project_in_project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_project_in_project
    ADD CONSTRAINT node__c2m2_project_in_project_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_project node__c2m2_project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_project
    ADD CONSTRAINT node__c2m2_project_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_sample_prep_method node__c2m2_sample_prep_method_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_sample_prep_method
    ADD CONSTRAINT node__c2m2_sample_prep_method_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_subject_disease node__c2m2_subject_disease_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_subject_disease
    ADD CONSTRAINT node__c2m2_subject_disease_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_subject_in_collection node__c2m2_subject_in_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_subject_in_collection
    ADD CONSTRAINT node__c2m2_subject_in_collection_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_subject node__c2m2_subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_subject
    ADD CONSTRAINT node__c2m2_subject_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_subject_role_taxonomy node__c2m2_subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_subject_role_taxonomy
    ADD CONSTRAINT node__c2m2_subject_role_taxonomy_pkey PRIMARY KEY (type, id);


--
-- Name: node__c2m2_substance node__c2m2_substance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__c2m2_substance
    ADD CONSTRAINT node__c2m2_substance_pkey PRIMARY KEY (type, id);


--
-- Name: node__dcc_asset node__dcc_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__dcc_asset
    ADD CONSTRAINT node__dcc_asset_pkey PRIMARY KEY (type, id);


--
-- Name: node__dcc node__dcc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__dcc
    ADD CONSTRAINT node__dcc_pkey PRIMARY KEY (type, id);


--
-- Name: node__gene node__gene_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__gene
    ADD CONSTRAINT node__gene_pkey PRIMARY KEY (type, id);


--
-- Name: node__gene_set_library node__gene_set_library_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__gene_set_library
    ADD CONSTRAINT node__gene_set_library_pkey PRIMARY KEY (type, id);


--
-- Name: node__gene_set node__gene_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__gene_set
    ADD CONSTRAINT node__gene_set_pkey PRIMARY KEY (type, id);


--
-- Name: node__kg_assertion node__kg_assertion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__kg_assertion
    ADD CONSTRAINT node__kg_assertion_pkey PRIMARY KEY (type, id);


--
-- Name: node__kg_assertion_relation node__kg_assertion_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__kg_assertion_relation
    ADD CONSTRAINT node__kg_assertion_relation_pkey PRIMARY KEY (type, id);


--
-- Name: node__kg_assertion_source node__kg_assertion_source_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__kg_assertion_source
    ADD CONSTRAINT node__kg_assertion_source_pkey PRIMARY KEY (type, id);


--
-- Name: node__kg_assertion_target node__kg_assertion_target_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__kg_assertion_target
    ADD CONSTRAINT node__kg_assertion_target_pkey PRIMARY KEY (type, id);


--
-- Name: node__kg_relation node__kg_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node__kg_relation
    ADD CONSTRAINT node__kg_relation_pkey PRIMARY KEY (type, id);


--
-- Name: relation relation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation
    ADD CONSTRAINT relation_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__anatomy relation__c2m2__c2m2_biosample__c2m2__anatomy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample__c2m2__anatomy
    ADD CONSTRAINT relation__c2m2__c2m2_biosample__c2m2__anatomy_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__id_namespace relation__c2m2__c2m2_biosample__c2m2__id_namespace_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample__c2m2__id_namespace
    ADD CONSTRAINT relation__c2m2__c2m2_biosample__c2m2__id_namespace_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__project relation__c2m2__c2m2_biosample__c2m2__project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample__c2m2__project
    ADD CONSTRAINT relation__c2m2__c2m2_biosample__c2m2__project_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__sample_prep_method relation__c2m2__c2m2_biosample__c2m2__sample_prep_method_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample__c2m2__sample_prep_method
    ADD CONSTRAINT relation__c2m2__c2m2_biosample__c2m2__sample_prep_method_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__biosample relation__c2m2__c2m2_biosample_disease__c2m2__biosample_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample_disease__c2m2__biosample
    ADD CONSTRAINT relation__c2m2__c2m2_biosample_disease__c2m2__biosample_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__disease relation__c2m2__c2m2_biosample_disease__c2m2__disease_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample_disease__c2m2__disease
    ADD CONSTRAINT relation__c2m2__c2m2_biosample_disease__c2m2__disease_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m2__biosample relation__c2m2__c2m2_biosample_from_subject__c2m2__biosamp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample_from_subject__c2m2__biosample
    ADD CONSTRAINT relation__c2m2__c2m2_biosample_from_subject__c2m2__biosamp_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m2__subject relation__c2m2__c2m2_biosample_from_subject__c2m2__subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample_from_subject__c2m2__subject
    ADD CONSTRAINT relation__c2m2__c2m2_biosample_from_subject__c2m2__subject_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__biosample relation__c2m2__c2m2_biosample_gene__c2m2__biosample_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample_gene__c2m2__biosample
    ADD CONSTRAINT relation__c2m2__c2m2_biosample_gene__c2m2__biosample_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__gene relation__c2m2__c2m2_biosample_gene__c2m2__gene_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample_gene__c2m2__gene
    ADD CONSTRAINT relation__c2m2__c2m2_biosample_gene__c2m2__gene_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2m2__biosample relation__c2m2__c2m2_biosample_in_collection__c2m2__biosam_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample_in_collection__c2m2__biosample
    ADD CONSTRAINT relation__c2m2__c2m2_biosample_in_collection__c2m2__biosam_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2m2__collection relation__c2m2__c2m2_biosample_in_collection__c2m2__collec_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample_in_collection__c2m2__collection
    ADD CONSTRAINT relation__c2m2__c2m2_biosample_in_collection__c2m2__collec_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__biosample relation__c2m2__c2m2_biosample_substance__c2m2__biosample_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample_substance__c2m2__biosample
    ADD CONSTRAINT relation__c2m2__c2m2_biosample_substance__c2m2__biosample_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__substance relation__c2m2__c2m2_biosample_substance__c2m2__substance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_biosample_substance__c2m2__substance
    ADD CONSTRAINT relation__c2m2__c2m2_biosample_substance__c2m2__substance_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_collection__c2m2__id_namespace relation__c2m2__c2m2_collection__c2m2__id_namespace_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_collection__c2m2__id_namespace
    ADD CONSTRAINT relation__c2m2__c2m2_collection__c2m2__id_namespace_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__anatomy relation__c2m2__c2m2_collection_anatomy__c2m2__anatomy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_collection_anatomy__c2m2__anatomy
    ADD CONSTRAINT relation__c2m2__c2m2_collection_anatomy__c2m2__anatomy_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__collection relation__c2m2__c2m2_collection_anatomy__c2m2__collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_collection_anatomy__c2m2__collection
    ADD CONSTRAINT relation__c2m2__c2m2_collection_anatomy__c2m2__collection_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_collection_defined_by_project__c2m2__colle relation__c2m2__c2m2_collection_defined_by_project__c2m2___pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_collection_defined_by_project__c2m2__colle
    ADD CONSTRAINT relation__c2m2__c2m2_collection_defined_by_project__c2m2___pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_collection_defined_by_project__c2m2__proje relation__c2m2__c2m2_collection_defined_by_project__c2m2__pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_collection_defined_by_project__c2m2__proje
    ADD CONSTRAINT relation__c2m2__c2m2_collection_defined_by_project__c2m2__pkey1 PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__collection relation__c2m2__c2m2_collection_taxonomy__c2m2__collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_collection_taxonomy__c2m2__collection
    ADD CONSTRAINT relation__c2m2__c2m2_collection_taxonomy__c2m2__collection_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxonomy relation__c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxonomy
    ADD CONSTRAINT relation__c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxon_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_dcc__c2m2__project relation__c2m2__c2m2_dcc__c2m2__project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_dcc__c2m2__project
    ADD CONSTRAINT relation__c2m2__c2m2_dcc__c2m2__project_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file__c2m2__analysis_type relation__c2m2__c2m2_file__c2m2__analysis_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file__c2m2__analysis_type
    ADD CONSTRAINT relation__c2m2__c2m2_file__c2m2__analysis_type_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file__c2m2__assay_type relation__c2m2__c2m2_file__c2m2__assay_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file__c2m2__assay_type
    ADD CONSTRAINT relation__c2m2__c2m2_file__c2m2__assay_type_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file__c2m2__data_type relation__c2m2__c2m2_file__c2m2__data_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file__c2m2__data_type
    ADD CONSTRAINT relation__c2m2__c2m2_file__c2m2__data_type_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file__c2m2__file_format relation__c2m2__c2m2_file__c2m2__file_format_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file__c2m2__file_format
    ADD CONSTRAINT relation__c2m2__c2m2_file__c2m2__file_format_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file__c2m2__id_namespace relation__c2m2__c2m2_file__c2m2__id_namespace_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file__c2m2__id_namespace
    ADD CONSTRAINT relation__c2m2__c2m2_file__c2m2__id_namespace_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file__c2m2__project relation__c2m2__c2m2_file__c2m2__project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file__c2m2__project
    ADD CONSTRAINT relation__c2m2__c2m2_file__c2m2__project_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c2m2__biosample relation__c2m2__c2m2_file_describes_biosample__c2m2__biosa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file_describes_biosample__c2m2__biosample
    ADD CONSTRAINT relation__c2m2__c2m2_file_describes_biosample__c2m2__biosa_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c2m2__file relation__c2m2__c2m2_file_describes_biosample__c2m2__file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file_describes_biosample__c2m2__file
    ADD CONSTRAINT relation__c2m2__c2m2_file_describes_biosample__c2m2__file_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m2__file relation__c2m2__c2m2_file_describes_subject__c2m2__file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file_describes_subject__c2m2__file
    ADD CONSTRAINT relation__c2m2__c2m2_file_describes_subject__c2m2__file_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m2__subject relation__c2m2__c2m2_file_describes_subject__c2m2__subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file_describes_subject__c2m2__subject
    ADD CONSTRAINT relation__c2m2__c2m2_file_describes_subject__c2m2__subject_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__collection relation__c2m2__c2m2_file_in_collection__c2m2__collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file_in_collection__c2m2__collection
    ADD CONSTRAINT relation__c2m2__c2m2_file_in_collection__c2m2__collection_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__file relation__c2m2__c2m2_file_in_collection__c2m2__file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_file_in_collection__c2m2__file
    ADD CONSTRAINT relation__c2m2__c2m2_file_in_collection__c2m2__file_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy
    ADD CONSTRAINT relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_project__c2m2__id_namespace relation__c2m2__c2m2_project__c2m2__id_namespace_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_project__c2m2__id_namespace
    ADD CONSTRAINT relation__c2m2__c2m2_project__c2m2__id_namespace_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_project_in_project__c2m2__project relation__c2m2__c2m2_project_in_project__c2m2__project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_project_in_project__c2m2__project
    ADD CONSTRAINT relation__c2m2__c2m2_project_in_project__c2m2__project_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_subject__c2m2__id_namespace relation__c2m2__c2m2_subject__c2m2__id_namespace_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_subject__c2m2__id_namespace
    ADD CONSTRAINT relation__c2m2__c2m2_subject__c2m2__id_namespace_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_subject__c2m2__project relation__c2m2__c2m2_subject__c2m2__project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_subject__c2m2__project
    ADD CONSTRAINT relation__c2m2__c2m2_subject__c2m2__project_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__disease relation__c2m2__c2m2_subject_disease__c2m2__disease_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_subject_disease__c2m2__disease
    ADD CONSTRAINT relation__c2m2__c2m2_subject_disease__c2m2__disease_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__subject relation__c2m2__c2m2_subject_disease__c2m2__subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_subject_disease__c2m2__subject
    ADD CONSTRAINT relation__c2m2__c2m2_subject_disease__c2m2__subject_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2__collection relation__c2m2__c2m2_subject_in_collection__c2m2__collecti_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_subject_in_collection__c2m2__collection
    ADD CONSTRAINT relation__c2m2__c2m2_subject_in_collection__c2m2__collecti_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2__subject relation__c2m2__c2m2_subject_in_collection__c2m2__subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_subject_in_collection__c2m2__subject
    ADD CONSTRAINT relation__c2m2__c2m2_subject_in_collection__c2m2__subject_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_taxonomy relation__c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_tax_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_taxonomy
    ADD CONSTRAINT relation__c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_tax_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2__subject relation__c2m2__c2m2_subject_role_taxonomy__c2m2__subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2__subject
    ADD CONSTRAINT relation__c2m2__c2m2_subject_role_taxonomy__c2m2__subject_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__c2m2__c2m2_substance__c2m2__compound relation__c2m2__c2m2_substance__c2m2__compound_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__c2m2__c2m2_substance__c2m2__compound
    ADD CONSTRAINT relation__c2m2__c2m2_substance__c2m2__compound_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__dcc relation__dcc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__dcc
    ADD CONSTRAINT relation__dcc_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__is_from_dcc_asset relation__is_from_dcc_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__is_from_dcc_asset
    ADD CONSTRAINT relation__is_from_dcc_asset_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__is_in_gene_set_library relation__is_in_gene_set_library_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__is_in_gene_set_library
    ADD CONSTRAINT relation__is_in_gene_set_library_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__is_in_gene_set relation__is_in_gene_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__is_in_gene_set
    ADD CONSTRAINT relation__is_in_gene_set_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__kg_assertion_relation relation__kg_assertion_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__kg_assertion_relation
    ADD CONSTRAINT relation__kg_assertion_relation_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__kg_assertion_source relation__kg_assertion_source_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__kg_assertion_source
    ADD CONSTRAINT relation__kg_assertion_source_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: relation__kg_assertion_target relation__kg_assertion_target_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relation__kg_assertion_target
    ADD CONSTRAINT relation__kg_assertion_target_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: node_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node_pagerank_idx ON ONLY public.node USING btree (pagerank);


--
-- Name: node__4DN Dataset_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN Dataset_pagerank_idx" ON public."node__4DN Dataset" USING btree (pagerank);


--
-- Name: node_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node_pagerank_idx1 ON ONLY public.node USING btree (pagerank);


--
-- Name: node__4DN Dataset_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN Dataset_pagerank_idx1" ON public."node__4DN Dataset" USING btree (pagerank);


--
-- Name: node_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node_searchable_idx ON ONLY public.node USING gin (searchable);


--
-- Name: node__4DN Dataset_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN Dataset_searchable_idx" ON public."node__4DN Dataset" USING gin (searchable);


--
-- Name: node__4DN File_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN File_pagerank_idx" ON public."node__4DN File" USING btree (pagerank);


--
-- Name: node__4DN File_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN File_pagerank_idx1" ON public."node__4DN File" USING btree (pagerank);


--
-- Name: node__4DN File_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN File_searchable_idx" ON public."node__4DN File" USING gin (searchable);


--
-- Name: node__4DN Loop_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN Loop_pagerank_idx" ON public."node__4DN Loop" USING btree (pagerank);


--
-- Name: node__4DN Loop_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN Loop_pagerank_idx1" ON public."node__4DN Loop" USING btree (pagerank);


--
-- Name: node__4DN Loop_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN Loop_searchable_idx" ON public."node__4DN Loop" USING gin (searchable);


--
-- Name: node__4DN QVal Bin_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN QVal Bin_pagerank_idx" ON public."node__4DN QVal Bin" USING btree (pagerank);


--
-- Name: node__4DN QVal Bin_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN QVal Bin_pagerank_idx1" ON public."node__4DN QVal Bin" USING btree (pagerank);


--
-- Name: node__4DN QVal Bin_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__4DN QVal Bin_searchable_idx" ON public."node__4DN QVal Bin" USING gin (searchable);


--
-- Name: node__Amino Acid_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Amino Acid_pagerank_idx" ON public."node__Amino Acid" USING btree (pagerank);


--
-- Name: node__Amino Acid_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Amino Acid_pagerank_idx1" ON public."node__Amino Acid" USING btree (pagerank);


--
-- Name: node__Amino Acid_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Amino Acid_searchable_idx" ON public."node__Amino Acid" USING gin (searchable);


--
-- Name: node__Anatomy_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Anatomy_pagerank_idx" ON public."node__Anatomy" USING btree (pagerank);


--
-- Name: node__Anatomy_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Anatomy_pagerank_idx1" ON public."node__Anatomy" USING btree (pagerank);


--
-- Name: node__Anatomy_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Anatomy_searchable_idx" ON public."node__Anatomy" USING gin (searchable);


--
-- Name: node__Assay_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Assay_pagerank_idx" ON public."node__Assay" USING btree (pagerank);


--
-- Name: node__Assay_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Assay_pagerank_idx1" ON public."node__Assay" USING btree (pagerank);


--
-- Name: node__Assay_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Assay_searchable_idx" ON public."node__Assay" USING gin (searchable);


--
-- Name: node__Compound_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Compound_pagerank_idx" ON public."node__Compound" USING btree (pagerank);


--
-- Name: node__Compound_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Compound_pagerank_idx1" ON public."node__Compound" USING btree (pagerank);


--
-- Name: node__Compound_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Compound_searchable_idx" ON public."node__Compound" USING gin (searchable);


--
-- Name: node__Disease or Phenotype_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Disease or Phenotype_pagerank_idx" ON public."node__Disease or Phenotype" USING btree (pagerank);


--
-- Name: node__Disease or Phenotype_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Disease or Phenotype_pagerank_idx1" ON public."node__Disease or Phenotype" USING btree (pagerank);


--
-- Name: node__Disease or Phenotype_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Disease or Phenotype_searchable_idx" ON public."node__Disease or Phenotype" USING gin (searchable);


--
-- Name: node__GO_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GO_pagerank_idx" ON public."node__GO" USING btree (pagerank);


--
-- Name: node__GO_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GO_pagerank_idx1" ON public."node__GO" USING btree (pagerank);


--
-- Name: node__GO_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GO_searchable_idx" ON public."node__GO" USING gin (searchable);


--
-- Name: node__GP ID2PRO_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GP ID2PRO_pagerank_idx" ON public."node__GP ID2PRO" USING btree (pagerank);


--
-- Name: node__GP ID2PRO_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GP ID2PRO_pagerank_idx1" ON public."node__GP ID2PRO" USING btree (pagerank);


--
-- Name: node__GP ID2PRO_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GP ID2PRO_searchable_idx" ON public."node__GP ID2PRO" USING gin (searchable);


--
-- Name: node__GlyGen Glycosequence_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen Glycosequence_pagerank_idx" ON public."node__GlyGen Glycosequence" USING btree (pagerank);


--
-- Name: node__GlyGen Glycosequence_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen Glycosequence_pagerank_idx1" ON public."node__GlyGen Glycosequence" USING btree (pagerank);


--
-- Name: node__GlyGen Glycosequence_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen Glycosequence_searchable_idx" ON public."node__GlyGen Glycosequence" USING gin (searchable);


--
-- Name: node__GlyGen Location_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen Location_pagerank_idx" ON public."node__GlyGen Location" USING btree (pagerank);


--
-- Name: node__GlyGen Location_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen Location_pagerank_idx1" ON public."node__GlyGen Location" USING btree (pagerank);


--
-- Name: node__GlyGen Location_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen Location_searchable_idx" ON public."node__GlyGen Location" USING gin (searchable);


--
-- Name: node__GlyGen Residue_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen Residue_pagerank_idx" ON public."node__GlyGen Residue" USING btree (pagerank);


--
-- Name: node__GlyGen Residue_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen Residue_pagerank_idx1" ON public."node__GlyGen Residue" USING btree (pagerank);


--
-- Name: node__GlyGen Residue_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen Residue_searchable_idx" ON public."node__GlyGen Residue" USING gin (searchable);


--
-- Name: node__GlyGen src_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen src_pagerank_idx" ON public."node__GlyGen src" USING btree (pagerank);


--
-- Name: node__GlyGen src_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen src_pagerank_idx1" ON public."node__GlyGen src" USING btree (pagerank);


--
-- Name: node__GlyGen src_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__GlyGen src_searchable_idx" ON public."node__GlyGen src" USING gin (searchable);


--
-- Name: node__Glycan Motif_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycan Motif_pagerank_idx" ON public."node__Glycan Motif" USING btree (pagerank);


--
-- Name: node__Glycan Motif_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycan Motif_pagerank_idx1" ON public."node__Glycan Motif" USING btree (pagerank);


--
-- Name: node__Glycan Motif_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycan Motif_searchable_idx" ON public."node__Glycan Motif" USING gin (searchable);


--
-- Name: node__Glycoprotein Citation_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycoprotein Citation_pagerank_idx" ON public."node__Glycoprotein Citation" USING btree (pagerank);


--
-- Name: node__Glycoprotein Citation_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycoprotein Citation_pagerank_idx1" ON public."node__Glycoprotein Citation" USING btree (pagerank);


--
-- Name: node__Glycoprotein Citation_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycoprotein Citation_searchable_idx" ON public."node__Glycoprotein Citation" USING gin (searchable);


--
-- Name: node__Glycoprotein Evidence_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycoprotein Evidence_pagerank_idx" ON public."node__Glycoprotein Evidence" USING btree (pagerank);


--
-- Name: node__Glycoprotein Evidence_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycoprotein Evidence_pagerank_idx1" ON public."node__Glycoprotein Evidence" USING btree (pagerank);


--
-- Name: node__Glycoprotein Evidence_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycoprotein Evidence_searchable_idx" ON public."node__Glycoprotein Evidence" USING gin (searchable);


--
-- Name: node__Glycoprotein_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycoprotein_pagerank_idx" ON public."node__Glycoprotein" USING btree (pagerank);


--
-- Name: node__Glycoprotein_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycoprotein_pagerank_idx1" ON public."node__Glycoprotein" USING btree (pagerank);


--
-- Name: node__Glycoprotein_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycoprotein_searchable_idx" ON public."node__Glycoprotein" USING gin (searchable);


--
-- Name: node__Glycosylation Site_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycosylation Site_pagerank_idx" ON public."node__Glycosylation Site" USING btree (pagerank);


--
-- Name: node__Glycosylation Site_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycosylation Site_pagerank_idx1" ON public."node__Glycosylation Site" USING btree (pagerank);


--
-- Name: node__Glycosylation Site_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycosylation Site_searchable_idx" ON public."node__Glycosylation Site" USING gin (searchable);


--
-- Name: node__Glycosylation_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycosylation_pagerank_idx" ON public."node__Glycosylation" USING btree (pagerank);


--
-- Name: node__Glycosylation_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycosylation_pagerank_idx1" ON public."node__Glycosylation" USING btree (pagerank);


--
-- Name: node__Glycosylation_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycosylation_searchable_idx" ON public."node__Glycosylation" USING gin (searchable);


--
-- Name: node__Glycosyltransferase Reaction_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycosyltransferase Reaction_pagerank_idx" ON public."node__Glycosyltransferase Reaction" USING btree (pagerank);


--
-- Name: node__Glycosyltransferase Reaction_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycosyltransferase Reaction_pagerank_idx1" ON public."node__Glycosyltransferase Reaction" USING btree (pagerank);


--
-- Name: node__Glycosyltransferase Reaction_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glycosyltransferase Reaction_searchable_idx" ON public."node__Glycosyltransferase Reaction" USING gin (searchable);


--
-- Name: node__Glytoucan_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glytoucan_pagerank_idx" ON public."node__Glytoucan" USING btree (pagerank);


--
-- Name: node__Glytoucan_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glytoucan_pagerank_idx1" ON public."node__Glytoucan" USING btree (pagerank);


--
-- Name: node__Glytoucan_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Glytoucan_searchable_idx" ON public."node__Glytoucan" USING gin (searchable);


--
-- Name: node__HSCLO_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__HSCLO_pagerank_idx" ON public."node__HSCLO" USING btree (pagerank);


--
-- Name: node__HSCLO_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__HSCLO_pagerank_idx1" ON public."node__HSCLO" USING btree (pagerank);


--
-- Name: node__HSCLO_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__HSCLO_searchable_idx" ON public."node__HSCLO" USING gin (searchable);


--
-- Name: node__ILX_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__ILX_pagerank_idx" ON public."node__ILX" USING btree (pagerank);


--
-- Name: node__ILX_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__ILX_pagerank_idx1" ON public."node__ILX" USING btree (pagerank);


--
-- Name: node__ILX_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__ILX_searchable_idx" ON public."node__ILX" USING gin (searchable);


--
-- Name: node__Isoform_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Isoform_pagerank_idx" ON public."node__Isoform" USING btree (pagerank);


--
-- Name: node__Isoform_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Isoform_pagerank_idx1" ON public."node__Isoform" USING btree (pagerank);


--
-- Name: node__Isoform_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Isoform_searchable_idx" ON public."node__Isoform" USING gin (searchable);


--
-- Name: node__KFCOHORT_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__KFCOHORT_pagerank_idx" ON public."node__KFCOHORT" USING btree (pagerank);


--
-- Name: node__KFCOHORT_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__KFCOHORT_pagerank_idx1" ON public."node__KFCOHORT" USING btree (pagerank);


--
-- Name: node__KFCOHORT_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__KFCOHORT_searchable_idx" ON public."node__KFCOHORT" USING gin (searchable);


--
-- Name: node__KFGENEBIN_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__KFGENEBIN_pagerank_idx" ON public."node__KFGENEBIN" USING btree (pagerank);


--
-- Name: node__KFGENEBIN_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__KFGENEBIN_pagerank_idx1" ON public."node__KFGENEBIN" USING btree (pagerank);


--
-- Name: node__KFGENEBIN_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__KFGENEBIN_searchable_idx" ON public."node__KFGENEBIN" USING gin (searchable);


--
-- Name: node__KFPT_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__KFPT_pagerank_idx" ON public."node__KFPT" USING btree (pagerank);


--
-- Name: node__KFPT_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__KFPT_pagerank_idx1" ON public."node__KFPT" USING btree (pagerank);


--
-- Name: node__KFPT_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__KFPT_searchable_idx" ON public."node__KFPT" USING gin (searchable);


--
-- Name: node__MOTRPAC_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__MOTRPAC_pagerank_idx" ON public."node__MOTRPAC" USING btree (pagerank);


--
-- Name: node__MOTRPAC_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__MOTRPAC_pagerank_idx1" ON public."node__MOTRPAC" USING btree (pagerank);


--
-- Name: node__MOTRPAC_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__MOTRPAC_searchable_idx" ON public."node__MOTRPAC" USING gin (searchable);


--
-- Name: node__Metabolite_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Metabolite_pagerank_idx" ON public."node__Metabolite" USING btree (pagerank);


--
-- Name: node__Metabolite_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Metabolite_pagerank_idx1" ON public."node__Metabolite" USING btree (pagerank);


--
-- Name: node__Metabolite_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Metabolite_searchable_idx" ON public."node__Metabolite" USING gin (searchable);


--
-- Name: node__NIFSTD_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__NIFSTD_pagerank_idx" ON public."node__NIFSTD" USING btree (pagerank);


--
-- Name: node__NIFSTD_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__NIFSTD_pagerank_idx1" ON public."node__NIFSTD" USING btree (pagerank);


--
-- Name: node__NIFSTD_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__NIFSTD_searchable_idx" ON public."node__NIFSTD" USING gin (searchable);


--
-- Name: node__PATO_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__PATO_pagerank_idx" ON public."node__PATO" USING btree (pagerank);


--
-- Name: node__PATO_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__PATO_pagerank_idx1" ON public."node__PATO" USING btree (pagerank);


--
-- Name: node__PATO_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__PATO_searchable_idx" ON public."node__PATO" USING gin (searchable);


--
-- Name: node__Protein_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Protein_pagerank_idx" ON public."node__Protein" USING btree (pagerank);


--
-- Name: node__Protein_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Protein_pagerank_idx1" ON public."node__Protein" USING btree (pagerank);


--
-- Name: node__Protein_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Protein_searchable_idx" ON public."node__Protein" USING gin (searchable);


--
-- Name: node__SO_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__SO_pagerank_idx" ON public."node__SO" USING btree (pagerank);


--
-- Name: node__SO_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__SO_pagerank_idx1" ON public."node__SO" USING btree (pagerank);


--
-- Name: node__SO_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__SO_searchable_idx" ON public."node__SO" USING gin (searchable);


--
-- Name: node__Sex_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Sex_pagerank_idx" ON public."node__Sex" USING btree (pagerank);


--
-- Name: node__Sex_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Sex_pagerank_idx1" ON public."node__Sex" USING btree (pagerank);


--
-- Name: node__Sex_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Sex_searchable_idx" ON public."node__Sex" USING gin (searchable);


--
-- Name: node__Taxon_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Taxon_pagerank_idx" ON public."node__Taxon" USING btree (pagerank);


--
-- Name: node__Taxon_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Taxon_pagerank_idx1" ON public."node__Taxon" USING btree (pagerank);


--
-- Name: node__Taxon_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "node__Taxon_searchable_idx" ON public."node__Taxon" USING gin (searchable);


--
-- Name: node__c2m2_analysis_type_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_analysis_type_pagerank_idx ON public.node__c2m2_analysis_type USING btree (pagerank);


--
-- Name: node__c2m2_analysis_type_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_analysis_type_pagerank_idx1 ON public.node__c2m2_analysis_type USING btree (pagerank);


--
-- Name: node__c2m2_analysis_type_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_analysis_type_searchable_idx ON public.node__c2m2_analysis_type USING gin (searchable);


--
-- Name: node__c2m2_anatomy_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_anatomy_pagerank_idx ON public.node__c2m2_anatomy USING btree (pagerank);


--
-- Name: node__c2m2_anatomy_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_anatomy_pagerank_idx1 ON public.node__c2m2_anatomy USING btree (pagerank);


--
-- Name: node__c2m2_anatomy_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_anatomy_searchable_idx ON public.node__c2m2_anatomy USING gin (searchable);


--
-- Name: node__c2m2_assay_type_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_assay_type_pagerank_idx ON public.node__c2m2_assay_type USING btree (pagerank);


--
-- Name: node__c2m2_assay_type_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_assay_type_pagerank_idx1 ON public.node__c2m2_assay_type USING btree (pagerank);


--
-- Name: node__c2m2_assay_type_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_assay_type_searchable_idx ON public.node__c2m2_assay_type USING gin (searchable);


--
-- Name: node__c2m2_biosample_disease_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_disease_pagerank_idx ON public.node__c2m2_biosample_disease USING btree (pagerank);


--
-- Name: node__c2m2_biosample_disease_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_disease_pagerank_idx1 ON public.node__c2m2_biosample_disease USING btree (pagerank);


--
-- Name: node__c2m2_biosample_disease_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_disease_searchable_idx ON public.node__c2m2_biosample_disease USING gin (searchable);


--
-- Name: node__c2m2_biosample_from_subject_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_from_subject_pagerank_idx ON public.node__c2m2_biosample_from_subject USING btree (pagerank);


--
-- Name: node__c2m2_biosample_from_subject_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_from_subject_pagerank_idx1 ON public.node__c2m2_biosample_from_subject USING btree (pagerank);


--
-- Name: node__c2m2_biosample_from_subject_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_from_subject_searchable_idx ON public.node__c2m2_biosample_from_subject USING gin (searchable);


--
-- Name: node__c2m2_biosample_gene_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_gene_pagerank_idx ON public.node__c2m2_biosample_gene USING btree (pagerank);


--
-- Name: node__c2m2_biosample_gene_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_gene_pagerank_idx1 ON public.node__c2m2_biosample_gene USING btree (pagerank);


--
-- Name: node__c2m2_biosample_gene_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_gene_searchable_idx ON public.node__c2m2_biosample_gene USING gin (searchable);


--
-- Name: node__c2m2_biosample_in_collection_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_in_collection_pagerank_idx ON public.node__c2m2_biosample_in_collection USING btree (pagerank);


--
-- Name: node__c2m2_biosample_in_collection_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_in_collection_pagerank_idx1 ON public.node__c2m2_biosample_in_collection USING btree (pagerank);


--
-- Name: node__c2m2_biosample_in_collection_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_in_collection_searchable_idx ON public.node__c2m2_biosample_in_collection USING gin (searchable);


--
-- Name: node__c2m2_biosample_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_pagerank_idx ON public.node__c2m2_biosample USING btree (pagerank);


--
-- Name: node__c2m2_biosample_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_pagerank_idx1 ON public.node__c2m2_biosample USING btree (pagerank);


--
-- Name: node__c2m2_biosample_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_searchable_idx ON public.node__c2m2_biosample USING gin (searchable);


--
-- Name: node__c2m2_biosample_substance_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_substance_pagerank_idx ON public.node__c2m2_biosample_substance USING btree (pagerank);


--
-- Name: node__c2m2_biosample_substance_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_substance_pagerank_idx1 ON public.node__c2m2_biosample_substance USING btree (pagerank);


--
-- Name: node__c2m2_biosample_substance_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_biosample_substance_searchable_idx ON public.node__c2m2_biosample_substance USING gin (searchable);


--
-- Name: node__c2m2_collection_anatomy_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_anatomy_pagerank_idx ON public.node__c2m2_collection_anatomy USING btree (pagerank);


--
-- Name: node__c2m2_collection_anatomy_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_anatomy_pagerank_idx1 ON public.node__c2m2_collection_anatomy USING btree (pagerank);


--
-- Name: node__c2m2_collection_anatomy_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_anatomy_searchable_idx ON public.node__c2m2_collection_anatomy USING gin (searchable);


--
-- Name: node__c2m2_collection_defined_by_project_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_defined_by_project_pagerank_idx ON public.node__c2m2_collection_defined_by_project USING btree (pagerank);


--
-- Name: node__c2m2_collection_defined_by_project_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_defined_by_project_pagerank_idx1 ON public.node__c2m2_collection_defined_by_project USING btree (pagerank);


--
-- Name: node__c2m2_collection_defined_by_project_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_defined_by_project_searchable_idx ON public.node__c2m2_collection_defined_by_project USING gin (searchable);


--
-- Name: node__c2m2_collection_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_pagerank_idx ON public.node__c2m2_collection USING btree (pagerank);


--
-- Name: node__c2m2_collection_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_pagerank_idx1 ON public.node__c2m2_collection USING btree (pagerank);


--
-- Name: node__c2m2_collection_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_searchable_idx ON public.node__c2m2_collection USING gin (searchable);


--
-- Name: node__c2m2_collection_taxonomy_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_taxonomy_pagerank_idx ON public.node__c2m2_collection_taxonomy USING btree (pagerank);


--
-- Name: node__c2m2_collection_taxonomy_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_taxonomy_pagerank_idx1 ON public.node__c2m2_collection_taxonomy USING btree (pagerank);


--
-- Name: node__c2m2_collection_taxonomy_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_collection_taxonomy_searchable_idx ON public.node__c2m2_collection_taxonomy USING gin (searchable);


--
-- Name: node__c2m2_compound_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_compound_pagerank_idx ON public.node__c2m2_compound USING btree (pagerank);


--
-- Name: node__c2m2_compound_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_compound_pagerank_idx1 ON public.node__c2m2_compound USING btree (pagerank);


--
-- Name: node__c2m2_compound_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_compound_searchable_idx ON public.node__c2m2_compound USING gin (searchable);


--
-- Name: node__c2m2_data_type_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_data_type_pagerank_idx ON public.node__c2m2_data_type USING btree (pagerank);


--
-- Name: node__c2m2_data_type_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_data_type_pagerank_idx1 ON public.node__c2m2_data_type USING btree (pagerank);


--
-- Name: node__c2m2_data_type_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_data_type_searchable_idx ON public.node__c2m2_data_type USING gin (searchable);


--
-- Name: node__c2m2_dcc_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_dcc_pagerank_idx ON public.node__c2m2_dcc USING btree (pagerank);


--
-- Name: node__c2m2_dcc_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_dcc_pagerank_idx1 ON public.node__c2m2_dcc USING btree (pagerank);


--
-- Name: node__c2m2_dcc_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_dcc_searchable_idx ON public.node__c2m2_dcc USING gin (searchable);


--
-- Name: node__c2m2_disease_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_disease_pagerank_idx ON public.node__c2m2_disease USING btree (pagerank);


--
-- Name: node__c2m2_disease_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_disease_pagerank_idx1 ON public.node__c2m2_disease USING btree (pagerank);


--
-- Name: node__c2m2_disease_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_disease_searchable_idx ON public.node__c2m2_disease USING gin (searchable);


--
-- Name: node__c2m2_file_describes_biosample_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_describes_biosample_pagerank_idx ON public.node__c2m2_file_describes_biosample USING btree (pagerank);


--
-- Name: node__c2m2_file_describes_biosample_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_describes_biosample_pagerank_idx1 ON public.node__c2m2_file_describes_biosample USING btree (pagerank);


--
-- Name: node__c2m2_file_describes_biosample_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_describes_biosample_searchable_idx ON public.node__c2m2_file_describes_biosample USING gin (searchable);


--
-- Name: node__c2m2_file_describes_subject_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_describes_subject_pagerank_idx ON public.node__c2m2_file_describes_subject USING btree (pagerank);


--
-- Name: node__c2m2_file_describes_subject_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_describes_subject_pagerank_idx1 ON public.node__c2m2_file_describes_subject USING btree (pagerank);


--
-- Name: node__c2m2_file_describes_subject_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_describes_subject_searchable_idx ON public.node__c2m2_file_describes_subject USING gin (searchable);


--
-- Name: node__c2m2_file_format_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_format_pagerank_idx ON public.node__c2m2_file_format USING btree (pagerank);


--
-- Name: node__c2m2_file_format_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_format_pagerank_idx1 ON public.node__c2m2_file_format USING btree (pagerank);


--
-- Name: node__c2m2_file_format_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_format_searchable_idx ON public.node__c2m2_file_format USING gin (searchable);


--
-- Name: node__c2m2_file_in_collection_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_in_collection_pagerank_idx ON public.node__c2m2_file_in_collection USING btree (pagerank);


--
-- Name: node__c2m2_file_in_collection_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_in_collection_pagerank_idx1 ON public.node__c2m2_file_in_collection USING btree (pagerank);


--
-- Name: node__c2m2_file_in_collection_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_in_collection_searchable_idx ON public.node__c2m2_file_in_collection USING gin (searchable);


--
-- Name: node__c2m2_file_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_pagerank_idx ON public.node__c2m2_file USING btree (pagerank);


--
-- Name: node__c2m2_file_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_pagerank_idx1 ON public.node__c2m2_file USING btree (pagerank);


--
-- Name: node__c2m2_file_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_file_searchable_idx ON public.node__c2m2_file USING gin (searchable);


--
-- Name: node__c2m2_gene_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_gene_pagerank_idx ON public.node__c2m2_gene USING btree (pagerank);


--
-- Name: node__c2m2_gene_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_gene_pagerank_idx1 ON public.node__c2m2_gene USING btree (pagerank);


--
-- Name: node__c2m2_gene_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_gene_searchable_idx ON public.node__c2m2_gene USING gin (searchable);


--
-- Name: node__c2m2_id_namespace_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_id_namespace_pagerank_idx ON public.node__c2m2_id_namespace USING btree (pagerank);


--
-- Name: node__c2m2_id_namespace_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_id_namespace_pagerank_idx1 ON public.node__c2m2_id_namespace USING btree (pagerank);


--
-- Name: node__c2m2_id_namespace_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_id_namespace_searchable_idx ON public.node__c2m2_id_namespace USING gin (searchable);


--
-- Name: node__c2m2_ncbi_taxonomy_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_ncbi_taxonomy_pagerank_idx ON public.node__c2m2_ncbi_taxonomy USING btree (pagerank);


--
-- Name: node__c2m2_ncbi_taxonomy_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_ncbi_taxonomy_pagerank_idx1 ON public.node__c2m2_ncbi_taxonomy USING btree (pagerank);


--
-- Name: node__c2m2_ncbi_taxonomy_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_ncbi_taxonomy_searchable_idx ON public.node__c2m2_ncbi_taxonomy USING gin (searchable);


--
-- Name: node__c2m2_project_in_project_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_project_in_project_pagerank_idx ON public.node__c2m2_project_in_project USING btree (pagerank);


--
-- Name: node__c2m2_project_in_project_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_project_in_project_pagerank_idx1 ON public.node__c2m2_project_in_project USING btree (pagerank);


--
-- Name: node__c2m2_project_in_project_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_project_in_project_searchable_idx ON public.node__c2m2_project_in_project USING gin (searchable);


--
-- Name: node__c2m2_project_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_project_pagerank_idx ON public.node__c2m2_project USING btree (pagerank);


--
-- Name: node__c2m2_project_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_project_pagerank_idx1 ON public.node__c2m2_project USING btree (pagerank);


--
-- Name: node__c2m2_project_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_project_searchable_idx ON public.node__c2m2_project USING gin (searchable);


--
-- Name: node__c2m2_sample_prep_method_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_sample_prep_method_pagerank_idx ON public.node__c2m2_sample_prep_method USING btree (pagerank);


--
-- Name: node__c2m2_sample_prep_method_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_sample_prep_method_pagerank_idx1 ON public.node__c2m2_sample_prep_method USING btree (pagerank);


--
-- Name: node__c2m2_sample_prep_method_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_sample_prep_method_searchable_idx ON public.node__c2m2_sample_prep_method USING gin (searchable);


--
-- Name: node__c2m2_subject_disease_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_disease_pagerank_idx ON public.node__c2m2_subject_disease USING btree (pagerank);


--
-- Name: node__c2m2_subject_disease_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_disease_pagerank_idx1 ON public.node__c2m2_subject_disease USING btree (pagerank);


--
-- Name: node__c2m2_subject_disease_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_disease_searchable_idx ON public.node__c2m2_subject_disease USING gin (searchable);


--
-- Name: node__c2m2_subject_in_collection_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_in_collection_pagerank_idx ON public.node__c2m2_subject_in_collection USING btree (pagerank);


--
-- Name: node__c2m2_subject_in_collection_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_in_collection_pagerank_idx1 ON public.node__c2m2_subject_in_collection USING btree (pagerank);


--
-- Name: node__c2m2_subject_in_collection_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_in_collection_searchable_idx ON public.node__c2m2_subject_in_collection USING gin (searchable);


--
-- Name: node__c2m2_subject_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_pagerank_idx ON public.node__c2m2_subject USING btree (pagerank);


--
-- Name: node__c2m2_subject_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_pagerank_idx1 ON public.node__c2m2_subject USING btree (pagerank);


--
-- Name: node__c2m2_subject_role_taxonomy_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_role_taxonomy_pagerank_idx ON public.node__c2m2_subject_role_taxonomy USING btree (pagerank);


--
-- Name: node__c2m2_subject_role_taxonomy_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_role_taxonomy_pagerank_idx1 ON public.node__c2m2_subject_role_taxonomy USING btree (pagerank);


--
-- Name: node__c2m2_subject_role_taxonomy_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_role_taxonomy_searchable_idx ON public.node__c2m2_subject_role_taxonomy USING gin (searchable);


--
-- Name: node__c2m2_subject_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_subject_searchable_idx ON public.node__c2m2_subject USING gin (searchable);


--
-- Name: node__c2m2_substance_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_substance_pagerank_idx ON public.node__c2m2_substance USING btree (pagerank);


--
-- Name: node__c2m2_substance_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_substance_pagerank_idx1 ON public.node__c2m2_substance USING btree (pagerank);


--
-- Name: node__c2m2_substance_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__c2m2_substance_searchable_idx ON public.node__c2m2_substance USING gin (searchable);


--
-- Name: node__dcc_asset_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__dcc_asset_pagerank_idx ON public.node__dcc_asset USING btree (pagerank);


--
-- Name: node__dcc_asset_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__dcc_asset_pagerank_idx1 ON public.node__dcc_asset USING btree (pagerank);


--
-- Name: node__dcc_asset_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__dcc_asset_searchable_idx ON public.node__dcc_asset USING gin (searchable);


--
-- Name: node__dcc_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__dcc_pagerank_idx ON public.node__dcc USING btree (pagerank);


--
-- Name: node__dcc_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__dcc_pagerank_idx1 ON public.node__dcc USING btree (pagerank);


--
-- Name: node__dcc_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__dcc_searchable_idx ON public.node__dcc USING gin (searchable);


--
-- Name: node__gene_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__gene_pagerank_idx ON public.node__gene USING btree (pagerank);


--
-- Name: node__gene_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__gene_pagerank_idx1 ON public.node__gene USING btree (pagerank);


--
-- Name: node__gene_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__gene_searchable_idx ON public.node__gene USING gin (searchable);


--
-- Name: node__gene_set_library_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__gene_set_library_pagerank_idx ON public.node__gene_set_library USING btree (pagerank);


--
-- Name: node__gene_set_library_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__gene_set_library_pagerank_idx1 ON public.node__gene_set_library USING btree (pagerank);


--
-- Name: node__gene_set_library_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__gene_set_library_searchable_idx ON public.node__gene_set_library USING gin (searchable);


--
-- Name: node__gene_set_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__gene_set_pagerank_idx ON public.node__gene_set USING btree (pagerank);


--
-- Name: node__gene_set_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__gene_set_pagerank_idx1 ON public.node__gene_set USING btree (pagerank);


--
-- Name: node__gene_set_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__gene_set_searchable_idx ON public.node__gene_set USING gin (searchable);


--
-- Name: node__kg_assertion_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_pagerank_idx ON public.node__kg_assertion USING btree (pagerank);


--
-- Name: node__kg_assertion_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_pagerank_idx1 ON public.node__kg_assertion USING btree (pagerank);


--
-- Name: node__kg_assertion_relation_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_relation_pagerank_idx ON public.node__kg_assertion_relation USING btree (pagerank);


--
-- Name: node__kg_assertion_relation_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_relation_pagerank_idx1 ON public.node__kg_assertion_relation USING btree (pagerank);


--
-- Name: node__kg_assertion_relation_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_relation_searchable_idx ON public.node__kg_assertion_relation USING gin (searchable);


--
-- Name: node__kg_assertion_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_searchable_idx ON public.node__kg_assertion USING gin (searchable);


--
-- Name: node__kg_assertion_source_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_source_pagerank_idx ON public.node__kg_assertion_source USING btree (pagerank);


--
-- Name: node__kg_assertion_source_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_source_pagerank_idx1 ON public.node__kg_assertion_source USING btree (pagerank);


--
-- Name: node__kg_assertion_source_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_source_searchable_idx ON public.node__kg_assertion_source USING gin (searchable);


--
-- Name: node__kg_assertion_target_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_target_pagerank_idx ON public.node__kg_assertion_target USING btree (pagerank);


--
-- Name: node__kg_assertion_target_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_target_pagerank_idx1 ON public.node__kg_assertion_target USING btree (pagerank);


--
-- Name: node__kg_assertion_target_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_assertion_target_searchable_idx ON public.node__kg_assertion_target USING gin (searchable);


--
-- Name: node__kg_relation_pagerank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_relation_pagerank_idx ON public.node__kg_relation USING btree (pagerank);


--
-- Name: node__kg_relation_pagerank_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_relation_pagerank_idx1 ON public.node__kg_relation USING btree (pagerank);


--
-- Name: node__kg_relation_searchable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node__kg_relation_searchable_idx ON public.node__kg_relation USING gin (searchable);


--
-- Name: relation_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation_predicate_idx ON ONLY public.relation USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__anatomy_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample__c2m2__anatomy_predicate_idx ON public.relation__c2m2__c2m2_biosample__c2m2__anatomy USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__id_namespac_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample__c2m2__id_namespac_predicate_idx ON public.relation__c2m2__c2m2_biosample__c2m2__id_namespace USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__project_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample__c2m2__project_predicate_idx ON public.relation__c2m2__c2m2_biosample__c2m2__project USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__sample_prep_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample__c2m2__sample_prep_predicate_idx ON public.relation__c2m2__c2m2_biosample__c2m2__sample_prep_method USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__bio_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample_disease__c2m2__bio_predicate_idx ON public.relation__c2m2__c2m2_biosample_disease__c2m2__biosample USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__dis_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample_disease__c2m2__dis_predicate_idx ON public.relation__c2m2__c2m2_biosample_disease__c2m2__disease USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m2_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample_from_subject__c2m2_predicate_idx ON public.relation__c2m2__c2m2_biosample_from_subject__c2m2__biosample USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m_predicate_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample_from_subject__c2m_predicate_idx1 ON public.relation__c2m2__c2m2_biosample_from_subject__c2m2__subject USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__biosam_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample_gene__c2m2__biosam_predicate_idx ON public.relation__c2m2__c2m2_biosample_gene__c2m2__biosample USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__gene_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample_gene__c2m2__gene_predicate_idx ON public.relation__c2m2__c2m2_biosample_gene__c2m2__gene USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2_predicate_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample_in_collection__c2_predicate_idx1 ON public.relation__c2m2__c2m2_biosample_in_collection__c2m2__biosample USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2m_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample_in_collection__c2m_predicate_idx ON public.relation__c2m2__c2m2_biosample_in_collection__c2m2__collection USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__b_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample_substance__c2m2__b_predicate_idx ON public.relation__c2m2__c2m2_biosample_substance__c2m2__biosample USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__s_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_biosample_substance__c2m2__s_predicate_idx ON public.relation__c2m2__c2m2_biosample_substance__c2m2__substance USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_collection__c2m2__id_namespa_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_collection__c2m2__id_namespa_predicate_idx ON public.relation__c2m2__c2m2_collection__c2m2__id_namespace USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__an_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_collection_anatomy__c2m2__an_predicate_idx ON public.relation__c2m2__c2m2_collection_anatomy__c2m2__anatomy USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__co_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_collection_anatomy__c2m2__co_predicate_idx ON public.relation__c2m2__c2m2_collection_anatomy__c2m2__collection USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_collection_defined_by_proje_predicate_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_collection_defined_by_proje_predicate_idx1 ON public.relation__c2m2__c2m2_collection_defined_by_project__c2m2__proje USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_collection_defined_by_projec_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_collection_defined_by_projec_predicate_idx ON public.relation__c2m2__c2m2_collection_defined_by_project__c2m2__colle USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__c_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_collection_taxonomy__c2m2__c_predicate_idx ON public.relation__c2m2__c2m2_collection_taxonomy__c2m2__collection USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__n_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_collection_taxonomy__c2m2__n_predicate_idx ON public.relation__c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxonomy USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_dcc__c2m2__project_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_dcc__c2m2__project_predicate_idx ON public.relation__c2m2__c2m2_dcc__c2m2__project USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file__c2m2__analysis_type_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file__c2m2__analysis_type_predicate_idx ON public.relation__c2m2__c2m2_file__c2m2__analysis_type USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file__c2m2__assay_type_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file__c2m2__assay_type_predicate_idx ON public.relation__c2m2__c2m2_file__c2m2__assay_type USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file__c2m2__data_type_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file__c2m2__data_type_predicate_idx ON public.relation__c2m2__c2m2_file__c2m2__data_type USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file__c2m2__file_format_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file__c2m2__file_format_predicate_idx ON public.relation__c2m2__c2m2_file__c2m2__file_format USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file__c2m2__id_namespace_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file__c2m2__id_namespace_predicate_idx ON public.relation__c2m2__c2m2_file__c2m2__id_namespace USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file__c2m2__project_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file__c2m2__project_predicate_idx ON public.relation__c2m2__c2m2_file__c2m2__project USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c2_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file_describes_biosample__c2_predicate_idx ON public.relation__c2m2__c2m2_file_describes_biosample__c2m2__file USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c_predicate_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file_describes_biosample__c_predicate_idx1 ON public.relation__c2m2__c2m2_file_describes_biosample__c2m2__biosample USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m2_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file_describes_subject__c2m2_predicate_idx ON public.relation__c2m2__c2m2_file_describes_subject__c2m2__subject USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m_predicate_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file_describes_subject__c2m_predicate_idx1 ON public.relation__c2m2__c2m2_file_describes_subject__c2m2__file USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__co_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file_in_collection__c2m2__co_predicate_idx ON public.relation__c2m2__c2m2_file_in_collection__c2m2__collection USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__fi_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_file_in_collection__c2m2__fi_predicate_idx ON public.relation__c2m2__c2m2_file_in_collection__c2m2__file USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy_predicate_idx ON public.relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_project__c2m2__id_namespace_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_project__c2m2__id_namespace_predicate_idx ON public.relation__c2m2__c2m2_project__c2m2__id_namespace USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_project_in_project__c2m2__pr_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_project_in_project__c2m2__pr_predicate_idx ON public.relation__c2m2__c2m2_project_in_project__c2m2__project USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_subject__c2m2__id_namespace_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_subject__c2m2__id_namespace_predicate_idx ON public.relation__c2m2__c2m2_subject__c2m2__id_namespace USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_subject__c2m2__project_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_subject__c2m2__project_predicate_idx ON public.relation__c2m2__c2m2_subject__c2m2__project USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__disea_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_subject_disease__c2m2__disea_predicate_idx ON public.relation__c2m2__c2m2_subject_disease__c2m2__disease USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__subje_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_subject_disease__c2m2__subje_predicate_idx ON public.relation__c2m2__c2m2_subject_disease__c2m2__subject USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2__predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_subject_in_collection__c2m2__predicate_idx ON public.relation__c2m2__c2m2_subject_in_collection__c2m2__collection USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2_predicate_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_subject_in_collection__c2m2_predicate_idx1 ON public.relation__c2m2__c2m2_subject_in_collection__c2m2__subject USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2__predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_subject_role_taxonomy__c2m2__predicate_idx ON public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_taxonomy USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2_predicate_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_subject_role_taxonomy__c2m2_predicate_idx1 ON public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2__subject USING btree (predicate);


--
-- Name: relation__c2m2__c2m2_substance__c2m2__compound_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__c2m2__c2m2_substance__c2m2__compound_predicate_idx ON public.relation__c2m2__c2m2_substance__c2m2__compound USING btree (predicate);


--
-- Name: relation__dcc_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__dcc_predicate_idx ON public.relation__dcc USING btree (predicate);


--
-- Name: relation__is_from_dcc_asset_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__is_from_dcc_asset_predicate_idx ON public.relation__is_from_dcc_asset USING btree (predicate);


--
-- Name: relation__is_in_gene_set_library_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__is_in_gene_set_library_predicate_idx ON public.relation__is_in_gene_set_library USING btree (predicate);


--
-- Name: relation__is_in_gene_set_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__is_in_gene_set_predicate_idx ON public.relation__is_in_gene_set USING btree (predicate);


--
-- Name: relation__kg_assertion_relation_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__kg_assertion_relation_predicate_idx ON public.relation__kg_assertion_relation USING btree (predicate);


--
-- Name: relation__kg_assertion_source_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__kg_assertion_source_predicate_idx ON public.relation__kg_assertion_source USING btree (predicate);


--
-- Name: relation__kg_assertion_target_predicate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relation__kg_assertion_target_predicate_idx ON public.relation__kg_assertion_target USING btree (predicate);


--
-- Name: node__4DN Dataset_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__4DN Dataset_pagerank_idx";


--
-- Name: node__4DN Dataset_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__4DN Dataset_pagerank_idx1";


--
-- Name: node__4DN Dataset_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__4DN Dataset_pkey";


--
-- Name: node__4DN Dataset_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__4DN Dataset_searchable_idx";


--
-- Name: node__4DN File_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__4DN File_pagerank_idx";


--
-- Name: node__4DN File_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__4DN File_pagerank_idx1";


--
-- Name: node__4DN File_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__4DN File_pkey";


--
-- Name: node__4DN File_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__4DN File_searchable_idx";


--
-- Name: node__4DN Loop_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__4DN Loop_pagerank_idx";


--
-- Name: node__4DN Loop_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__4DN Loop_pagerank_idx1";


--
-- Name: node__4DN Loop_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__4DN Loop_pkey";


--
-- Name: node__4DN Loop_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__4DN Loop_searchable_idx";


--
-- Name: node__4DN QVal Bin_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__4DN QVal Bin_pagerank_idx";


--
-- Name: node__4DN QVal Bin_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__4DN QVal Bin_pagerank_idx1";


--
-- Name: node__4DN QVal Bin_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__4DN QVal Bin_pkey";


--
-- Name: node__4DN QVal Bin_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__4DN QVal Bin_searchable_idx";


--
-- Name: node__Amino Acid_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Amino Acid_pagerank_idx";


--
-- Name: node__Amino Acid_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Amino Acid_pagerank_idx1";


--
-- Name: node__Amino Acid_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Amino Acid_pkey";


--
-- Name: node__Amino Acid_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Amino Acid_searchable_idx";


--
-- Name: node__Anatomy_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Anatomy_pagerank_idx";


--
-- Name: node__Anatomy_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Anatomy_pagerank_idx1";


--
-- Name: node__Anatomy_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Anatomy_pkey";


--
-- Name: node__Anatomy_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Anatomy_searchable_idx";


--
-- Name: node__Assay_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Assay_pagerank_idx";


--
-- Name: node__Assay_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Assay_pagerank_idx1";


--
-- Name: node__Assay_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Assay_pkey";


--
-- Name: node__Assay_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Assay_searchable_idx";


--
-- Name: node__Compound_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Compound_pagerank_idx";


--
-- Name: node__Compound_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Compound_pagerank_idx1";


--
-- Name: node__Compound_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Compound_pkey";


--
-- Name: node__Compound_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Compound_searchable_idx";


--
-- Name: node__Disease or Phenotype_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Disease or Phenotype_pagerank_idx";


--
-- Name: node__Disease or Phenotype_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Disease or Phenotype_pagerank_idx1";


--
-- Name: node__Disease or Phenotype_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Disease or Phenotype_pkey";


--
-- Name: node__Disease or Phenotype_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Disease or Phenotype_searchable_idx";


--
-- Name: node__GO_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__GO_pagerank_idx";


--
-- Name: node__GO_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__GO_pagerank_idx1";


--
-- Name: node__GO_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__GO_pkey";


--
-- Name: node__GO_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__GO_searchable_idx";


--
-- Name: node__GP ID2PRO_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__GP ID2PRO_pagerank_idx";


--
-- Name: node__GP ID2PRO_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__GP ID2PRO_pagerank_idx1";


--
-- Name: node__GP ID2PRO_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__GP ID2PRO_pkey";


--
-- Name: node__GP ID2PRO_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__GP ID2PRO_searchable_idx";


--
-- Name: node__GlyGen Glycosequence_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__GlyGen Glycosequence_pagerank_idx";


--
-- Name: node__GlyGen Glycosequence_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__GlyGen Glycosequence_pagerank_idx1";


--
-- Name: node__GlyGen Glycosequence_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__GlyGen Glycosequence_pkey";


--
-- Name: node__GlyGen Glycosequence_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__GlyGen Glycosequence_searchable_idx";


--
-- Name: node__GlyGen Location_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__GlyGen Location_pagerank_idx";


--
-- Name: node__GlyGen Location_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__GlyGen Location_pagerank_idx1";


--
-- Name: node__GlyGen Location_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__GlyGen Location_pkey";


--
-- Name: node__GlyGen Location_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__GlyGen Location_searchable_idx";


--
-- Name: node__GlyGen Residue_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__GlyGen Residue_pagerank_idx";


--
-- Name: node__GlyGen Residue_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__GlyGen Residue_pagerank_idx1";


--
-- Name: node__GlyGen Residue_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__GlyGen Residue_pkey";


--
-- Name: node__GlyGen Residue_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__GlyGen Residue_searchable_idx";


--
-- Name: node__GlyGen src_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__GlyGen src_pagerank_idx";


--
-- Name: node__GlyGen src_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__GlyGen src_pagerank_idx1";


--
-- Name: node__GlyGen src_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__GlyGen src_pkey";


--
-- Name: node__GlyGen src_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__GlyGen src_searchable_idx";


--
-- Name: node__Glycan Motif_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Glycan Motif_pagerank_idx";


--
-- Name: node__Glycan Motif_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Glycan Motif_pagerank_idx1";


--
-- Name: node__Glycan Motif_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Glycan Motif_pkey";


--
-- Name: node__Glycan Motif_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Glycan Motif_searchable_idx";


--
-- Name: node__Glycoprotein Citation_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Glycoprotein Citation_pagerank_idx";


--
-- Name: node__Glycoprotein Citation_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Glycoprotein Citation_pagerank_idx1";


--
-- Name: node__Glycoprotein Citation_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Glycoprotein Citation_pkey";


--
-- Name: node__Glycoprotein Citation_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Glycoprotein Citation_searchable_idx";


--
-- Name: node__Glycoprotein Evidence_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Glycoprotein Evidence_pagerank_idx";


--
-- Name: node__Glycoprotein Evidence_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Glycoprotein Evidence_pagerank_idx1";


--
-- Name: node__Glycoprotein Evidence_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Glycoprotein Evidence_pkey";


--
-- Name: node__Glycoprotein Evidence_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Glycoprotein Evidence_searchable_idx";


--
-- Name: node__Glycoprotein_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Glycoprotein_pagerank_idx";


--
-- Name: node__Glycoprotein_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Glycoprotein_pagerank_idx1";


--
-- Name: node__Glycoprotein_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Glycoprotein_pkey";


--
-- Name: node__Glycoprotein_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Glycoprotein_searchable_idx";


--
-- Name: node__Glycosylation Site_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Glycosylation Site_pagerank_idx";


--
-- Name: node__Glycosylation Site_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Glycosylation Site_pagerank_idx1";


--
-- Name: node__Glycosylation Site_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Glycosylation Site_pkey";


--
-- Name: node__Glycosylation Site_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Glycosylation Site_searchable_idx";


--
-- Name: node__Glycosylation_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Glycosylation_pagerank_idx";


--
-- Name: node__Glycosylation_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Glycosylation_pagerank_idx1";


--
-- Name: node__Glycosylation_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Glycosylation_pkey";


--
-- Name: node__Glycosylation_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Glycosylation_searchable_idx";


--
-- Name: node__Glycosyltransferase Reaction_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Glycosyltransferase Reaction_pagerank_idx";


--
-- Name: node__Glycosyltransferase Reaction_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Glycosyltransferase Reaction_pagerank_idx1";


--
-- Name: node__Glycosyltransferase Reaction_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Glycosyltransferase Reaction_pkey";


--
-- Name: node__Glycosyltransferase Reaction_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Glycosyltransferase Reaction_searchable_idx";


--
-- Name: node__Glytoucan_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Glytoucan_pagerank_idx";


--
-- Name: node__Glytoucan_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Glytoucan_pagerank_idx1";


--
-- Name: node__Glytoucan_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Glytoucan_pkey";


--
-- Name: node__Glytoucan_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Glytoucan_searchable_idx";


--
-- Name: node__HSCLO_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__HSCLO_pagerank_idx";


--
-- Name: node__HSCLO_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__HSCLO_pagerank_idx1";


--
-- Name: node__HSCLO_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__HSCLO_pkey";


--
-- Name: node__HSCLO_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__HSCLO_searchable_idx";


--
-- Name: node__ILX_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__ILX_pagerank_idx";


--
-- Name: node__ILX_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__ILX_pagerank_idx1";


--
-- Name: node__ILX_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__ILX_pkey";


--
-- Name: node__ILX_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__ILX_searchable_idx";


--
-- Name: node__Isoform_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Isoform_pagerank_idx";


--
-- Name: node__Isoform_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Isoform_pagerank_idx1";


--
-- Name: node__Isoform_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Isoform_pkey";


--
-- Name: node__Isoform_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Isoform_searchable_idx";


--
-- Name: node__KFCOHORT_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__KFCOHORT_pagerank_idx";


--
-- Name: node__KFCOHORT_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__KFCOHORT_pagerank_idx1";


--
-- Name: node__KFCOHORT_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__KFCOHORT_pkey";


--
-- Name: node__KFCOHORT_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__KFCOHORT_searchable_idx";


--
-- Name: node__KFGENEBIN_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__KFGENEBIN_pagerank_idx";


--
-- Name: node__KFGENEBIN_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__KFGENEBIN_pagerank_idx1";


--
-- Name: node__KFGENEBIN_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__KFGENEBIN_pkey";


--
-- Name: node__KFGENEBIN_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__KFGENEBIN_searchable_idx";


--
-- Name: node__KFPT_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__KFPT_pagerank_idx";


--
-- Name: node__KFPT_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__KFPT_pagerank_idx1";


--
-- Name: node__KFPT_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__KFPT_pkey";


--
-- Name: node__KFPT_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__KFPT_searchable_idx";


--
-- Name: node__MOTRPAC_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__MOTRPAC_pagerank_idx";


--
-- Name: node__MOTRPAC_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__MOTRPAC_pagerank_idx1";


--
-- Name: node__MOTRPAC_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__MOTRPAC_pkey";


--
-- Name: node__MOTRPAC_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__MOTRPAC_searchable_idx";


--
-- Name: node__Metabolite_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Metabolite_pagerank_idx";


--
-- Name: node__Metabolite_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Metabolite_pagerank_idx1";


--
-- Name: node__Metabolite_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Metabolite_pkey";


--
-- Name: node__Metabolite_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Metabolite_searchable_idx";


--
-- Name: node__NIFSTD_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__NIFSTD_pagerank_idx";


--
-- Name: node__NIFSTD_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__NIFSTD_pagerank_idx1";


--
-- Name: node__NIFSTD_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__NIFSTD_pkey";


--
-- Name: node__NIFSTD_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__NIFSTD_searchable_idx";


--
-- Name: node__PATO_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__PATO_pagerank_idx";


--
-- Name: node__PATO_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__PATO_pagerank_idx1";


--
-- Name: node__PATO_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__PATO_pkey";


--
-- Name: node__PATO_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__PATO_searchable_idx";


--
-- Name: node__Protein_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Protein_pagerank_idx";


--
-- Name: node__Protein_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Protein_pagerank_idx1";


--
-- Name: node__Protein_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Protein_pkey";


--
-- Name: node__Protein_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Protein_searchable_idx";


--
-- Name: node__SO_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__SO_pagerank_idx";


--
-- Name: node__SO_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__SO_pagerank_idx1";


--
-- Name: node__SO_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__SO_pkey";


--
-- Name: node__SO_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__SO_searchable_idx";


--
-- Name: node__Sex_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Sex_pagerank_idx";


--
-- Name: node__Sex_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Sex_pagerank_idx1";


--
-- Name: node__Sex_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Sex_pkey";


--
-- Name: node__Sex_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Sex_searchable_idx";


--
-- Name: node__Taxon_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public."node__Taxon_pagerank_idx";


--
-- Name: node__Taxon_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public."node__Taxon_pagerank_idx1";


--
-- Name: node__Taxon_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public."node__Taxon_pkey";


--
-- Name: node__Taxon_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public."node__Taxon_searchable_idx";


--
-- Name: node__c2m2_analysis_type_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_analysis_type_pagerank_idx;


--
-- Name: node__c2m2_analysis_type_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_analysis_type_pagerank_idx1;


--
-- Name: node__c2m2_analysis_type_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_analysis_type_pkey;


--
-- Name: node__c2m2_analysis_type_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_analysis_type_searchable_idx;


--
-- Name: node__c2m2_anatomy_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_anatomy_pagerank_idx;


--
-- Name: node__c2m2_anatomy_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_anatomy_pagerank_idx1;


--
-- Name: node__c2m2_anatomy_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_anatomy_pkey;


--
-- Name: node__c2m2_anatomy_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_anatomy_searchable_idx;


--
-- Name: node__c2m2_assay_type_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_assay_type_pagerank_idx;


--
-- Name: node__c2m2_assay_type_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_assay_type_pagerank_idx1;


--
-- Name: node__c2m2_assay_type_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_assay_type_pkey;


--
-- Name: node__c2m2_assay_type_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_assay_type_searchable_idx;


--
-- Name: node__c2m2_biosample_disease_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_biosample_disease_pagerank_idx;


--
-- Name: node__c2m2_biosample_disease_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_biosample_disease_pagerank_idx1;


--
-- Name: node__c2m2_biosample_disease_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_biosample_disease_pkey;


--
-- Name: node__c2m2_biosample_disease_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_biosample_disease_searchable_idx;


--
-- Name: node__c2m2_biosample_from_subject_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_biosample_from_subject_pagerank_idx;


--
-- Name: node__c2m2_biosample_from_subject_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_biosample_from_subject_pagerank_idx1;


--
-- Name: node__c2m2_biosample_from_subject_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_biosample_from_subject_pkey;


--
-- Name: node__c2m2_biosample_from_subject_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_biosample_from_subject_searchable_idx;


--
-- Name: node__c2m2_biosample_gene_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_biosample_gene_pagerank_idx;


--
-- Name: node__c2m2_biosample_gene_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_biosample_gene_pagerank_idx1;


--
-- Name: node__c2m2_biosample_gene_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_biosample_gene_pkey;


--
-- Name: node__c2m2_biosample_gene_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_biosample_gene_searchable_idx;


--
-- Name: node__c2m2_biosample_in_collection_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_biosample_in_collection_pagerank_idx;


--
-- Name: node__c2m2_biosample_in_collection_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_biosample_in_collection_pagerank_idx1;


--
-- Name: node__c2m2_biosample_in_collection_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_biosample_in_collection_pkey;


--
-- Name: node__c2m2_biosample_in_collection_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_biosample_in_collection_searchable_idx;


--
-- Name: node__c2m2_biosample_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_biosample_pagerank_idx;


--
-- Name: node__c2m2_biosample_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_biosample_pagerank_idx1;


--
-- Name: node__c2m2_biosample_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_biosample_pkey;


--
-- Name: node__c2m2_biosample_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_biosample_searchable_idx;


--
-- Name: node__c2m2_biosample_substance_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_biosample_substance_pagerank_idx;


--
-- Name: node__c2m2_biosample_substance_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_biosample_substance_pagerank_idx1;


--
-- Name: node__c2m2_biosample_substance_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_biosample_substance_pkey;


--
-- Name: node__c2m2_biosample_substance_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_biosample_substance_searchable_idx;


--
-- Name: node__c2m2_collection_anatomy_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_collection_anatomy_pagerank_idx;


--
-- Name: node__c2m2_collection_anatomy_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_collection_anatomy_pagerank_idx1;


--
-- Name: node__c2m2_collection_anatomy_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_collection_anatomy_pkey;


--
-- Name: node__c2m2_collection_anatomy_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_collection_anatomy_searchable_idx;


--
-- Name: node__c2m2_collection_defined_by_project_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_collection_defined_by_project_pagerank_idx;


--
-- Name: node__c2m2_collection_defined_by_project_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_collection_defined_by_project_pagerank_idx1;


--
-- Name: node__c2m2_collection_defined_by_project_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_collection_defined_by_project_pkey;


--
-- Name: node__c2m2_collection_defined_by_project_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_collection_defined_by_project_searchable_idx;


--
-- Name: node__c2m2_collection_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_collection_pagerank_idx;


--
-- Name: node__c2m2_collection_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_collection_pagerank_idx1;


--
-- Name: node__c2m2_collection_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_collection_pkey;


--
-- Name: node__c2m2_collection_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_collection_searchable_idx;


--
-- Name: node__c2m2_collection_taxonomy_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_collection_taxonomy_pagerank_idx;


--
-- Name: node__c2m2_collection_taxonomy_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_collection_taxonomy_pagerank_idx1;


--
-- Name: node__c2m2_collection_taxonomy_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_collection_taxonomy_pkey;


--
-- Name: node__c2m2_collection_taxonomy_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_collection_taxonomy_searchable_idx;


--
-- Name: node__c2m2_compound_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_compound_pagerank_idx;


--
-- Name: node__c2m2_compound_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_compound_pagerank_idx1;


--
-- Name: node__c2m2_compound_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_compound_pkey;


--
-- Name: node__c2m2_compound_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_compound_searchable_idx;


--
-- Name: node__c2m2_data_type_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_data_type_pagerank_idx;


--
-- Name: node__c2m2_data_type_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_data_type_pagerank_idx1;


--
-- Name: node__c2m2_data_type_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_data_type_pkey;


--
-- Name: node__c2m2_data_type_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_data_type_searchable_idx;


--
-- Name: node__c2m2_dcc_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_dcc_pagerank_idx;


--
-- Name: node__c2m2_dcc_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_dcc_pagerank_idx1;


--
-- Name: node__c2m2_dcc_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_dcc_pkey;


--
-- Name: node__c2m2_dcc_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_dcc_searchable_idx;


--
-- Name: node__c2m2_disease_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_disease_pagerank_idx;


--
-- Name: node__c2m2_disease_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_disease_pagerank_idx1;


--
-- Name: node__c2m2_disease_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_disease_pkey;


--
-- Name: node__c2m2_disease_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_disease_searchable_idx;


--
-- Name: node__c2m2_file_describes_biosample_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_file_describes_biosample_pagerank_idx;


--
-- Name: node__c2m2_file_describes_biosample_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_file_describes_biosample_pagerank_idx1;


--
-- Name: node__c2m2_file_describes_biosample_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_file_describes_biosample_pkey;


--
-- Name: node__c2m2_file_describes_biosample_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_file_describes_biosample_searchable_idx;


--
-- Name: node__c2m2_file_describes_subject_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_file_describes_subject_pagerank_idx;


--
-- Name: node__c2m2_file_describes_subject_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_file_describes_subject_pagerank_idx1;


--
-- Name: node__c2m2_file_describes_subject_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_file_describes_subject_pkey;


--
-- Name: node__c2m2_file_describes_subject_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_file_describes_subject_searchable_idx;


--
-- Name: node__c2m2_file_format_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_file_format_pagerank_idx;


--
-- Name: node__c2m2_file_format_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_file_format_pagerank_idx1;


--
-- Name: node__c2m2_file_format_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_file_format_pkey;


--
-- Name: node__c2m2_file_format_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_file_format_searchable_idx;


--
-- Name: node__c2m2_file_in_collection_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_file_in_collection_pagerank_idx;


--
-- Name: node__c2m2_file_in_collection_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_file_in_collection_pagerank_idx1;


--
-- Name: node__c2m2_file_in_collection_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_file_in_collection_pkey;


--
-- Name: node__c2m2_file_in_collection_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_file_in_collection_searchable_idx;


--
-- Name: node__c2m2_file_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_file_pagerank_idx;


--
-- Name: node__c2m2_file_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_file_pagerank_idx1;


--
-- Name: node__c2m2_file_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_file_pkey;


--
-- Name: node__c2m2_file_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_file_searchable_idx;


--
-- Name: node__c2m2_gene_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_gene_pagerank_idx;


--
-- Name: node__c2m2_gene_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_gene_pagerank_idx1;


--
-- Name: node__c2m2_gene_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_gene_pkey;


--
-- Name: node__c2m2_gene_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_gene_searchable_idx;


--
-- Name: node__c2m2_id_namespace_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_id_namespace_pagerank_idx;


--
-- Name: node__c2m2_id_namespace_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_id_namespace_pagerank_idx1;


--
-- Name: node__c2m2_id_namespace_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_id_namespace_pkey;


--
-- Name: node__c2m2_id_namespace_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_id_namespace_searchable_idx;


--
-- Name: node__c2m2_ncbi_taxonomy_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_ncbi_taxonomy_pagerank_idx;


--
-- Name: node__c2m2_ncbi_taxonomy_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_ncbi_taxonomy_pagerank_idx1;


--
-- Name: node__c2m2_ncbi_taxonomy_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_ncbi_taxonomy_pkey;


--
-- Name: node__c2m2_ncbi_taxonomy_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_ncbi_taxonomy_searchable_idx;


--
-- Name: node__c2m2_project_in_project_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_project_in_project_pagerank_idx;


--
-- Name: node__c2m2_project_in_project_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_project_in_project_pagerank_idx1;


--
-- Name: node__c2m2_project_in_project_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_project_in_project_pkey;


--
-- Name: node__c2m2_project_in_project_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_project_in_project_searchable_idx;


--
-- Name: node__c2m2_project_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_project_pagerank_idx;


--
-- Name: node__c2m2_project_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_project_pagerank_idx1;


--
-- Name: node__c2m2_project_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_project_pkey;


--
-- Name: node__c2m2_project_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_project_searchable_idx;


--
-- Name: node__c2m2_sample_prep_method_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_sample_prep_method_pagerank_idx;


--
-- Name: node__c2m2_sample_prep_method_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_sample_prep_method_pagerank_idx1;


--
-- Name: node__c2m2_sample_prep_method_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_sample_prep_method_pkey;


--
-- Name: node__c2m2_sample_prep_method_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_sample_prep_method_searchable_idx;


--
-- Name: node__c2m2_subject_disease_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_subject_disease_pagerank_idx;


--
-- Name: node__c2m2_subject_disease_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_subject_disease_pagerank_idx1;


--
-- Name: node__c2m2_subject_disease_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_subject_disease_pkey;


--
-- Name: node__c2m2_subject_disease_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_subject_disease_searchable_idx;


--
-- Name: node__c2m2_subject_in_collection_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_subject_in_collection_pagerank_idx;


--
-- Name: node__c2m2_subject_in_collection_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_subject_in_collection_pagerank_idx1;


--
-- Name: node__c2m2_subject_in_collection_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_subject_in_collection_pkey;


--
-- Name: node__c2m2_subject_in_collection_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_subject_in_collection_searchable_idx;


--
-- Name: node__c2m2_subject_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_subject_pagerank_idx;


--
-- Name: node__c2m2_subject_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_subject_pagerank_idx1;


--
-- Name: node__c2m2_subject_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_subject_pkey;


--
-- Name: node__c2m2_subject_role_taxonomy_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_subject_role_taxonomy_pagerank_idx;


--
-- Name: node__c2m2_subject_role_taxonomy_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_subject_role_taxonomy_pagerank_idx1;


--
-- Name: node__c2m2_subject_role_taxonomy_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_subject_role_taxonomy_pkey;


--
-- Name: node__c2m2_subject_role_taxonomy_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_subject_role_taxonomy_searchable_idx;


--
-- Name: node__c2m2_subject_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_subject_searchable_idx;


--
-- Name: node__c2m2_substance_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__c2m2_substance_pagerank_idx;


--
-- Name: node__c2m2_substance_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__c2m2_substance_pagerank_idx1;


--
-- Name: node__c2m2_substance_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__c2m2_substance_pkey;


--
-- Name: node__c2m2_substance_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__c2m2_substance_searchable_idx;


--
-- Name: node__dcc_asset_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__dcc_asset_pagerank_idx;


--
-- Name: node__dcc_asset_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__dcc_asset_pagerank_idx1;


--
-- Name: node__dcc_asset_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__dcc_asset_pkey;


--
-- Name: node__dcc_asset_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__dcc_asset_searchable_idx;


--
-- Name: node__dcc_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__dcc_pagerank_idx;


--
-- Name: node__dcc_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__dcc_pagerank_idx1;


--
-- Name: node__dcc_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__dcc_pkey;


--
-- Name: node__dcc_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__dcc_searchable_idx;


--
-- Name: node__gene_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__gene_pagerank_idx;


--
-- Name: node__gene_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__gene_pagerank_idx1;


--
-- Name: node__gene_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__gene_pkey;


--
-- Name: node__gene_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__gene_searchable_idx;


--
-- Name: node__gene_set_library_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__gene_set_library_pagerank_idx;


--
-- Name: node__gene_set_library_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__gene_set_library_pagerank_idx1;


--
-- Name: node__gene_set_library_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__gene_set_library_pkey;


--
-- Name: node__gene_set_library_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__gene_set_library_searchable_idx;


--
-- Name: node__gene_set_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__gene_set_pagerank_idx;


--
-- Name: node__gene_set_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__gene_set_pagerank_idx1;


--
-- Name: node__gene_set_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__gene_set_pkey;


--
-- Name: node__gene_set_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__gene_set_searchable_idx;


--
-- Name: node__kg_assertion_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__kg_assertion_pagerank_idx;


--
-- Name: node__kg_assertion_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__kg_assertion_pagerank_idx1;


--
-- Name: node__kg_assertion_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__kg_assertion_pkey;


--
-- Name: node__kg_assertion_relation_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__kg_assertion_relation_pagerank_idx;


--
-- Name: node__kg_assertion_relation_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__kg_assertion_relation_pagerank_idx1;


--
-- Name: node__kg_assertion_relation_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__kg_assertion_relation_pkey;


--
-- Name: node__kg_assertion_relation_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__kg_assertion_relation_searchable_idx;


--
-- Name: node__kg_assertion_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__kg_assertion_searchable_idx;


--
-- Name: node__kg_assertion_source_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__kg_assertion_source_pagerank_idx;


--
-- Name: node__kg_assertion_source_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__kg_assertion_source_pagerank_idx1;


--
-- Name: node__kg_assertion_source_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__kg_assertion_source_pkey;


--
-- Name: node__kg_assertion_source_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__kg_assertion_source_searchable_idx;


--
-- Name: node__kg_assertion_target_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__kg_assertion_target_pagerank_idx;


--
-- Name: node__kg_assertion_target_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__kg_assertion_target_pagerank_idx1;


--
-- Name: node__kg_assertion_target_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__kg_assertion_target_pkey;


--
-- Name: node__kg_assertion_target_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__kg_assertion_target_searchable_idx;


--
-- Name: node__kg_relation_pagerank_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx ATTACH PARTITION public.node__kg_relation_pagerank_idx;


--
-- Name: node__kg_relation_pagerank_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pagerank_idx1 ATTACH PARTITION public.node__kg_relation_pagerank_idx1;


--
-- Name: node__kg_relation_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_pkey ATTACH PARTITION public.node__kg_relation_pkey;


--
-- Name: node__kg_relation_searchable_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.node_searchable_idx ATTACH PARTITION public.node__kg_relation_searchable_idx;


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__anatomy_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__anatomy_pkey;


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__anatomy_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__anatomy_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__id_namespac_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__id_namespac_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__id_namespace_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__id_namespace_pkey;


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__project_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__project_pkey;


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__project_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__project_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__sample_prep_method_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__sample_prep_method_pkey;


--
-- Name: relation__c2m2__c2m2_biosample__c2m2__sample_prep_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample__c2m2__sample_prep_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__bio_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample_disease__c2m2__bio_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__biosample_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample_disease__c2m2__biosample_pkey;


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__dis_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample_disease__c2m2__dis_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample_disease__c2m2__disease_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample_disease__c2m2__disease_pkey;


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m2__biosamp_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample_from_subject__c2m2__biosamp_pkey;


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m2__subject_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample_from_subject__c2m2__subject_pkey;


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m2_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample_from_subject__c2m2_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample_from_subject__c2m_predicate_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample_from_subject__c2m_predicate_idx1;


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__biosam_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample_gene__c2m2__biosam_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__biosample_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample_gene__c2m2__biosample_pkey;


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__gene_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample_gene__c2m2__gene_pkey;


--
-- Name: relation__c2m2__c2m2_biosample_gene__c2m2__gene_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample_gene__c2m2__gene_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2_predicate_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample_in_collection__c2_predicate_idx1;


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2m2__biosam_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample_in_collection__c2m2__biosam_pkey;


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2m2__collec_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample_in_collection__c2m2__collec_pkey;


--
-- Name: relation__c2m2__c2m2_biosample_in_collection__c2m_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample_in_collection__c2m_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__b_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample_substance__c2m2__b_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__biosample_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample_substance__c2m2__biosample_pkey;


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__s_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_biosample_substance__c2m2__s_predicate_idx;


--
-- Name: relation__c2m2__c2m2_biosample_substance__c2m2__substance_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_biosample_substance__c2m2__substance_pkey;


--
-- Name: relation__c2m2__c2m2_collection__c2m2__id_namespa_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_collection__c2m2__id_namespa_predicate_idx;


--
-- Name: relation__c2m2__c2m2_collection__c2m2__id_namespace_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_collection__c2m2__id_namespace_pkey;


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__an_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_collection_anatomy__c2m2__an_predicate_idx;


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__anatomy_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_collection_anatomy__c2m2__anatomy_pkey;


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__co_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_collection_anatomy__c2m2__co_predicate_idx;


--
-- Name: relation__c2m2__c2m2_collection_anatomy__c2m2__collection_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_collection_anatomy__c2m2__collection_pkey;


--
-- Name: relation__c2m2__c2m2_collection_defined_by_proje_predicate_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_collection_defined_by_proje_predicate_idx1;


--
-- Name: relation__c2m2__c2m2_collection_defined_by_projec_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_collection_defined_by_projec_predicate_idx;


--
-- Name: relation__c2m2__c2m2_collection_defined_by_project__c2m2___pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_collection_defined_by_project__c2m2___pkey;


--
-- Name: relation__c2m2__c2m2_collection_defined_by_project__c2m2__pkey1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_collection_defined_by_project__c2m2__pkey1;


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__c_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_collection_taxonomy__c2m2__c_predicate_idx;


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__collection_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_collection_taxonomy__c2m2__collection_pkey;


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__n_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_collection_taxonomy__c2m2__n_predicate_idx;


--
-- Name: relation__c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxon_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_collection_taxonomy__c2m2__ncbi_taxon_pkey;


--
-- Name: relation__c2m2__c2m2_dcc__c2m2__project_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_dcc__c2m2__project_pkey;


--
-- Name: relation__c2m2__c2m2_dcc__c2m2__project_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_dcc__c2m2__project_predicate_idx;


--
-- Name: relation__c2m2__c2m2_file__c2m2__analysis_type_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__analysis_type_pkey;


--
-- Name: relation__c2m2__c2m2_file__c2m2__analysis_type_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__analysis_type_predicate_idx;


--
-- Name: relation__c2m2__c2m2_file__c2m2__assay_type_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__assay_type_pkey;


--
-- Name: relation__c2m2__c2m2_file__c2m2__assay_type_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__assay_type_predicate_idx;


--
-- Name: relation__c2m2__c2m2_file__c2m2__data_type_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__data_type_pkey;


--
-- Name: relation__c2m2__c2m2_file__c2m2__data_type_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__data_type_predicate_idx;


--
-- Name: relation__c2m2__c2m2_file__c2m2__file_format_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__file_format_pkey;


--
-- Name: relation__c2m2__c2m2_file__c2m2__file_format_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__file_format_predicate_idx;


--
-- Name: relation__c2m2__c2m2_file__c2m2__id_namespace_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__id_namespace_pkey;


--
-- Name: relation__c2m2__c2m2_file__c2m2__id_namespace_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__id_namespace_predicate_idx;


--
-- Name: relation__c2m2__c2m2_file__c2m2__project_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__project_pkey;


--
-- Name: relation__c2m2__c2m2_file__c2m2__project_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file__c2m2__project_predicate_idx;


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c2_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_biosample__c2_predicate_idx;


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c2m2__biosa_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_biosample__c2m2__biosa_pkey;


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c2m2__file_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_biosample__c2m2__file_pkey;


--
-- Name: relation__c2m2__c2m2_file_describes_biosample__c_predicate_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_biosample__c_predicate_idx1;


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m2__file_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_subject__c2m2__file_pkey;


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m2__subject_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_subject__c2m2__subject_pkey;


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m2_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_subject__c2m2_predicate_idx;


--
-- Name: relation__c2m2__c2m2_file_describes_subject__c2m_predicate_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file_describes_subject__c2m_predicate_idx1;


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__co_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file_in_collection__c2m2__co_predicate_idx;


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__collection_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file_in_collection__c2m2__collection_pkey;


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__fi_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_file_in_collection__c2m2__fi_predicate_idx;


--
-- Name: relation__c2m2__c2m2_file_in_collection__c2m2__file_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_file_in_collection__c2m2__file_pkey;


--
-- Name: relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy_pkey;


--
-- Name: relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_gene__c2m2__ncbi_taxonomy_predicate_idx;


--
-- Name: relation__c2m2__c2m2_project__c2m2__id_namespace_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_project__c2m2__id_namespace_pkey;


--
-- Name: relation__c2m2__c2m2_project__c2m2__id_namespace_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_project__c2m2__id_namespace_predicate_idx;


--
-- Name: relation__c2m2__c2m2_project_in_project__c2m2__pr_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_project_in_project__c2m2__pr_predicate_idx;


--
-- Name: relation__c2m2__c2m2_project_in_project__c2m2__project_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_project_in_project__c2m2__project_pkey;


--
-- Name: relation__c2m2__c2m2_subject__c2m2__id_namespace_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_subject__c2m2__id_namespace_pkey;


--
-- Name: relation__c2m2__c2m2_subject__c2m2__id_namespace_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_subject__c2m2__id_namespace_predicate_idx;


--
-- Name: relation__c2m2__c2m2_subject__c2m2__project_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_subject__c2m2__project_pkey;


--
-- Name: relation__c2m2__c2m2_subject__c2m2__project_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_subject__c2m2__project_predicate_idx;


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__disea_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_subject_disease__c2m2__disea_predicate_idx;


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__disease_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_subject_disease__c2m2__disease_pkey;


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__subje_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_subject_disease__c2m2__subje_predicate_idx;


--
-- Name: relation__c2m2__c2m2_subject_disease__c2m2__subject_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_subject_disease__c2m2__subject_pkey;


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2__collecti_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_subject_in_collection__c2m2__collecti_pkey;


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2__predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_subject_in_collection__c2m2__predicate_idx;


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2__subject_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_subject_in_collection__c2m2__subject_pkey;


--
-- Name: relation__c2m2__c2m2_subject_in_collection__c2m2_predicate_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_subject_in_collection__c2m2_predicate_idx1;


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_tax_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2__ncbi_tax_pkey;


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2__predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2__predicate_idx;


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2__subject_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2__subject_pkey;


--
-- Name: relation__c2m2__c2m2_subject_role_taxonomy__c2m2_predicate_idx1; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_subject_role_taxonomy__c2m2_predicate_idx1;


--
-- Name: relation__c2m2__c2m2_substance__c2m2__compound_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__c2m2__c2m2_substance__c2m2__compound_pkey;


--
-- Name: relation__c2m2__c2m2_substance__c2m2__compound_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__c2m2__c2m2_substance__c2m2__compound_predicate_idx;


--
-- Name: relation__dcc_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__dcc_pkey;


--
-- Name: relation__dcc_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__dcc_predicate_idx;


--
-- Name: relation__is_from_dcc_asset_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__is_from_dcc_asset_pkey;


--
-- Name: relation__is_from_dcc_asset_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__is_from_dcc_asset_predicate_idx;


--
-- Name: relation__is_in_gene_set_library_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__is_in_gene_set_library_pkey;


--
-- Name: relation__is_in_gene_set_library_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__is_in_gene_set_library_predicate_idx;


--
-- Name: relation__is_in_gene_set_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__is_in_gene_set_pkey;


--
-- Name: relation__is_in_gene_set_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__is_in_gene_set_predicate_idx;


--
-- Name: relation__kg_assertion_relation_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__kg_assertion_relation_pkey;


--
-- Name: relation__kg_assertion_relation_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__kg_assertion_relation_predicate_idx;


--
-- Name: relation__kg_assertion_source_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__kg_assertion_source_pkey;


--
-- Name: relation__kg_assertion_source_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__kg_assertion_source_predicate_idx;


--
-- Name: relation__kg_assertion_target_pkey; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_pkey ATTACH PARTITION public.relation__kg_assertion_target_pkey;


--
-- Name: relation__kg_assertion_target_predicate_idx; Type: INDEX ATTACH; Schema: public; Owner: -
--

ALTER INDEX public.relation_predicate_idx ATTACH PARTITION public.relation__kg_assertion_target_predicate_idx;


--
-- Name: postgraphile_watch_ddl; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER postgraphile_watch_ddl ON ddl_command_end
         WHEN TAG IN ('ALTER AGGREGATE', 'ALTER DOMAIN', 'ALTER EXTENSION', 'ALTER FOREIGN TABLE', 'ALTER FUNCTION', 'ALTER POLICY', 'ALTER SCHEMA', 'ALTER TABLE', 'ALTER TYPE', 'ALTER VIEW', 'COMMENT', 'CREATE AGGREGATE', 'CREATE DOMAIN', 'CREATE EXTENSION', 'CREATE FOREIGN TABLE', 'CREATE FUNCTION', 'CREATE INDEX', 'CREATE POLICY', 'CREATE RULE', 'CREATE SCHEMA', 'CREATE TABLE', 'CREATE TABLE AS', 'CREATE VIEW', 'DROP AGGREGATE', 'DROP DOMAIN', 'DROP EXTENSION', 'DROP FOREIGN TABLE', 'DROP FUNCTION', 'DROP INDEX', 'DROP OWNED', 'DROP POLICY', 'DROP RULE', 'DROP SCHEMA', 'DROP TABLE', 'DROP TYPE', 'DROP VIEW', 'GRANT', 'REVOKE', 'SELECT INTO')
   EXECUTE FUNCTION postgraphile_watch.notify_watchers_ddl();


--
-- Name: postgraphile_watch_drop; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER postgraphile_watch_drop ON sql_drop
   EXECUTE FUNCTION postgraphile_watch.notify_watchers_drop();


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20241203203122'),
    ('20241203205207');
