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
-- Name: _4dn; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA _4dn;


--
-- Name: api; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA api;


--
-- Name: c2m2; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA c2m2;


--
-- Name: ercc; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA ercc;


--
-- Name: glygen; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA glygen;


--
-- Name: graphile_worker; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphile_worker;


--
-- Name: gtex; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA gtex;


--
-- Name: hmp; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA hmp;


--
-- Name: hubmap; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA hubmap;


--
-- Name: idg; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA idg;


--
-- Name: keycloak; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA keycloak;


--
-- Name: kidsfirst; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA kidsfirst;


--
-- Name: lincs; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA lincs;


--
-- Name: metabolomics; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA metabolomics;


--
-- Name: motrpac; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA motrpac;


--
-- Name: pdp; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pdp;


--
-- Name: postgraphile_watch; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA postgraphile_watch;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: slim; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA slim;


--
-- Name: sparc; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA sparc;


--
-- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


--
-- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: job_spec; Type: TYPE; Schema: graphile_worker; Owner: -
--

CREATE TYPE graphile_worker.job_spec AS (
	identifier text,
	payload json,
	queue_name text,
	run_at timestamp with time zone,
	max_attempts smallint,
	job_key text,
	priority smallint,
	flags text[]
);


--
-- Name: NodeType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NodeType" AS ENUM (
    'entity',
    'gene_set',
    'gene_set_library',
    'c2m2_file',
    'kg_relation',
    'dcc_asset'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'DCC_APPROVER',
    'UPLOADER',
    'DRC_APPROVER',
    'ADMIN',
    'READONLY'
);


SET default_tablespace = '';

--
-- Name: entity; Type: TABLE; Schema: pdp; Owner: -
--

CREATE TABLE pdp.entity (
    type character varying NOT NULL,
    id uuid NOT NULL,
    attributes jsonb NOT NULL,
    pagerank double precision DEFAULT 0
)
PARTITION BY LIST (type);


--
-- Name: entity; Type: VIEW; Schema: api; Owner: -
--

CREATE VIEW api.entity AS
 SELECT type,
    id,
    attributes,
    pagerank
   FROM pdp.entity;


--
-- Name: entity_relationships(api.entity); Type: FUNCTION; Schema: api; Owner: -
--

CREATE FUNCTION api.entity_relationships(entity api.entity) RETURNS SETOF api.entity
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    AS $$
  select "target".*
  from "pdp"."relationship"
  inner join "pdp"."entity" "target" on ("target"."type", "target"."id") = ("relationship"."target_type", "relationship"."target_id")
  where (source_type, source_id) = (entity.type, entity.id);
$$;


--
-- Name: FUNCTION entity_relationships(entity api.entity); Type: COMMENT; Schema: api; Owner: -
--

COMMENT ON FUNCTION api.entity_relationships(entity api.entity) IS '@filterable';


--
-- Name: search_entity(character varying); Type: FUNCTION; Schema: api; Owner: -
--

CREATE FUNCTION api.search_entity(search character varying) RETURNS SETOF api.entity
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    AS $$
  select *
  from "pdp"."entity" "source"
  where jsonb_to_tsvector('english', "source"."attributes", '"all"') @@ websearch_to_tsquery('english', "search");
$$;


SET default_table_access_method = heap;

--
-- Name: _private_jobs; Type: TABLE; Schema: graphile_worker; Owner: -
--

CREATE TABLE graphile_worker._private_jobs (
    id bigint NOT NULL,
    job_queue_id integer,
    task_id integer NOT NULL,
    payload json DEFAULT '{}'::json NOT NULL,
    priority smallint DEFAULT 0 NOT NULL,
    run_at timestamp with time zone DEFAULT now() NOT NULL,
    attempts smallint DEFAULT 0 NOT NULL,
    max_attempts smallint DEFAULT 25 NOT NULL,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    key text,
    locked_at timestamp with time zone,
    locked_by text,
    revision integer DEFAULT 0 NOT NULL,
    flags jsonb,
    is_available boolean GENERATED ALWAYS AS (((locked_at IS NULL) AND (attempts < max_attempts))) STORED NOT NULL,
    CONSTRAINT jobs_key_check CHECK (((length(key) > 0) AND (length(key) <= 512))),
    CONSTRAINT jobs_max_attempts_check CHECK ((max_attempts >= 1))
);


--
-- Name: add_job(text, json, text, timestamp with time zone, integer, text, integer, text[], text); Type: FUNCTION; Schema: graphile_worker; Owner: -
--

CREATE FUNCTION graphile_worker.add_job(identifier text, payload json DEFAULT NULL::json, queue_name text DEFAULT NULL::text, run_at timestamp with time zone DEFAULT NULL::timestamp with time zone, max_attempts integer DEFAULT NULL::integer, job_key text DEFAULT NULL::text, priority integer DEFAULT NULL::integer, flags text[] DEFAULT NULL::text[], job_key_mode text DEFAULT 'replace'::text) RETURNS graphile_worker._private_jobs
    LANGUAGE plpgsql
    AS $$
declare
  v_job "graphile_worker"._private_jobs;
begin
  if (job_key is null or job_key_mode is null or job_key_mode in ('replace', 'preserve_run_at')) then
    select * into v_job
    from "graphile_worker".add_jobs(
      ARRAY[(
        identifier,
        payload,
        queue_name,
        run_at,
        max_attempts::smallint,
        job_key,
        priority::smallint,
        flags
      )::"graphile_worker".job_spec],
      (job_key_mode = 'preserve_run_at')
    )
    limit 1;
    return v_job;
  elsif job_key_mode = 'unsafe_dedupe' then
    -- Ensure all the tasks exist
    insert into "graphile_worker"._private_tasks as tasks (identifier)
    values (add_job.identifier)
    on conflict do nothing;
    -- Ensure all the queues exist
    if add_job.queue_name is not null then
      insert into "graphile_worker"._private_job_queues as job_queues (queue_name)
      values (add_job.queue_name)
      on conflict do nothing;
    end if;
    -- Insert job, but if one already exists then do nothing, even if the
    -- existing job has already started (and thus represents an out-of-date
    -- world state). This is dangerous because it means that whatever state
    -- change triggered this add_job may not be acted upon (since it happened
    -- after the existing job started executing, but no further job is being
    -- scheduled), but it is useful in very rare circumstances for
    -- de-duplication. If in doubt, DO NOT USE THIS.
    insert into "graphile_worker"._private_jobs as jobs (
      job_queue_id,
      task_id,
      payload,
      run_at,
      max_attempts,
      key,
      priority,
      flags
    )
      select
        job_queues.id,
        tasks.id,
        coalesce(add_job.payload, '{}'::json),
        coalesce(add_job.run_at, now()),
        coalesce(add_job.max_attempts::smallint, 25::smallint),
        add_job.job_key,
        coalesce(add_job.priority::smallint, 0::smallint),
        (
          select jsonb_object_agg(flag, true)
          from unnest(add_job.flags) as item(flag)
        )
      from "graphile_worker"._private_tasks as tasks
      left join "graphile_worker"._private_job_queues as job_queues
      on job_queues.queue_name = add_job.queue_name
      where tasks.identifier = add_job.identifier
    on conflict (key)
      -- Bump the updated_at so that there's something to return
      do update set
        revision = jobs.revision + 1,
        updated_at = now()
      returning *
      into v_job;
    if v_job.revision = 0 then
      perform pg_notify('jobs:insert', '{"r":' || random()::text || ',"count":1}');
    end if;
    return v_job;
  else
    raise exception 'Invalid job_key_mode value, expected ''replace'', ''preserve_run_at'' or ''unsafe_dedupe''.' using errcode = 'GWBKM';
  end if;
end;
$$;


--
-- Name: add_jobs(graphile_worker.job_spec[], boolean); Type: FUNCTION; Schema: graphile_worker; Owner: -
--

CREATE FUNCTION graphile_worker.add_jobs(specs graphile_worker.job_spec[], job_key_preserve_run_at boolean DEFAULT false) RETURNS SETOF graphile_worker._private_jobs
    LANGUAGE plpgsql
    AS $$
begin
  -- Ensure all the tasks exist
  insert into "graphile_worker"._private_tasks as tasks (identifier)
  select distinct spec.identifier
  from unnest(specs) spec
  on conflict do nothing;
  -- Ensure all the queues exist
  insert into "graphile_worker"._private_job_queues as job_queues (queue_name)
  select distinct spec.queue_name
  from unnest(specs) spec
  where spec.queue_name is not null
  on conflict do nothing;
  -- Ensure any locked jobs have their key cleared - in the case of locked
  -- existing job create a new job instead as it must have already started
  -- executing (i.e. it's world state is out of date, and the fact add_job
  -- has been called again implies there's new information that needs to be
  -- acted upon).
  update "graphile_worker"._private_jobs as jobs
  set
    key = null,
    attempts = jobs.max_attempts,
    updated_at = now()
  from unnest(specs) spec
  where spec.job_key is not null
  and jobs.key = spec.job_key
  and is_available is not true;

  -- WARNING: this count is not 100% accurate; 'on conflict' clause will cause it to be an overestimate
  perform pg_notify('jobs:insert', '{"r":' || random()::text || ',"count":' || array_length(specs, 1)::text || '}');

  -- TODO: is there a risk that a conflict could occur depending on the
  -- isolation level?
  return query insert into "graphile_worker"._private_jobs as jobs (
    job_queue_id,
    task_id,
    payload,
    run_at,
    max_attempts,
    key,
    priority,
    flags
  )
    select
      job_queues.id,
      tasks.id,
      coalesce(spec.payload, '{}'::json),
      coalesce(spec.run_at, now()),
      coalesce(spec.max_attempts, 25),
      spec.job_key,
      coalesce(spec.priority, 0),
      (
        select jsonb_object_agg(flag, true)
        from unnest(spec.flags) as item(flag)
      )
    from unnest(specs) spec
    inner join "graphile_worker"._private_tasks as tasks
    on tasks.identifier = spec.identifier
    left join "graphile_worker"._private_job_queues as job_queues
    on job_queues.queue_name = spec.queue_name
  on conflict (key) do update set
    job_queue_id = excluded.job_queue_id,
    task_id = excluded.task_id,
    payload =
      case
      when json_typeof(jobs.payload) = 'array' and json_typeof(excluded.payload) = 'array' then
        (jobs.payload::jsonb || excluded.payload::jsonb)::json
      else
        excluded.payload
      end,
    max_attempts = excluded.max_attempts,
    run_at = (case
      when job_key_preserve_run_at is true and jobs.attempts = 0 then jobs.run_at
      else excluded.run_at
    end),
    priority = excluded.priority,
    revision = jobs.revision + 1,
    flags = excluded.flags,
    -- always reset error/retry state
    attempts = 0,
    last_error = null,
    updated_at = now()
  where jobs.locked_at is null
  returning *;
end;
$$;


--
-- Name: complete_jobs(bigint[]); Type: FUNCTION; Schema: graphile_worker; Owner: -
--

CREATE FUNCTION graphile_worker.complete_jobs(job_ids bigint[]) RETURNS SETOF graphile_worker._private_jobs
    LANGUAGE sql
    AS $$
  delete from "graphile_worker"._private_jobs as jobs
    where id = any(job_ids)
    and (
      locked_at is null
    or
      locked_at < now() - interval '4 hours'
    )
    returning *;
$$;


--
-- Name: force_unlock_workers(text[]); Type: FUNCTION; Schema: graphile_worker; Owner: -
--

CREATE FUNCTION graphile_worker.force_unlock_workers(worker_ids text[]) RETURNS void
    LANGUAGE sql
    AS $$
update "graphile_worker"._private_jobs as jobs
set locked_at = null, locked_by = null
where locked_by = any(worker_ids);
update "graphile_worker"._private_job_queues as job_queues
set locked_at = null, locked_by = null
where locked_by = any(worker_ids);
$$;


--
-- Name: permanently_fail_jobs(bigint[], text); Type: FUNCTION; Schema: graphile_worker; Owner: -
--

CREATE FUNCTION graphile_worker.permanently_fail_jobs(job_ids bigint[], error_message text DEFAULT NULL::text) RETURNS SETOF graphile_worker._private_jobs
    LANGUAGE sql
    AS $$
  update "graphile_worker"._private_jobs as jobs
    set
      last_error = coalesce(error_message, 'Manually marked as failed'),
      attempts = max_attempts,
      updated_at = now()
    where id = any(job_ids)
    and (
      locked_at is null
    or
      locked_at < NOW() - interval '4 hours'
    )
    returning *;
$$;


--
-- Name: remove_job(text); Type: FUNCTION; Schema: graphile_worker; Owner: -
--

CREATE FUNCTION graphile_worker.remove_job(job_key text) RETURNS graphile_worker._private_jobs
    LANGUAGE plpgsql STRICT
    AS $$
declare
  v_job "graphile_worker"._private_jobs;
begin
  -- Delete job if not locked
  delete from "graphile_worker"._private_jobs as jobs
    where key = job_key
    and (
      locked_at is null
    or
      locked_at < NOW() - interval '4 hours'
    )
  returning * into v_job;
  if not (v_job is null) then
    perform pg_notify('jobs:insert', '{"r":' || random()::text || ',"count":-1}');
    return v_job;
  end if;
  -- Otherwise prevent job from retrying, and clear the key
  update "graphile_worker"._private_jobs as jobs
  set
    key = null,
    attempts = jobs.max_attempts,
    updated_at = now()
  where key = job_key
  returning * into v_job;
  return v_job;
end;
$$;


--
-- Name: reschedule_jobs(bigint[], timestamp with time zone, integer, integer, integer); Type: FUNCTION; Schema: graphile_worker; Owner: -
--

CREATE FUNCTION graphile_worker.reschedule_jobs(job_ids bigint[], run_at timestamp with time zone DEFAULT NULL::timestamp with time zone, priority integer DEFAULT NULL::integer, attempts integer DEFAULT NULL::integer, max_attempts integer DEFAULT NULL::integer) RETURNS SETOF graphile_worker._private_jobs
    LANGUAGE sql
    AS $$
  update "graphile_worker"._private_jobs as jobs
    set
      run_at = coalesce(reschedule_jobs.run_at, jobs.run_at),
      priority = coalesce(reschedule_jobs.priority::smallint, jobs.priority),
      attempts = coalesce(reschedule_jobs.attempts::smallint, jobs.attempts),
      max_attempts = coalesce(reschedule_jobs.max_attempts::smallint, jobs.max_attempts),
      updated_at = now()
    where id = any(job_ids)
    and (
      locked_at is null
    or
      locked_at < NOW() - interval '4 hours'
    )
    returning *;
$$;


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


--
-- Name: create_xidentity_fulltext_index(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_xidentity_fulltext_index() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.searchable := NEW."label" || ' ' || NEW."description";
  return NEW;
END;
$$;


--
-- Name: analysis_type; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: _4dn; Owner: -
--

CREATE TABLE _4dn.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: relationship; Type: TABLE; Schema: pdp; Owner: -
--

CREATE TABLE pdp.relationship (
    source_type character varying NOT NULL,
    source_id uuid NOT NULL,
    predicate character varying NOT NULL,
    target_type character varying NOT NULL,
    target_id uuid NOT NULL
)
PARTITION BY LIST (predicate);


--
-- Name: relationship; Type: VIEW; Schema: api; Owner: -
--

CREATE VIEW api.relationship AS
 SELECT source_type,
    source_id,
    predicate,
    target_type,
    target_id
   FROM pdp.relationship;


--
-- Name: analysis_type; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: disease_association_type; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.disease_association_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL
);


--
-- Name: ffl_biosample; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.ffl_biosample (
    searchable tsvector,
    biosample_id_namespace character varying,
    biosample_local_id character varying,
    project_id_namespace character varying,
    project_local_id character varying,
    biosample_persistent_id character varying,
    biosample_creation_time character varying,
    sample_prep_method character varying,
    anatomy character varying,
    disease_association_type character varying,
    disease character varying,
    subject_id_namespace character varying,
    subject_local_id character varying,
    biosample_age_at_sampling character varying,
    gene character varying,
    collection_id_namespace character varying,
    collection_local_id character varying,
    substance character varying,
    dcc_name character varying,
    dcc_abbreviation character varying,
    anatomy_name character varying,
    gene_name character varying,
    protein character varying,
    protein_name character varying,
    disease_name character varying,
    subject_granularity character varying,
    subject_sex character varying,
    subject_ethnicity character varying,
    subject_age_at_enrollment character varying,
    substance_name character varying,
    substance_compound character varying,
    compound_name character varying,
    project_persistent_id character varying,
    project_creation_time character varying,
    project_name character varying,
    project_abbreviation character varying,
    data_type_id character varying,
    data_type_name character varying,
    assay_type_id character varying,
    assay_type_name character varying,
    subject_role_taxonomy_taxonomy_id character varying,
    ncbi_taxonomy_name character varying,
    collection_persistent_id character varying,
    collection_creation_time character varying,
    collection_name character varying,
    collection_abbreviation character varying,
    collection_has_time_series_data character varying,
    sample_prep_method_name character varying,
    subject_race character varying,
    subject_race_name character varying,
    subject_granularity_name character varying,
    subject_sex_name character varying,
    subject_ethnicity_name character varying,
    subject_role_taxonomy_role_id character varying,
    subject_role_name character varying,
    disease_association_type_name character varying,
    phenotype_association_type character varying,
    phenotype character varying,
    phenotype_association_type_name character varying,
    phenotype_name character varying
);


--
-- Name: ffl_biosample_cmp; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.ffl_biosample_cmp (
    searchable tsvector,
    project_id_namespace character varying,
    project_local_id character varying,
    sample_prep_method character varying,
    anatomy character varying,
    disease_association_type character varying,
    disease character varying,
    subject_id_namespace character varying,
    subject_local_id character varying,
    biosample_age_at_sampling character varying,
    gene character varying,
    collection_id_namespace character varying,
    collection_local_id character varying,
    substance character varying,
    dcc_name character varying,
    dcc_abbreviation character varying,
    anatomy_name character varying,
    gene_name character varying,
    protein character varying,
    protein_name character varying,
    disease_name character varying,
    subject_granularity character varying,
    subject_sex character varying,
    subject_ethnicity character varying,
    subject_age_at_enrollment character varying,
    substance_name character varying,
    substance_compound character varying,
    compound_name character varying,
    project_persistent_id character varying,
    project_creation_time character varying,
    project_name character varying,
    project_abbreviation character varying,
    data_type_id character varying,
    data_type_name character varying,
    assay_type_id character varying,
    assay_type_name character varying,
    subject_role_taxonomy_taxonomy_id character varying,
    ncbi_taxonomy_name character varying,
    collection_persistent_id character varying,
    collection_creation_time character varying,
    collection_name character varying,
    collection_abbreviation character varying,
    collection_has_time_series_data character varying,
    sample_prep_method_name character varying,
    subject_race character varying,
    subject_race_name character varying,
    subject_granularity_name character varying,
    subject_sex_name character varying,
    subject_ethnicity_name character varying,
    subject_role_taxonomy_role_id character varying,
    subject_role_name character varying,
    disease_association_type_name character varying,
    phenotype_association_type character varying,
    phenotype character varying,
    phenotype_association_type_name character varying,
    phenotype_name character varying,
    bios_array character varying[]
);


--
-- Name: ffl_biosample_collection; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.ffl_biosample_collection (
    searchable tsvector,
    biosample_id_namespace character varying,
    biosample_local_id character varying,
    project_id_namespace character varying,
    project_local_id character varying,
    biosample_persistent_id character varying,
    biosample_creation_time character varying,
    sample_prep_method character varying,
    anatomy character varying,
    disease_association_type character varying,
    disease character varying,
    subject_id_namespace character varying,
    subject_local_id character varying,
    biosample_age_at_sampling character varying,
    gene character varying,
    collection_id_namespace character varying,
    collection_local_id character varying,
    substance character varying,
    dcc_name character varying,
    dcc_abbreviation character varying,
    anatomy_name character varying,
    gene_name character varying,
    protein character varying,
    protein_name character varying,
    disease_name character varying,
    subject_granularity character varying,
    subject_sex character varying,
    subject_ethnicity character varying,
    subject_age_at_enrollment character varying,
    substance_name character varying,
    substance_compound character varying,
    compound_name character varying,
    project_persistent_id character varying,
    project_creation_time character varying,
    project_name character varying,
    project_abbreviation character varying,
    data_type_id character varying,
    data_type_name character varying,
    assay_type_id character varying,
    assay_type_name character varying,
    subject_role_taxonomy_taxonomy_id character varying,
    ncbi_taxonomy_name character varying,
    collection_persistent_id character varying,
    collection_creation_time character varying,
    collection_name character varying,
    collection_abbreviation character varying,
    collection_has_time_series_data character varying,
    sample_prep_method_name character varying,
    subject_race character varying,
    subject_race_name character varying,
    subject_granularity_name character varying,
    subject_sex_name character varying,
    subject_ethnicity_name character varying,
    subject_role_taxonomy_role_id character varying,
    subject_role_name character varying,
    disease_association_type_name character varying,
    phenotype_association_type character varying,
    phenotype character varying,
    phenotype_association_type_name character varying,
    phenotype_name character varying,
    pk_id integer NOT NULL
);


--
-- Name: ffl_biosample_collection_cmp; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.ffl_biosample_collection_cmp (
    searchable tsvector,
    project_id_namespace character varying,
    project_local_id character varying,
    sample_prep_method character varying,
    anatomy character varying,
    disease_association_type character varying,
    disease character varying,
    subject_id_namespace character varying,
    subject_local_id character varying,
    biosample_age_at_sampling character varying,
    gene character varying,
    collection_id_namespace character varying,
    collection_local_id character varying,
    substance character varying,
    dcc_name character varying,
    dcc_abbreviation character varying,
    anatomy_name character varying,
    gene_name character varying,
    protein character varying,
    protein_name character varying,
    disease_name character varying,
    subject_granularity character varying,
    subject_sex character varying,
    subject_ethnicity character varying,
    subject_age_at_enrollment character varying,
    substance_name character varying,
    substance_compound character varying,
    compound_name character varying,
    project_persistent_id character varying,
    project_creation_time character varying,
    project_name character varying,
    project_abbreviation character varying,
    data_type_id character varying,
    data_type_name character varying,
    assay_type_id character varying,
    assay_type_name character varying,
    subject_role_taxonomy_taxonomy_id character varying,
    ncbi_taxonomy_name character varying,
    collection_persistent_id character varying,
    collection_creation_time character varying,
    collection_name character varying,
    collection_abbreviation character varying,
    collection_has_time_series_data character varying,
    sample_prep_method_name character varying,
    subject_race character varying,
    subject_race_name character varying,
    subject_granularity_name character varying,
    subject_sex_name character varying,
    subject_ethnicity_name character varying,
    subject_role_taxonomy_role_id character varying,
    subject_role_name character varying,
    disease_association_type_name character varying,
    phenotype_association_type character varying,
    phenotype character varying,
    phenotype_association_type_name character varying,
    phenotype_name character varying,
    bios_array character varying[],
    pk_id integer NOT NULL
);


--
-- Name: ffl_biosample_collection_cmp_pk_id_seq; Type: SEQUENCE; Schema: c2m2; Owner: -
--

CREATE SEQUENCE c2m2.ffl_biosample_collection_cmp_pk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ffl_biosample_collection_cmp_pk_id_seq; Type: SEQUENCE OWNED BY; Schema: c2m2; Owner: -
--

ALTER SEQUENCE c2m2.ffl_biosample_collection_cmp_pk_id_seq OWNED BY c2m2.ffl_biosample_collection_cmp.pk_id;


--
-- Name: ffl_biosample_collection_pk_id_seq; Type: SEQUENCE; Schema: c2m2; Owner: -
--

CREATE SEQUENCE c2m2.ffl_biosample_collection_pk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ffl_biosample_collection_pk_id_seq; Type: SEQUENCE OWNED BY; Schema: c2m2; Owner: -
--

ALTER SEQUENCE c2m2.ffl_biosample_collection_pk_id_seq OWNED BY c2m2.ffl_biosample_collection.pk_id;


--
-- Name: ffl_collection; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.ffl_collection (
    searchable tsvector,
    biosample_id_namespace text,
    biosample_local_id text,
    project_id_namespace character varying,
    project_local_id character varying,
    biosample_persistent_id text,
    biosample_creation_time text,
    sample_prep_method text,
    anatomy character varying,
    disease_association_type text,
    disease character varying,
    subject_id_namespace text,
    subject_local_id text,
    biosample_age_at_sampling text,
    gene character varying,
    collection_id_namespace character varying,
    collection_local_id character varying,
    substance character varying,
    dcc_name character varying,
    dcc_abbreviation character varying,
    anatomy_name character varying,
    gene_name character varying,
    protein character varying,
    protein_name character varying,
    disease_name character varying,
    subject_granularity text,
    subject_sex text,
    subject_ethnicity text,
    subject_age_at_enrollment text,
    substance_name character varying,
    substance_compound character varying,
    compound_name character varying,
    project_persistent_id character varying,
    project_creation_time character varying,
    project_name character varying,
    project_abbreviation character varying,
    data_type_id character varying,
    data_type_name character varying,
    assay_type_id character varying,
    assay_type_name character varying,
    subject_role_taxonomy_taxonomy_id character varying,
    ncbi_taxonomy_name character varying,
    collection_persistent_id character varying,
    collection_creation_time character varying,
    collection_name character varying,
    collection_abbreviation character varying,
    collection_has_time_series_data character varying,
    sample_prep_method_name text,
    subject_race text,
    subject_race_name text,
    subject_granularity_name text,
    subject_sex_name text,
    subject_ethnicity_name text,
    subject_role_taxonomy_role_id text,
    subject_role_name text,
    disease_association_type_name text,
    phenotype_association_type text,
    phenotype character varying,
    phenotype_association_type_name text,
    phenotype_name character varying
);


--
-- Name: ffl_collection_cmp; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.ffl_collection_cmp (
    searchable tsvector,
    project_id_namespace character varying,
    project_local_id character varying,
    sample_prep_method text,
    anatomy character varying,
    disease_association_type text,
    disease character varying,
    subject_id_namespace text,
    subject_local_id text,
    biosample_age_at_sampling text,
    gene character varying,
    collection_id_namespace character varying,
    collection_local_id character varying,
    substance character varying,
    dcc_name character varying,
    dcc_abbreviation character varying,
    anatomy_name character varying,
    gene_name character varying,
    protein character varying,
    protein_name character varying,
    disease_name character varying,
    subject_granularity text,
    subject_sex text,
    subject_ethnicity text,
    subject_age_at_enrollment text,
    substance_name character varying,
    substance_compound character varying,
    compound_name character varying,
    project_persistent_id character varying,
    project_creation_time character varying,
    project_name character varying,
    project_abbreviation character varying,
    data_type_id character varying,
    data_type_name character varying,
    assay_type_id character varying,
    assay_type_name character varying,
    subject_role_taxonomy_taxonomy_id character varying,
    ncbi_taxonomy_name character varying,
    collection_persistent_id character varying,
    collection_creation_time character varying,
    collection_name character varying,
    collection_abbreviation character varying,
    collection_has_time_series_data character varying,
    sample_prep_method_name text,
    subject_race text,
    subject_race_name text,
    subject_granularity_name text,
    subject_sex_name text,
    subject_ethnicity_name text,
    subject_role_taxonomy_role_id text,
    subject_role_name text,
    disease_association_type_name text,
    phenotype_association_type text,
    phenotype character varying,
    phenotype_association_type_name text,
    phenotype_name character varying,
    bios_array character varying[]
);


--
-- Name: file; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying,
    access_url character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_in_collection; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.file_describes_in_collection (
    file_id_namespace character varying,
    file_local_id character varying,
    collection_id_namespace character varying,
    collection_local_id character varying,
    pk_id integer NOT NULL
);


--
-- Name: file_describes_in_collection_pk_id_seq; Type: SEQUENCE; Schema: c2m2; Owner: -
--

CREATE SEQUENCE c2m2.file_describes_in_collection_pk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: file_describes_in_collection_pk_id_seq; Type: SEQUENCE OWNED BY; Schema: c2m2; Owner: -
--

ALTER SEQUENCE c2m2.file_describes_in_collection_pk_id_seq OWNED BY c2m2.file_describes_in_collection.pk_id;


--
-- Name: file_describes_subject; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: id_namespace_dcc_id; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.id_namespace_dcc_id (
    id_namespace_id character varying NOT NULL,
    dcc_id character varying NOT NULL
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_association_type; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.phenotype_association_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_data_type; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.project_data_type (
    project_id_namespace character varying,
    project_local_id character varying,
    data_type_id character varying,
    data_type_name character varying,
    data_type_description character varying,
    assay_type_id character varying,
    assay_type_name character varying,
    assay_type_description character varying,
    pk_id integer NOT NULL
);


--
-- Name: project_data_type_pk_id_seq; Type: SEQUENCE; Schema: c2m2; Owner: -
--

CREATE SEQUENCE c2m2.project_data_type_pk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_data_type_pk_id_seq; Type: SEQUENCE OWNED BY; Schema: c2m2; Owner: -
--

ALTER SEQUENCE c2m2.project_data_type_pk_id_seq OWNED BY c2m2.project_data_type.pk_id;


--
-- Name: project_in_project; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_ethnicity; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject_ethnicity (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL
);


--
-- Name: subject_granularity; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject_granularity (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_race_cv; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject_race_cv (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL
);


--
-- Name: subject_role; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject_role (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_sex; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject_sex (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: c2m2; Owner: -
--

CREATE TABLE c2m2.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: analysis_type; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: ercc; Owner: -
--

CREATE TABLE ercc.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: analysis_type; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: glygen; Owner: -
--

CREATE TABLE glygen.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: _private_job_queues; Type: TABLE; Schema: graphile_worker; Owner: -
--

CREATE TABLE graphile_worker._private_job_queues (
    id integer NOT NULL,
    queue_name text NOT NULL,
    locked_at timestamp with time zone,
    locked_by text,
    is_available boolean GENERATED ALWAYS AS ((locked_at IS NULL)) STORED NOT NULL,
    CONSTRAINT job_queues_queue_name_check CHECK ((length(queue_name) <= 128))
);


--
-- Name: _private_known_crontabs; Type: TABLE; Schema: graphile_worker; Owner: -
--

CREATE TABLE graphile_worker._private_known_crontabs (
    identifier text NOT NULL,
    known_since timestamp with time zone NOT NULL,
    last_execution timestamp with time zone
);


--
-- Name: _private_tasks; Type: TABLE; Schema: graphile_worker; Owner: -
--

CREATE TABLE graphile_worker._private_tasks (
    id integer NOT NULL,
    identifier text NOT NULL,
    CONSTRAINT tasks_identifier_check CHECK ((length(identifier) <= 128))
);


--
-- Name: job_queues_id_seq; Type: SEQUENCE; Schema: graphile_worker; Owner: -
--

ALTER TABLE graphile_worker._private_job_queues ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME graphile_worker.job_queues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: jobs; Type: VIEW; Schema: graphile_worker; Owner: -
--

CREATE VIEW graphile_worker.jobs AS
 SELECT jobs.id,
    job_queues.queue_name,
    tasks.identifier AS task_identifier,
    jobs.priority,
    jobs.run_at,
    jobs.attempts,
    jobs.max_attempts,
    jobs.last_error,
    jobs.created_at,
    jobs.updated_at,
    jobs.key,
    jobs.locked_at,
    jobs.locked_by,
    jobs.revision,
    jobs.flags
   FROM ((graphile_worker._private_jobs jobs
     JOIN graphile_worker._private_tasks tasks ON ((tasks.id = jobs.task_id)))
     LEFT JOIN graphile_worker._private_job_queues job_queues ON ((job_queues.id = jobs.job_queue_id)));


--
-- Name: jobs_id_seq1; Type: SEQUENCE; Schema: graphile_worker; Owner: -
--

ALTER TABLE graphile_worker._private_jobs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME graphile_worker.jobs_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: migrations; Type: TABLE; Schema: graphile_worker; Owner: -
--

CREATE TABLE graphile_worker.migrations (
    id integer NOT NULL,
    ts timestamp with time zone DEFAULT now() NOT NULL,
    breaking boolean DEFAULT false NOT NULL
);


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: graphile_worker; Owner: -
--

ALTER TABLE graphile_worker._private_tasks ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME graphile_worker.tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: analysis_type; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: gtex; Owner: -
--

CREATE TABLE gtex.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: analysis_type; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: hmp; Owner: -
--

CREATE TABLE hmp.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: analysis_type; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: hubmap; Owner: -
--

CREATE TABLE hubmap.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: analysis_type; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: idg; Owner: -
--

CREATE TABLE idg.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: analysis_type; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: kidsfirst; Owner: -
--

CREATE TABLE kidsfirst.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: analysis_type; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: lincs; Owner: -
--

CREATE TABLE lincs.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: analysis_type; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: metabolomics; Owner: -
--

CREATE TABLE metabolomics.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: analysis_type; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: motrpac; Owner: -
--

CREATE TABLE motrpac.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    dcc text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL
);


--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: _DCCToUser; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_DCCToUser" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _GeneEntityToGeneSetLibraryNode; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_GeneEntityToGeneSetLibraryNode" (
    "A" uuid NOT NULL,
    "B" uuid NOT NULL
);


--
-- Name: _GeneEntityToGeneSetNode; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_GeneEntityToGeneSetNode" (
    "A" uuid NOT NULL,
    "B" uuid NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: c2m2_datapackage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c2m2_datapackage (
    id uuid NOT NULL,
    dcc_asset_link text NOT NULL
);


--
-- Name: c2m2_file_node; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c2m2_file_node (
    id uuid NOT NULL,
    c2m2_datapackage_id uuid NOT NULL,
    creation_time timestamp with time zone,
    persistent_id text,
    size_in_bytes bigint,
    file_format text,
    data_type text,
    assay_type text,
    access_url text,
    md5 text,
    mime_type text,
    sha256 text
);


--
-- Name: center_outreach; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.center_outreach (
    outreach_id text NOT NULL,
    center_id text NOT NULL
);


--
-- Name: center_publications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.center_publications (
    publication_id text NOT NULL,
    center_id text NOT NULL
);


--
-- Name: centers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.centers (
    id text NOT NULL,
    label text NOT NULL,
    short_label text,
    short_description text,
    description text,
    homepage text,
    icon text,
    grant_num text,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: code_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.code_assets (
    type text NOT NULL,
    name text NOT NULL,
    link text NOT NULL,
    description text,
    "openAPISpec" boolean,
    "smartAPISpec" boolean,
    "smartAPIURL" text,
    "entityPageExample" text
);


--
-- Name: dcc_asset_node; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dcc_asset_node (
    id uuid NOT NULL,
    link text NOT NULL
);


--
-- Name: dcc_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dcc_assets (
    link text NOT NULL,
    lastmodified timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    current boolean DEFAULT true NOT NULL,
    creator text,
    dcc_id text NOT NULL,
    drcapproved boolean DEFAULT false NOT NULL,
    dccapproved boolean DEFAULT false NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    created timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: dcc_outreach; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dcc_outreach (
    outreach_id text NOT NULL,
    dcc_id text NOT NULL
);


--
-- Name: dcc_partnerships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dcc_partnerships (
    partnership_id text NOT NULL,
    dcc_id text NOT NULL,
    lead boolean DEFAULT false
);


--
-- Name: dcc_publications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dcc_publications (
    dcc_id text NOT NULL,
    publication_id text NOT NULL
);


--
-- Name: dcc_usecase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dcc_usecase (
    usecase_id text NOT NULL,
    dcc_id text NOT NULL
);


--
-- Name: dccs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dccs (
    id text NOT NULL,
    label text NOT NULL,
    description text,
    homepage text NOT NULL,
    icon text,
    annotation jsonb,
    short_label text,
    cfde_partner boolean DEFAULT false NOT NULL,
    cf_site text,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: entity_node; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_node (
    id uuid NOT NULL,
    type text NOT NULL
);


--
-- Name: fair_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fair_assessments (
    id text NOT NULL,
    dcc_id text NOT NULL,
    type text NOT NULL,
    link text NOT NULL,
    rubric jsonb NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: file_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.file_assets (
    filetype text NOT NULL,
    filename text NOT NULL,
    link text NOT NULL,
    size bigint,
    sha256checksum text
);


--
-- Name: gene_entity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gene_entity (
    id uuid NOT NULL,
    entrez text NOT NULL,
    ensembl text NOT NULL
);


--
-- Name: gene_set_library_node; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gene_set_library_node (
    id uuid NOT NULL,
    dcc_asset_link text NOT NULL
);


--
-- Name: gene_set_node; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gene_set_node (
    id uuid NOT NULL,
    gene_set_library_id uuid NOT NULL
);


--
-- Name: kg_assertion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kg_assertion (
    id uuid NOT NULL,
    relation_id uuid NOT NULL,
    source_id uuid NOT NULL,
    target_id uuid NOT NULL,
    dcc_id text,
    "SAB" text NOT NULL,
    evidence jsonb
);


--
-- Name: kg_relation_node; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kg_relation_node (
    id uuid NOT NULL
);


--
-- Name: kvstore; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kvstore (
    key text NOT NULL,
    value jsonb NOT NULL
);


--
-- Name: news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    portal text NOT NULL,
    version text,
    title text NOT NULL,
    description text,
    img text,
    link text,
    prod boolean NOT NULL,
    tags jsonb,
    supp_description jsonb
);


--
-- Name: node; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node (
    dcc_id text,
    id uuid NOT NULL,
    type public."NodeType" NOT NULL,
    label text NOT NULL,
    description text NOT NULL,
    searchable tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, ((label || ' '::text) || description))) STORED,
    entity_type text,
    pagerank double precision DEFAULT 0 NOT NULL
);


--
-- Name: outreach; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.outreach (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    link text,
    short_description text NOT NULL,
    end_date timestamp(3) with time zone,
    start_date timestamp(3) with time zone,
    image text,
    active boolean DEFAULT false NOT NULL,
    tags jsonb NOT NULL,
    application_end timestamp(3) with time zone,
    application_start timestamp(3) with time zone,
    carousel boolean DEFAULT false NOT NULL,
    cfde_specific boolean DEFAULT false NOT NULL,
    agenda jsonb,
    flyer text
);


--
-- Name: partnership_publications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partnership_publications (
    partnership_id text NOT NULL,
    publication_id text NOT NULL
);


--
-- Name: partnerships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partnerships (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    image text,
    status text,
    website text,
    priority integer,
    grant_num text
);


--
-- Name: publications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.publications (
    id text NOT NULL,
    authors text NOT NULL,
    doi text,
    issue text,
    journal text,
    page text,
    pmcid text,
    pmid text,
    title text NOT NULL,
    volume text,
    year text,
    tool_id text,
    landmark boolean DEFAULT false NOT NULL,
    carousel boolean DEFAULT false NOT NULL,
    carousel_description text,
    carousel_link text,
    carousel_title text,
    featured boolean DEFAULT false NOT NULL,
    image text,
    keywords jsonb
);


--
-- Name: r03; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.r03 (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    rfa text,
    end_date timestamp(3) without time zone,
    grant_num text,
    website text,
    video text,
    affilliation text,
    pi text
);


--
-- Name: r03_publications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.r03_publications (
    publication_id text NOT NULL,
    r03_id text NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tools (
    id text NOT NULL,
    label text NOT NULL,
    description text,
    url text NOT NULL,
    icon text,
    image text,
    short_description text,
    featured boolean DEFAULT false,
    tutorial jsonb
);


--
-- Name: usecase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usecase (
    id text NOT NULL,
    title text NOT NULL,
    short_description text NOT NULL,
    description text NOT NULL,
    inputs jsonb,
    outputs jsonb,
    sources jsonb,
    link text,
    image text,
    tutorial text,
    creator_dcc_id text,
    featured boolean DEFAULT false,
    tool_icon text,
    featured_image text,
    tool_name text
);


--
-- Name: anatomy; Type: TABLE; Schema: slim; Owner: -
--

CREATE TABLE slim.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying,
    synonyms character varying
);


--
-- Name: anatomy_slim; Type: TABLE; Schema: slim; Owner: -
--

CREATE TABLE slim.anatomy_slim (
    original_term_id character varying NOT NULL,
    slim_term_id character varying NOT NULL,
    pk_id integer NOT NULL
);


--
-- Name: anatomy_slim_pk_id_seq; Type: SEQUENCE; Schema: slim; Owner: -
--

CREATE SEQUENCE slim.anatomy_slim_pk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: anatomy_slim_pk_id_seq; Type: SEQUENCE OWNED BY; Schema: slim; Owner: -
--

ALTER SEQUENCE slim.anatomy_slim_pk_id_seq OWNED BY slim.anatomy_slim.pk_id;


--
-- Name: assay_type; Type: TABLE; Schema: slim; Owner: -
--

CREATE TABLE slim.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying,
    synonyms character varying
);


--
-- Name: assay_type_slim; Type: TABLE; Schema: slim; Owner: -
--

CREATE TABLE slim.assay_type_slim (
    original_term_id character varying NOT NULL,
    slim_term_id character varying NOT NULL,
    pk_id integer NOT NULL
);


--
-- Name: assay_type_slim_pk_id_seq; Type: SEQUENCE; Schema: slim; Owner: -
--

CREATE SEQUENCE slim.assay_type_slim_pk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assay_type_slim_pk_id_seq; Type: SEQUENCE OWNED BY; Schema: slim; Owner: -
--

ALTER SEQUENCE slim.assay_type_slim_pk_id_seq OWNED BY slim.assay_type_slim.pk_id;


--
-- Name: data_type; Type: TABLE; Schema: slim; Owner: -
--

CREATE TABLE slim.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying,
    synonyms character varying
);


--
-- Name: data_type_slim; Type: TABLE; Schema: slim; Owner: -
--

CREATE TABLE slim.data_type_slim (
    original_term_id character varying NOT NULL,
    slim_term_id character varying NOT NULL,
    pk_id integer NOT NULL
);


--
-- Name: data_type_slim_pk_id_seq; Type: SEQUENCE; Schema: slim; Owner: -
--

CREATE SEQUENCE slim.data_type_slim_pk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_type_slim_pk_id_seq; Type: SEQUENCE OWNED BY; Schema: slim; Owner: -
--

ALTER SEQUENCE slim.data_type_slim_pk_id_seq OWNED BY slim.data_type_slim.pk_id;


--
-- Name: dbgap_study_id; Type: TABLE; Schema: slim; Owner: -
--

CREATE TABLE slim.dbgap_study_id (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying
);


--
-- Name: disease; Type: TABLE; Schema: slim; Owner: -
--

CREATE TABLE slim.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying,
    synonyms character varying
);


--
-- Name: disease_slim; Type: TABLE; Schema: slim; Owner: -
--

CREATE TABLE slim.disease_slim (
    original_term_id character varying NOT NULL,
    slim_term_id character varying NOT NULL,
    pk_id integer NOT NULL
);


--
-- Name: disease_slim_pk_id_seq; Type: SEQUENCE; Schema: slim; Owner: -
--

CREATE SEQUENCE slim.disease_slim_pk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: disease_slim_pk_id_seq; Type: SEQUENCE OWNED BY; Schema: slim; Owner: -
--

ALTER SEQUENCE slim.disease_slim_pk_id_seq OWNED BY slim.disease_slim.pk_id;


--
-- Name: file_format; Type: TABLE; Schema: slim; Owner: -
--

CREATE TABLE slim.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying,
    synonyms character varying
);


--
-- Name: file_format_slim; Type: TABLE; Schema: slim; Owner: -
--

CREATE TABLE slim.file_format_slim (
    original_term_id character varying NOT NULL,
    slim_term_id character varying NOT NULL,
    pk_id integer NOT NULL
);


--
-- Name: file_format_slim_pk_id_seq; Type: SEQUENCE; Schema: slim; Owner: -
--

CREATE SEQUENCE slim.file_format_slim_pk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: file_format_slim_pk_id_seq; Type: SEQUENCE OWNED BY; Schema: slim; Owner: -
--

ALTER SEQUENCE slim.file_format_slim_pk_id_seq OWNED BY slim.file_format_slim.pk_id;


--
-- Name: analysis_type; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.analysis_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: anatomy; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.anatomy (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: assay_type; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.assay_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: biosample; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.biosample (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    sample_prep_method character varying DEFAULT ''::character varying,
    anatomy character varying DEFAULT ''::character varying
);


--
-- Name: biosample_disease; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.biosample_disease (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: biosample_from_subject; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.biosample_from_subject (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    age_at_sampling character varying DEFAULT ''::character varying
);


--
-- Name: biosample_gene; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.biosample_gene (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: biosample_in_collection; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.biosample_in_collection (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: biosample_substance; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.biosample_substance (
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.collection (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    has_time_series_data character varying DEFAULT ''::character varying
);


--
-- Name: collection_anatomy; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.collection_anatomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    anatomy character varying NOT NULL
);


--
-- Name: collection_compound; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.collection_compound (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    compound character varying NOT NULL
);


--
-- Name: collection_defined_by_project; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.collection_defined_by_project (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: collection_disease; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.collection_disease (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: collection_gene; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.collection_gene (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: collection_in_collection; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.collection_in_collection (
    superset_collection_id_namespace character varying NOT NULL,
    superset_collection_local_id character varying NOT NULL,
    subset_collection_id_namespace character varying NOT NULL,
    subset_collection_local_id character varying NOT NULL
);


--
-- Name: collection_phenotype; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.collection_phenotype (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: collection_protein; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.collection_protein (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    protein character varying NOT NULL
);


--
-- Name: collection_substance; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.collection_substance (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: collection_taxonomy; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.collection_taxonomy (
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL,
    taxon character varying NOT NULL
);


--
-- Name: compound; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.compound (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: data_type; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.data_type (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: dcc; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.dcc (
    id character varying NOT NULL,
    dcc_name character varying NOT NULL,
    dcc_abbreviation character varying NOT NULL,
    dcc_description character varying DEFAULT ''::character varying,
    contact_email character varying NOT NULL,
    contact_name character varying NOT NULL,
    dcc_url character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL
);


--
-- Name: disease; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.disease (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.file (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    size_in_bytes character varying DEFAULT ''::character varying,
    uncompressed_size_in_bytes character varying DEFAULT ''::character varying,
    sha256 character varying DEFAULT ''::character varying,
    md5 character varying DEFAULT ''::character varying,
    filename character varying NOT NULL,
    file_format character varying DEFAULT ''::character varying,
    compression_format character varying DEFAULT ''::character varying,
    data_type character varying DEFAULT ''::character varying,
    assay_type character varying DEFAULT ''::character varying,
    analysis_type character varying DEFAULT ''::character varying,
    mime_type character varying DEFAULT ''::character varying,
    bundle_collection_id_namespace character varying DEFAULT ''::character varying,
    bundle_collection_local_id character varying DEFAULT ''::character varying,
    dbgap_study_id character varying DEFAULT ''::character varying
);


--
-- Name: file_describes_biosample; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.file_describes_biosample (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    biosample_id_namespace character varying NOT NULL,
    biosample_local_id character varying NOT NULL
);


--
-- Name: file_describes_collection; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.file_describes_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: file_describes_subject; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.file_describes_subject (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL
);


--
-- Name: file_format; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.file_format (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: file_in_collection; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.file_in_collection (
    file_id_namespace character varying NOT NULL,
    file_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: gene; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.gene (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying NOT NULL
);


--
-- Name: id_namespace; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.id_namespace (
    id character varying NOT NULL,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: ncbi_taxonomy; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.ncbi_taxonomy (
    id character varying NOT NULL,
    clade character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.phenotype (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: phenotype_disease; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.phenotype_disease (
    phenotype character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: phenotype_gene; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.phenotype_gene (
    phenotype character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: project; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.project (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    abbreviation character varying DEFAULT ''::character varying,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying
);


--
-- Name: project_in_project; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.project_in_project (
    parent_project_id_namespace character varying NOT NULL,
    parent_project_local_id character varying NOT NULL,
    child_project_id_namespace character varying NOT NULL,
    child_project_local_id character varying NOT NULL
);


--
-- Name: protein; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.protein (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    organism character varying DEFAULT ''::character varying
);


--
-- Name: protein_gene; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.protein_gene (
    protein character varying NOT NULL,
    gene character varying NOT NULL
);


--
-- Name: sample_prep_method; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.sample_prep_method (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying
);


--
-- Name: subject; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.subject (
    id_namespace character varying NOT NULL,
    local_id character varying NOT NULL,
    project_id_namespace character varying NOT NULL,
    project_local_id character varying NOT NULL,
    persistent_id character varying DEFAULT ''::character varying,
    creation_time character varying DEFAULT ''::character varying,
    granularity character varying NOT NULL,
    sex character varying DEFAULT ''::character varying,
    ethnicity character varying DEFAULT ''::character varying,
    age_at_enrollment character varying DEFAULT ''::character varying
);


--
-- Name: subject_disease; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.subject_disease (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    disease character varying NOT NULL
);


--
-- Name: subject_in_collection; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.subject_in_collection (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    collection_id_namespace character varying NOT NULL,
    collection_local_id character varying NOT NULL
);


--
-- Name: subject_phenotype; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.subject_phenotype (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    association_type character varying NOT NULL,
    phenotype character varying NOT NULL
);


--
-- Name: subject_race; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.subject_race (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    race character varying DEFAULT ''::character varying NOT NULL
);


--
-- Name: subject_role_taxonomy; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.subject_role_taxonomy (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    role_id character varying NOT NULL,
    taxonomy_id character varying NOT NULL
);


--
-- Name: subject_substance; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.subject_substance (
    subject_id_namespace character varying NOT NULL,
    subject_local_id character varying NOT NULL,
    substance character varying NOT NULL
);


--
-- Name: substance; Type: TABLE; Schema: sparc; Owner: -
--

CREATE TABLE sparc.substance (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying,
    synonyms character varying DEFAULT ''::character varying,
    compound character varying NOT NULL
);


--
-- Name: ffl_biosample_collection pk_id; Type: DEFAULT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.ffl_biosample_collection ALTER COLUMN pk_id SET DEFAULT nextval('c2m2.ffl_biosample_collection_pk_id_seq'::regclass);


--
-- Name: ffl_biosample_collection_cmp pk_id; Type: DEFAULT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.ffl_biosample_collection_cmp ALTER COLUMN pk_id SET DEFAULT nextval('c2m2.ffl_biosample_collection_cmp_pk_id_seq'::regclass);


--
-- Name: file_describes_in_collection pk_id; Type: DEFAULT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_describes_in_collection ALTER COLUMN pk_id SET DEFAULT nextval('c2m2.file_describes_in_collection_pk_id_seq'::regclass);


--
-- Name: project_data_type pk_id; Type: DEFAULT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.project_data_type ALTER COLUMN pk_id SET DEFAULT nextval('c2m2.project_data_type_pk_id_seq'::regclass);


--
-- Name: anatomy_slim pk_id; Type: DEFAULT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.anatomy_slim ALTER COLUMN pk_id SET DEFAULT nextval('slim.anatomy_slim_pk_id_seq'::regclass);


--
-- Name: assay_type_slim pk_id; Type: DEFAULT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.assay_type_slim ALTER COLUMN pk_id SET DEFAULT nextval('slim.assay_type_slim_pk_id_seq'::regclass);


--
-- Name: data_type_slim pk_id; Type: DEFAULT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.data_type_slim ALTER COLUMN pk_id SET DEFAULT nextval('slim.data_type_slim_pk_id_seq'::regclass);


--
-- Name: disease_slim pk_id; Type: DEFAULT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.disease_slim ALTER COLUMN pk_id SET DEFAULT nextval('slim.disease_slim_pk_id_seq'::regclass);


--
-- Name: file_format_slim pk_id; Type: DEFAULT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.file_format_slim ALTER COLUMN pk_id SET DEFAULT nextval('slim.file_format_slim_pk_id_seq'::regclass);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease_association_type disease_association_type_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.disease_association_type
    ADD CONSTRAINT disease_association_type_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: ffl_biosample_collection_cmp ffl_biosample_collection_cmp_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.ffl_biosample_collection_cmp
    ADD CONSTRAINT ffl_biosample_collection_cmp_pkey PRIMARY KEY (pk_id);


--
-- Name: ffl_biosample_collection ffl_biosample_collection_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.ffl_biosample_collection
    ADD CONSTRAINT ffl_biosample_collection_pkey PRIMARY KEY (pk_id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_in_collection file_describes_in_collection_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_describes_in_collection
    ADD CONSTRAINT file_describes_in_collection_pkey PRIMARY KEY (pk_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace_dcc_id id_namespace_dcc_id_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.id_namespace_dcc_id
    ADD CONSTRAINT id_namespace_dcc_id_pkey PRIMARY KEY (id_namespace_id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_association_type phenotype_association_type_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.phenotype_association_type
    ADD CONSTRAINT phenotype_association_type_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_data_type project_data_type_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.project_data_type
    ADD CONSTRAINT project_data_type_pkey PRIMARY KEY (pk_id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_ethnicity subject_ethnicity_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_ethnicity
    ADD CONSTRAINT subject_ethnicity_pkey PRIMARY KEY (id);


--
-- Name: subject_granularity subject_granularity_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_granularity
    ADD CONSTRAINT subject_granularity_pkey PRIMARY KEY (id);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race_cv subject_race_cv_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_race_cv
    ADD CONSTRAINT subject_race_cv_pkey PRIMARY KEY (id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role subject_role_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_role
    ADD CONSTRAINT subject_role_pkey PRIMARY KEY (id);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_sex subject_sex_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_sex
    ADD CONSTRAINT subject_sex_pkey PRIMARY KEY (id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: _private_job_queues job_queues_pkey1; Type: CONSTRAINT; Schema: graphile_worker; Owner: -
--

ALTER TABLE ONLY graphile_worker._private_job_queues
    ADD CONSTRAINT job_queues_pkey1 PRIMARY KEY (id);


--
-- Name: _private_job_queues job_queues_queue_name_key; Type: CONSTRAINT; Schema: graphile_worker; Owner: -
--

ALTER TABLE ONLY graphile_worker._private_job_queues
    ADD CONSTRAINT job_queues_queue_name_key UNIQUE (queue_name);


--
-- Name: _private_jobs jobs_key_key1; Type: CONSTRAINT; Schema: graphile_worker; Owner: -
--

ALTER TABLE ONLY graphile_worker._private_jobs
    ADD CONSTRAINT jobs_key_key1 UNIQUE (key);


--
-- Name: _private_jobs jobs_pkey1; Type: CONSTRAINT; Schema: graphile_worker; Owner: -
--

ALTER TABLE ONLY graphile_worker._private_jobs
    ADD CONSTRAINT jobs_pkey1 PRIMARY KEY (id);


--
-- Name: _private_known_crontabs known_crontabs_pkey; Type: CONSTRAINT; Schema: graphile_worker; Owner: -
--

ALTER TABLE ONLY graphile_worker._private_known_crontabs
    ADD CONSTRAINT known_crontabs_pkey PRIMARY KEY (identifier);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: graphile_worker; Owner: -
--

ALTER TABLE ONLY graphile_worker.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: _private_tasks tasks_identifier_key; Type: CONSTRAINT; Schema: graphile_worker; Owner: -
--

ALTER TABLE ONLY graphile_worker._private_tasks
    ADD CONSTRAINT tasks_identifier_key UNIQUE (identifier);


--
-- Name: _private_tasks tasks_pkey; Type: CONSTRAINT; Schema: graphile_worker; Owner: -
--

ALTER TABLE ONLY graphile_worker._private_tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: entity entity_pkey; Type: CONSTRAINT; Schema: pdp; Owner: -
--

ALTER TABLE ONLY pdp.entity
    ADD CONSTRAINT entity_pkey PRIMARY KEY (type, id);


--
-- Name: relationship relationship_pkey; Type: CONSTRAINT; Schema: pdp; Owner: -
--

ALTER TABLE ONLY pdp.relationship
    ADD CONSTRAINT relationship_pkey PRIMARY KEY (predicate, source_id, target_id);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: c2m2_datapackage c2m2_datapackage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c2m2_datapackage
    ADD CONSTRAINT c2m2_datapackage_pkey PRIMARY KEY (id);


--
-- Name: c2m2_file_node c2m2_file_node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c2m2_file_node
    ADD CONSTRAINT c2m2_file_node_pkey PRIMARY KEY (id);


--
-- Name: center_outreach center_outreach_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.center_outreach
    ADD CONSTRAINT center_outreach_pkey PRIMARY KEY (outreach_id);


--
-- Name: center_publications center_publications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.center_publications
    ADD CONSTRAINT center_publications_pkey PRIMARY KEY (publication_id);


--
-- Name: centers centers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.centers
    ADD CONSTRAINT centers_pkey PRIMARY KEY (id);


--
-- Name: code_assets code_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.code_assets
    ADD CONSTRAINT code_assets_pkey PRIMARY KEY (type, link);


--
-- Name: dcc_asset_node dcc_asset_node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_asset_node
    ADD CONSTRAINT dcc_asset_node_pkey PRIMARY KEY (id);


--
-- Name: dcc_assets dcc_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_assets
    ADD CONSTRAINT dcc_assets_pkey PRIMARY KEY (dcc_id, link, lastmodified);


--
-- Name: dcc_outreach dcc_outreach_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_outreach
    ADD CONSTRAINT dcc_outreach_pkey PRIMARY KEY (outreach_id, dcc_id);


--
-- Name: dcc_partnerships dcc_partnerships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_partnerships
    ADD CONSTRAINT dcc_partnerships_pkey PRIMARY KEY (partnership_id, dcc_id);


--
-- Name: dcc_publications dcc_publications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_publications
    ADD CONSTRAINT dcc_publications_pkey PRIMARY KEY (publication_id, dcc_id);


--
-- Name: dcc_usecase dcc_usecase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_usecase
    ADD CONSTRAINT dcc_usecase_pkey PRIMARY KEY (usecase_id, dcc_id);


--
-- Name: dccs dccs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dccs
    ADD CONSTRAINT dccs_pkey PRIMARY KEY (id);


--
-- Name: entity_node entity_node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_node
    ADD CONSTRAINT entity_node_pkey PRIMARY KEY (id);


--
-- Name: fair_assessments fair_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fair_assessments
    ADD CONSTRAINT fair_assessments_pkey PRIMARY KEY (id);


--
-- Name: file_assets file_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_assets
    ADD CONSTRAINT file_assets_pkey PRIMARY KEY (filetype, link);


--
-- Name: gene_entity gene_entity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_entity
    ADD CONSTRAINT gene_entity_pkey PRIMARY KEY (id);


--
-- Name: gene_set_library_node gene_set_library_node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_set_library_node
    ADD CONSTRAINT gene_set_library_node_pkey PRIMARY KEY (id);


--
-- Name: gene_set_node gene_set_node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_set_node
    ADD CONSTRAINT gene_set_node_pkey PRIMARY KEY (id);


--
-- Name: kg_assertion kg_assertion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kg_assertion
    ADD CONSTRAINT kg_assertion_pkey PRIMARY KEY (id);


--
-- Name: kg_relation_node kg_relation_node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kg_relation_node
    ADD CONSTRAINT kg_relation_node_pkey PRIMARY KEY (id);


--
-- Name: kvstore kvstore_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kvstore
    ADD CONSTRAINT kvstore_pkey PRIMARY KEY (key);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: node node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_pkey PRIMARY KEY (id);


--
-- Name: outreach outreach_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outreach
    ADD CONSTRAINT outreach_pkey PRIMARY KEY (id);


--
-- Name: partnership_publications partnership_publications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnership_publications
    ADD CONSTRAINT partnership_publications_pkey PRIMARY KEY (partnership_id, publication_id);


--
-- Name: partnerships partnerships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnerships
    ADD CONSTRAINT partnerships_pkey PRIMARY KEY (id);


--
-- Name: publications publications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publications
    ADD CONSTRAINT publications_pkey PRIMARY KEY (id);


--
-- Name: r03 r03_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.r03
    ADD CONSTRAINT r03_pkey PRIMARY KEY (id);


--
-- Name: r03_publications r03_publications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.r03_publications
    ADD CONSTRAINT r03_publications_pkey PRIMARY KEY (publication_id, r03_id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tools tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_pkey PRIMARY KEY (id);


--
-- Name: usecase usecase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usecase
    ADD CONSTRAINT usecase_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: anatomy_slim anatomy_slim_pkey; Type: CONSTRAINT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.anatomy_slim
    ADD CONSTRAINT anatomy_slim_pkey PRIMARY KEY (pk_id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: assay_type_slim assay_type_slim_pkey; Type: CONSTRAINT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.assay_type_slim
    ADD CONSTRAINT assay_type_slim_pkey PRIMARY KEY (pk_id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: data_type_slim data_type_slim_pkey; Type: CONSTRAINT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.data_type_slim
    ADD CONSTRAINT data_type_slim_pkey PRIMARY KEY (pk_id);


--
-- Name: dbgap_study_id dbgap_study_id_pkey; Type: CONSTRAINT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.dbgap_study_id
    ADD CONSTRAINT dbgap_study_id_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: disease_slim disease_slim_pkey; Type: CONSTRAINT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.disease_slim
    ADD CONSTRAINT disease_slim_pkey PRIMARY KEY (pk_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_format_slim file_format_slim_pkey; Type: CONSTRAINT; Schema: slim; Owner: -
--

ALTER TABLE ONLY slim.file_format_slim
    ADD CONSTRAINT file_format_slim_pkey PRIMARY KEY (pk_id);


--
-- Name: analysis_type analysis_type_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.analysis_type
    ADD CONSTRAINT analysis_type_pkey PRIMARY KEY (id);


--
-- Name: anatomy anatomy_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.anatomy
    ADD CONSTRAINT anatomy_pkey PRIMARY KEY (id);


--
-- Name: assay_type assay_type_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.assay_type
    ADD CONSTRAINT assay_type_pkey PRIMARY KEY (id);


--
-- Name: biosample_disease biosample_disease_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_disease
    ADD CONSTRAINT biosample_disease_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, association_type, disease);


--
-- Name: biosample_from_subject biosample_from_subject_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_from_subject
    ADD CONSTRAINT biosample_from_subject_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, subject_id_namespace, subject_local_id);


--
-- Name: biosample_gene biosample_gene_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_gene
    ADD CONSTRAINT biosample_gene_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, gene);


--
-- Name: biosample_in_collection biosample_in_collection_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_in_collection
    ADD CONSTRAINT biosample_in_collection_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, collection_id_namespace, collection_local_id);


--
-- Name: biosample biosample_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample
    ADD CONSTRAINT biosample_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: biosample_substance biosample_substance_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_substance
    ADD CONSTRAINT biosample_substance_pkey PRIMARY KEY (biosample_id_namespace, biosample_local_id, substance);


--
-- Name: collection_anatomy collection_anatomy_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_anatomy
    ADD CONSTRAINT collection_anatomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, anatomy);


--
-- Name: collection_compound collection_compound_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_compound
    ADD CONSTRAINT collection_compound_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, compound);


--
-- Name: collection_defined_by_project collection_defined_by_project_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_defined_by_project
    ADD CONSTRAINT collection_defined_by_project_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, project_id_namespace, project_local_id);


--
-- Name: collection_disease collection_disease_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_disease
    ADD CONSTRAINT collection_disease_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, disease);


--
-- Name: collection_gene collection_gene_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_gene
    ADD CONSTRAINT collection_gene_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, gene);


--
-- Name: collection_in_collection collection_in_collection_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_in_collection
    ADD CONSTRAINT collection_in_collection_pkey PRIMARY KEY (superset_collection_id_namespace, superset_collection_local_id, subset_collection_id_namespace, subset_collection_local_id);


--
-- Name: collection_phenotype collection_phenotype_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_phenotype
    ADD CONSTRAINT collection_phenotype_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, phenotype);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: collection_protein collection_protein_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_protein
    ADD CONSTRAINT collection_protein_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, protein);


--
-- Name: collection_substance collection_substance_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_substance
    ADD CONSTRAINT collection_substance_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, substance);


--
-- Name: collection_taxonomy collection_taxonomy_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_taxonomy
    ADD CONSTRAINT collection_taxonomy_pkey PRIMARY KEY (collection_id_namespace, collection_local_id, taxon);


--
-- Name: compound compound_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.compound
    ADD CONSTRAINT compound_pkey PRIMARY KEY (id);


--
-- Name: data_type data_type_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: dcc dcc_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.dcc
    ADD CONSTRAINT dcc_pkey PRIMARY KEY (id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (id);


--
-- Name: file_describes_biosample file_describes_biosample_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_describes_biosample
    ADD CONSTRAINT file_describes_biosample_pkey PRIMARY KEY (file_id_namespace, file_local_id, biosample_id_namespace, biosample_local_id);


--
-- Name: file_describes_collection file_describes_collection_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_describes_collection
    ADD CONSTRAINT file_describes_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file_describes_subject file_describes_subject_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_describes_subject
    ADD CONSTRAINT file_describes_subject_pkey PRIMARY KEY (file_id_namespace, file_local_id, subject_id_namespace, subject_local_id);


--
-- Name: file_format file_format_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_format
    ADD CONSTRAINT file_format_pkey PRIMARY KEY (id);


--
-- Name: file_in_collection file_in_collection_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_in_collection
    ADD CONSTRAINT file_in_collection_pkey PRIMARY KEY (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (id);


--
-- Name: id_namespace id_namespace_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.id_namespace
    ADD CONSTRAINT id_namespace_pkey PRIMARY KEY (id);


--
-- Name: ncbi_taxonomy ncbi_taxonomy_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.ncbi_taxonomy
    ADD CONSTRAINT ncbi_taxonomy_pkey PRIMARY KEY (id);


--
-- Name: phenotype_disease phenotype_disease_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.phenotype_disease
    ADD CONSTRAINT phenotype_disease_pkey PRIMARY KEY (phenotype, disease);


--
-- Name: phenotype_gene phenotype_gene_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.phenotype_gene
    ADD CONSTRAINT phenotype_gene_pkey PRIMARY KEY (phenotype, gene);


--
-- Name: phenotype phenotype_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.phenotype
    ADD CONSTRAINT phenotype_pkey PRIMARY KEY (id);


--
-- Name: project_in_project project_in_project_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.project_in_project
    ADD CONSTRAINT project_in_project_pkey PRIMARY KEY (parent_project_id_namespace, parent_project_local_id, child_project_id_namespace, child_project_local_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: protein_gene protein_gene_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.protein_gene
    ADD CONSTRAINT protein_gene_pkey PRIMARY KEY (protein, gene);


--
-- Name: protein protein_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.protein
    ADD CONSTRAINT protein_pkey PRIMARY KEY (id);


--
-- Name: sample_prep_method sample_prep_method_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.sample_prep_method
    ADD CONSTRAINT sample_prep_method_pkey PRIMARY KEY (id);


--
-- Name: subject_disease subject_disease_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_disease
    ADD CONSTRAINT subject_disease_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, disease);


--
-- Name: subject_in_collection subject_in_collection_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_in_collection
    ADD CONSTRAINT subject_in_collection_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, collection_id_namespace, collection_local_id);


--
-- Name: subject_phenotype subject_phenotype_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_phenotype
    ADD CONSTRAINT subject_phenotype_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, association_type, phenotype);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id_namespace, local_id);


--
-- Name: subject_race subject_race_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_race
    ADD CONSTRAINT subject_race_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, race);


--
-- Name: subject_role_taxonomy subject_role_taxonomy_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_role_taxonomy
    ADD CONSTRAINT subject_role_taxonomy_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, role_id, taxonomy_id);


--
-- Name: subject_substance subject_substance_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_substance
    ADD CONSTRAINT subject_substance_pkey PRIMARY KEY (subject_id_namespace, subject_local_id, substance);


--
-- Name: substance substance_pkey; Type: CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.substance
    ADD CONSTRAINT substance_pkey PRIMARY KEY (id);


--
-- Name: ffl_biosample_cmp_idx_dcc_proj_sp_dis_ana_gene_data; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_biosample_cmp_idx_dcc_proj_sp_dis_ana_gene_data ON c2m2.ffl_biosample_cmp USING btree (dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, protein_name, compound_name, data_type_name, assay_type_name);


--
-- Name: ffl_biosample_cmp_idx_dcc_sp_dis_ana; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_biosample_cmp_idx_dcc_sp_dis_ana ON c2m2.ffl_biosample_cmp USING btree (dcc_name, ncbi_taxonomy_name, disease_name, anatomy_name);


--
-- Name: ffl_biosample_cmp_idx_searchable; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_biosample_cmp_idx_searchable ON c2m2.ffl_biosample_cmp USING gin (searchable);


--
-- Name: ffl_biosample_collection_cmp_idx; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_biosample_collection_cmp_idx ON c2m2.ffl_biosample_collection_cmp USING gin (searchable);


--
-- Name: ffl_biosample_collection_cmp_idx_many_cols; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_biosample_collection_cmp_idx_many_cols ON c2m2.ffl_biosample_collection_cmp USING btree (dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, protein_name, compound_name, data_type_name, assay_type_name);


--
-- Name: ffl_biosample_collection_idx; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_biosample_collection_idx ON c2m2.ffl_biosample_collection USING gin (searchable);


--
-- Name: ffl_biosample_collection_idx_many_cols; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_biosample_collection_idx_many_cols ON c2m2.ffl_biosample_collection USING btree (dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, protein_name, compound_name, data_type_name, assay_type_name);


--
-- Name: ffl_biosample_idx_dcc_proj_sp_dis_ana_gene_data; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_biosample_idx_dcc_proj_sp_dis_ana_gene_data ON c2m2.ffl_biosample USING btree (dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, protein_name, compound_name, data_type_name, assay_type_name);


--
-- Name: ffl_biosample_idx_dcc_sp_dis_ana; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_biosample_idx_dcc_sp_dis_ana ON c2m2.ffl_biosample USING btree (dcc_name, ncbi_taxonomy_name, disease_name, anatomy_name);


--
-- Name: ffl_biosample_idx_searchable; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_biosample_idx_searchable ON c2m2.ffl_biosample USING gin (searchable);


--
-- Name: ffl_collection_cmp_idx_dcc_proj_sp_dis_ana_gene_data; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_collection_cmp_idx_dcc_proj_sp_dis_ana_gene_data ON c2m2.ffl_collection_cmp USING btree (dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, protein_name, compound_name, data_type_name, assay_type_name);


--
-- Name: ffl_collection_cmp_idx_dcc_sp_dis_ana; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_collection_cmp_idx_dcc_sp_dis_ana ON c2m2.ffl_collection_cmp USING btree (dcc_name, ncbi_taxonomy_name, disease_name, anatomy_name);


--
-- Name: ffl_collection_cmp_idx_searchable; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_collection_cmp_idx_searchable ON c2m2.ffl_collection_cmp USING gin (searchable);


--
-- Name: ffl_collection_idx_dcc_proj_sp_dis_ana_gene_data; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_collection_idx_dcc_proj_sp_dis_ana_gene_data ON c2m2.ffl_collection USING btree (dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, protein_name, compound_name, data_type_name, assay_type_name);


--
-- Name: ffl_collection_idx_dcc_sp_dis_ana; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_collection_idx_dcc_sp_dis_ana ON c2m2.ffl_collection USING btree (dcc_name, ncbi_taxonomy_name, disease_name, anatomy_name);


--
-- Name: ffl_collection_idx_searchable; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX ffl_collection_idx_searchable ON c2m2.ffl_collection USING gin (searchable);


--
-- Name: file_describes_in_collection_idx; Type: INDEX; Schema: c2m2; Owner: -
--

CREATE INDEX file_describes_in_collection_idx ON c2m2.file_describes_in_collection USING btree (file_id_namespace, file_local_id, collection_id_namespace, collection_local_id);


--
-- Name: jobs_main_index; Type: INDEX; Schema: graphile_worker; Owner: -
--

CREATE INDEX jobs_main_index ON graphile_worker._private_jobs USING btree (priority, run_at) INCLUDE (id, task_id, job_queue_id) WHERE (is_available = true);


--
-- Name: jobs_no_queue_index; Type: INDEX; Schema: graphile_worker; Owner: -
--

CREATE INDEX jobs_no_queue_index ON graphile_worker._private_jobs USING btree (priority, run_at) INCLUDE (id, task_id) WHERE ((is_available = true) AND (job_queue_id IS NULL));


--
-- Name: entity_jsonb_to_tsvector_idx; Type: INDEX; Schema: pdp; Owner: -
--

CREATE INDEX entity_jsonb_to_tsvector_idx ON ONLY pdp.entity USING gin (jsonb_to_tsvector('english'::regconfig, attributes, '"all"'::jsonb));


--
-- Name: entity_pagerank_idx; Type: INDEX; Schema: pdp; Owner: -
--

CREATE INDEX entity_pagerank_idx ON ONLY pdp.entity USING btree (pagerank);


--
-- Name: relationship_source_type_idx; Type: INDEX; Schema: pdp; Owner: -
--

CREATE INDEX relationship_source_type_idx ON ONLY pdp.relationship USING btree (source_type);


--
-- Name: relationship_target_type_idx; Type: INDEX; Schema: pdp; Owner: -
--

CREATE INDEX relationship_target_type_idx ON ONLY pdp.relationship USING btree (target_type);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: _DCCToUser_AB_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "_DCCToUser_AB_unique" ON public."_DCCToUser" USING btree ("A", "B");


--
-- Name: _DCCToUser_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_DCCToUser_B_index" ON public."_DCCToUser" USING btree ("B");


--
-- Name: _GeneEntityToGeneSetLibraryNode_AB_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "_GeneEntityToGeneSetLibraryNode_AB_unique" ON public."_GeneEntityToGeneSetLibraryNode" USING btree ("A", "B");


--
-- Name: _GeneEntityToGeneSetLibraryNode_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_GeneEntityToGeneSetLibraryNode_B_index" ON public."_GeneEntityToGeneSetLibraryNode" USING btree ("B");


--
-- Name: _GeneEntityToGeneSetNode_AB_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "_GeneEntityToGeneSetNode_AB_unique" ON public."_GeneEntityToGeneSetNode" USING btree ("A", "B");


--
-- Name: _GeneEntityToGeneSetNode_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_GeneEntityToGeneSetNode_B_index" ON public."_GeneEntityToGeneSetNode" USING btree ("B");


--
-- Name: c2m2_datapackage_dcc_asset_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX c2m2_datapackage_dcc_asset_link_key ON public.c2m2_datapackage USING btree (dcc_asset_link);


--
-- Name: code_assets_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX code_assets_link_key ON public.code_assets USING btree (link);


--
-- Name: code_assets_type_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX code_assets_type_link_key ON public.code_assets USING btree (type, link);


--
-- Name: dcc_asset_node_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX dcc_asset_node_link_key ON public.dcc_asset_node USING btree (link);


--
-- Name: dcc_assets_dcc_id_link_lastmodified_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX dcc_assets_dcc_id_link_lastmodified_key ON public.dcc_assets USING btree (dcc_id, link, lastmodified);


--
-- Name: dcc_assets_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX dcc_assets_link_key ON public.dcc_assets USING btree (link);


--
-- Name: entity_node_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_node_type_idx ON public.entity_node USING btree (type);


--
-- Name: fair_assessments_link_timestamp_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX fair_assessments_link_timestamp_key ON public.fair_assessments USING btree (link, "timestamp");


--
-- Name: file_assets_filetype_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX file_assets_filetype_link_key ON public.file_assets USING btree (filetype, link);


--
-- Name: file_assets_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX file_assets_link_key ON public.file_assets USING btree (link);


--
-- Name: gene_set_library_node_dcc_asset_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gene_set_library_node_dcc_asset_link_key ON public.gene_set_library_node USING btree (dcc_asset_link);


--
-- Name: node_dcc_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node_dcc_idx ON public.node USING btree (dcc_id);


--
-- Name: node_description_fts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node_description_fts ON public.node USING gin (to_tsvector('english'::regconfig, description));


--
-- Name: node_entity_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node_entity_type_idx ON public.node USING btree (entity_type);


--
-- Name: node_label_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node_label_trgm ON public.node USING gin (label public.gin_trgm_ops);


--
-- Name: node_pagerank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node_pagerank ON public.node USING btree (pagerank DESC);


--
-- Name: node_searchable_fts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node_searchable_fts ON public.node USING gin (searchable);


--
-- Name: node_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX node_type_idx ON public.node USING btree (type);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES _4dn.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES _4dn.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES _4dn.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES _4dn.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES _4dn.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES _4dn.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES _4dn.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES _4dn.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES _4dn.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES _4dn.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES _4dn.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES _4dn.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES _4dn.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES _4dn.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES _4dn.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES _4dn.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES _4dn.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES _4dn.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES _4dn.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES _4dn.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES _4dn.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES _4dn.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES _4dn.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES _4dn.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES _4dn.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES _4dn.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES _4dn.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES _4dn.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES _4dn.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES _4dn.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES _4dn.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES _4dn.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES _4dn.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES _4dn.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES _4dn.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES _4dn.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES _4dn.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES _4dn.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES _4dn.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES _4dn.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES _4dn.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES _4dn.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES _4dn.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES _4dn.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES _4dn.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES _4dn.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES _4dn.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES _4dn.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES _4dn.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: _4dn; Owner: -
--

ALTER TABLE ONLY _4dn.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES _4dn.compound(id);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES c2m2.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2m2.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2m2.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2m2.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2m2.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES c2m2.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES c2m2.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES c2m2.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES c2m2.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2m2.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2m2.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2m2.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2m2.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES c2m2.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES c2m2.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES c2m2.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES c2m2.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2m2.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES c2m2.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES c2m2.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES c2m2.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES c2m2.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2m2.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2m2.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2m2.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES c2m2.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES c2m2.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2m2.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES c2m2.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2m2.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES c2m2.ncbi_taxonomy(id);


--
-- Name: id_namespace_dcc_id fk_id_namespace_dcc_id_dcc_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.id_namespace_dcc_id
    ADD CONSTRAINT fk_id_namespace_dcc_id_dcc_1 FOREIGN KEY (dcc_id) REFERENCES c2m2.dcc(id);


--
-- Name: id_namespace_dcc_id fk_id_namespace_dcc_id_id_namespace_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.id_namespace_dcc_id
    ADD CONSTRAINT fk_id_namespace_dcc_id_id_namespace_1 FOREIGN KEY (id_namespace_id) REFERENCES c2m2.id_namespace(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2m2.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES c2m2.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2m2.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES c2m2.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2m2.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES c2m2.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES c2m2.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES c2m2.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES c2m2.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES c2m2.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES c2m2.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES c2m2.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES c2m2.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES c2m2.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES c2m2.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES c2m2.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES c2m2.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES c2m2.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: c2m2; Owner: -
--

ALTER TABLE ONLY c2m2.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES c2m2.compound(id);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES ercc.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES ercc.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES ercc.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES ercc.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES ercc.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES ercc.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES ercc.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES ercc.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES ercc.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES ercc.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES ercc.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES ercc.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES ercc.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES ercc.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES ercc.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES ercc.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES ercc.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES ercc.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES ercc.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES ercc.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES ercc.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES ercc.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES ercc.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES ercc.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES ercc.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES ercc.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES ercc.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES ercc.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES ercc.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES ercc.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES ercc.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES ercc.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES ercc.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES ercc.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES ercc.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES ercc.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES ercc.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES ercc.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES ercc.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES ercc.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES ercc.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES ercc.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES ercc.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES ercc.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES ercc.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES ercc.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES ercc.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES ercc.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES ercc.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES ercc.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES ercc.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES ercc.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES ercc.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES ercc.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES ercc.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES ercc.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES ercc.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES ercc.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES ercc.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES ercc.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES ercc.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: ercc; Owner: -
--

ALTER TABLE ONLY ercc.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES ercc.compound(id);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES glygen.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES glygen.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES glygen.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES glygen.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES glygen.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES glygen.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES glygen.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES glygen.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES glygen.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES glygen.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES glygen.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES glygen.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES glygen.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES glygen.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES glygen.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES glygen.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES glygen.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES glygen.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES glygen.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES glygen.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES glygen.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES glygen.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES glygen.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES glygen.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES glygen.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES glygen.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES glygen.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES glygen.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES glygen.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES glygen.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES glygen.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES glygen.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES glygen.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES glygen.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES glygen.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES glygen.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES glygen.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES glygen.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES glygen.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES glygen.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES glygen.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES glygen.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES glygen.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES glygen.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES glygen.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES glygen.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES glygen.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES glygen.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES glygen.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES glygen.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES glygen.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES glygen.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES glygen.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES glygen.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES glygen.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES glygen.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES glygen.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES glygen.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES glygen.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES glygen.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES glygen.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: glygen; Owner: -
--

ALTER TABLE ONLY glygen.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES glygen.compound(id);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES gtex.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES gtex.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES gtex.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES gtex.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES gtex.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES gtex.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES gtex.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES gtex.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES gtex.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES gtex.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES gtex.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES gtex.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES gtex.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES gtex.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES gtex.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES gtex.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES gtex.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES gtex.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES gtex.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES gtex.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES gtex.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES gtex.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES gtex.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES gtex.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES gtex.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES gtex.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES gtex.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES gtex.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES gtex.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES gtex.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES gtex.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES gtex.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES gtex.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES gtex.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES gtex.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES gtex.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES gtex.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES gtex.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES gtex.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES gtex.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES gtex.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES gtex.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES gtex.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES gtex.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES gtex.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES gtex.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES gtex.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES gtex.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES gtex.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES gtex.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES gtex.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES gtex.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES gtex.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES gtex.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES gtex.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES gtex.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES gtex.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES gtex.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES gtex.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES gtex.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES gtex.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: gtex; Owner: -
--

ALTER TABLE ONLY gtex.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES gtex.compound(id);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES hmp.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hmp.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES hmp.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hmp.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hmp.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hmp.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES hmp.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES hmp.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hmp.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES hmp.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES hmp.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hmp.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES hmp.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES hmp.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES hmp.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES hmp.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES hmp.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES hmp.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES hmp.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES hmp.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES hmp.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES hmp.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES hmp.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES hmp.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES hmp.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES hmp.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES hmp.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hmp.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES hmp.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES hmp.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES hmp.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hmp.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES hmp.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES hmp.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES hmp.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES hmp.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES hmp.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES hmp.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES hmp.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES hmp.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES hmp.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES hmp.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES hmp.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES hmp.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES hmp.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES hmp.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES hmp.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES hmp.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES hmp.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hmp.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES hmp.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hmp.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hmp.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES hmp.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hmp.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES hmp.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hmp.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES hmp.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hmp.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hmp.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES hmp.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: hmp; Owner: -
--

ALTER TABLE ONLY hmp.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES hmp.compound(id);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES hubmap.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hubmap.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES hubmap.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hubmap.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hubmap.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hubmap.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES hubmap.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES hubmap.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hubmap.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES hubmap.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES hubmap.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hubmap.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES hubmap.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES hubmap.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES hubmap.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES hubmap.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES hubmap.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES hubmap.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES hubmap.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES hubmap.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES hubmap.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES hubmap.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES hubmap.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES hubmap.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES hubmap.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES hubmap.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES hubmap.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES hubmap.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES hubmap.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES hubmap.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES hubmap.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hubmap.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES hubmap.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES hubmap.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES hubmap.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES hubmap.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES hubmap.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES hubmap.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES hubmap.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES hubmap.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES hubmap.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES hubmap.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES hubmap.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES hubmap.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES hubmap.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES hubmap.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES hubmap.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES hubmap.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES hubmap.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hubmap.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES hubmap.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES hubmap.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hubmap.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES hubmap.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hubmap.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES hubmap.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hubmap.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES hubmap.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hubmap.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES hubmap.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES hubmap.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: hubmap; Owner: -
--

ALTER TABLE ONLY hubmap.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES hubmap.compound(id);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES idg.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES idg.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES idg.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES idg.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES idg.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES idg.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES idg.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES idg.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES idg.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES idg.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES idg.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES idg.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES idg.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES idg.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES idg.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES idg.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES idg.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES idg.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES idg.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES idg.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES idg.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES idg.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES idg.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES idg.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES idg.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES idg.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES idg.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES idg.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES idg.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES idg.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES idg.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES idg.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES idg.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES idg.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES idg.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES idg.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES idg.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES idg.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES idg.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES idg.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES idg.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES idg.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES idg.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES idg.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES idg.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES idg.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES idg.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES idg.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES idg.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES idg.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES idg.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES idg.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES idg.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES idg.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES idg.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES idg.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES idg.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES idg.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES idg.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES idg.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES idg.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: idg; Owner: -
--

ALTER TABLE ONLY idg.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES idg.compound(id);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES kidsfirst.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES kidsfirst.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES kidsfirst.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES kidsfirst.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES kidsfirst.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES kidsfirst.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES kidsfirst.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES kidsfirst.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES kidsfirst.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES kidsfirst.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES kidsfirst.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES kidsfirst.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES kidsfirst.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES kidsfirst.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES kidsfirst.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES kidsfirst.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES kidsfirst.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES kidsfirst.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES kidsfirst.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES kidsfirst.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES kidsfirst.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES kidsfirst.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES kidsfirst.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES kidsfirst.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES kidsfirst.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES kidsfirst.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES kidsfirst.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES kidsfirst.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES kidsfirst.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES kidsfirst.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES kidsfirst.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES kidsfirst.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES kidsfirst.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES kidsfirst.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES kidsfirst.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES kidsfirst.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES kidsfirst.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES kidsfirst.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES kidsfirst.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES kidsfirst.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES kidsfirst.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES kidsfirst.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES kidsfirst.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES kidsfirst.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES kidsfirst.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES kidsfirst.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES kidsfirst.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES kidsfirst.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES kidsfirst.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES kidsfirst.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES kidsfirst.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES kidsfirst.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES kidsfirst.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES kidsfirst.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES kidsfirst.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES kidsfirst.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES kidsfirst.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES kidsfirst.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES kidsfirst.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES kidsfirst.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES kidsfirst.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: kidsfirst; Owner: -
--

ALTER TABLE ONLY kidsfirst.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES kidsfirst.compound(id);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES lincs.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES lincs.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES lincs.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES lincs.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES lincs.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES lincs.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES lincs.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES lincs.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES lincs.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES lincs.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES lincs.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES lincs.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES lincs.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES lincs.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES lincs.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES lincs.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES lincs.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES lincs.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES lincs.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES lincs.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES lincs.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES lincs.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES lincs.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES lincs.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES lincs.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES lincs.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES lincs.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES lincs.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES lincs.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES lincs.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES lincs.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES lincs.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES lincs.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES lincs.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES lincs.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES lincs.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES lincs.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES lincs.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES lincs.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES lincs.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES lincs.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES lincs.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES lincs.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES lincs.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES lincs.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES lincs.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES lincs.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES lincs.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES lincs.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES lincs.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES lincs.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES lincs.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES lincs.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES lincs.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES lincs.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES lincs.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES lincs.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES lincs.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES lincs.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES lincs.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES lincs.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: lincs; Owner: -
--

ALTER TABLE ONLY lincs.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES lincs.compound(id);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES metabolomics.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES metabolomics.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES metabolomics.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES metabolomics.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES metabolomics.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES metabolomics.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES metabolomics.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES metabolomics.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES metabolomics.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES metabolomics.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES metabolomics.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES metabolomics.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES metabolomics.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES metabolomics.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES metabolomics.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES metabolomics.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES metabolomics.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES metabolomics.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES metabolomics.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES metabolomics.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES metabolomics.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES metabolomics.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES metabolomics.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES metabolomics.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES metabolomics.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES metabolomics.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES metabolomics.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES metabolomics.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES metabolomics.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES metabolomics.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES metabolomics.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES metabolomics.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES metabolomics.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES metabolomics.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES metabolomics.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES metabolomics.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES metabolomics.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES metabolomics.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES metabolomics.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES metabolomics.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES metabolomics.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES metabolomics.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES metabolomics.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES metabolomics.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES metabolomics.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES metabolomics.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES metabolomics.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES metabolomics.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES metabolomics.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES metabolomics.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES metabolomics.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES metabolomics.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES metabolomics.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES metabolomics.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES metabolomics.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES metabolomics.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES metabolomics.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES metabolomics.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES metabolomics.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES metabolomics.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES metabolomics.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: metabolomics; Owner: -
--

ALTER TABLE ONLY metabolomics.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES metabolomics.compound(id);


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES motrpac.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES motrpac.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES motrpac.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES motrpac.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES motrpac.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES motrpac.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES motrpac.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES motrpac.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES motrpac.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES motrpac.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES motrpac.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES motrpac.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES motrpac.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES motrpac.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES motrpac.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES motrpac.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES motrpac.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES motrpac.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES motrpac.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES motrpac.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES motrpac.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES motrpac.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES motrpac.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES motrpac.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES motrpac.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES motrpac.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES motrpac.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES motrpac.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES motrpac.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES motrpac.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES motrpac.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES motrpac.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES motrpac.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES motrpac.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES motrpac.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES motrpac.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES motrpac.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES motrpac.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES motrpac.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES motrpac.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES motrpac.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES motrpac.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES motrpac.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES motrpac.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES motrpac.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES motrpac.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES motrpac.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES motrpac.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES motrpac.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES motrpac.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES motrpac.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES motrpac.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES motrpac.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES motrpac.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES motrpac.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES motrpac.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES motrpac.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES motrpac.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES motrpac.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES motrpac.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES motrpac.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: motrpac; Owner: -
--

ALTER TABLE ONLY motrpac.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES motrpac.compound(id);


--
-- Name: relationship relationship_source_type_source_id_fkey; Type: FK CONSTRAINT; Schema: pdp; Owner: -
--

ALTER TABLE pdp.relationship
    ADD CONSTRAINT relationship_source_type_source_id_fkey FOREIGN KEY (source_type, source_id) REFERENCES pdp.entity(type, id);


--
-- Name: relationship relationship_target_type_target_id_fkey; Type: FK CONSTRAINT; Schema: pdp; Owner: -
--

ALTER TABLE pdp.relationship
    ADD CONSTRAINT relationship_target_type_target_id_fkey FOREIGN KEY (target_type, target_id) REFERENCES pdp.entity(type, id);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DCCToUser _DCCToUser_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_DCCToUser"
    ADD CONSTRAINT "_DCCToUser_A_fkey" FOREIGN KEY ("A") REFERENCES public.dccs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DCCToUser _DCCToUser_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_DCCToUser"
    ADD CONSTRAINT "_DCCToUser_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _GeneEntityToGeneSetLibraryNode _GeneEntityToGeneSetLibraryNode_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_GeneEntityToGeneSetLibraryNode"
    ADD CONSTRAINT "_GeneEntityToGeneSetLibraryNode_A_fkey" FOREIGN KEY ("A") REFERENCES public.gene_entity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _GeneEntityToGeneSetLibraryNode _GeneEntityToGeneSetLibraryNode_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_GeneEntityToGeneSetLibraryNode"
    ADD CONSTRAINT "_GeneEntityToGeneSetLibraryNode_B_fkey" FOREIGN KEY ("B") REFERENCES public.gene_set_library_node(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _GeneEntityToGeneSetNode _GeneEntityToGeneSetNode_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_GeneEntityToGeneSetNode"
    ADD CONSTRAINT "_GeneEntityToGeneSetNode_A_fkey" FOREIGN KEY ("A") REFERENCES public.gene_entity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _GeneEntityToGeneSetNode _GeneEntityToGeneSetNode_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_GeneEntityToGeneSetNode"
    ADD CONSTRAINT "_GeneEntityToGeneSetNode_B_fkey" FOREIGN KEY ("B") REFERENCES public.gene_set_node(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: c2m2_datapackage c2m2_datapackage_dcc_asset_link_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c2m2_datapackage
    ADD CONSTRAINT c2m2_datapackage_dcc_asset_link_fkey FOREIGN KEY (dcc_asset_link) REFERENCES public.dcc_assets(link) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: c2m2_file_node c2m2_file_node_c2m2_datapackage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c2m2_file_node
    ADD CONSTRAINT c2m2_file_node_c2m2_datapackage_id_fkey FOREIGN KEY (c2m2_datapackage_id) REFERENCES public.c2m2_datapackage(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: c2m2_file_node c2m2_file_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c2m2_file_node
    ADD CONSTRAINT c2m2_file_node_id_fkey FOREIGN KEY (id) REFERENCES public.node(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: center_outreach center_outreach_center_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.center_outreach
    ADD CONSTRAINT center_outreach_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.centers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: center_outreach center_outreach_outreach_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.center_outreach
    ADD CONSTRAINT center_outreach_outreach_id_fkey FOREIGN KEY (outreach_id) REFERENCES public.outreach(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: center_publications center_publications_center_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.center_publications
    ADD CONSTRAINT center_publications_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.centers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: center_publications center_publications_publication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.center_publications
    ADD CONSTRAINT center_publications_publication_id_fkey FOREIGN KEY (publication_id) REFERENCES public.publications(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: code_assets code_assets_link_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.code_assets
    ADD CONSTRAINT code_assets_link_fkey FOREIGN KEY (link) REFERENCES public.dcc_assets(link) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_asset_node dcc_asset_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_asset_node
    ADD CONSTRAINT dcc_asset_node_id_fkey FOREIGN KEY (id) REFERENCES public.node(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_asset_node dcc_asset_node_link_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_asset_node
    ADD CONSTRAINT dcc_asset_node_link_fkey FOREIGN KEY (link) REFERENCES public.dcc_assets(link) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_assets dcc_assets_creator_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_assets
    ADD CONSTRAINT dcc_assets_creator_fkey FOREIGN KEY (creator) REFERENCES public."User"(email) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dcc_assets dcc_assets_dcc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_assets
    ADD CONSTRAINT dcc_assets_dcc_id_fkey FOREIGN KEY (dcc_id) REFERENCES public.dccs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_outreach dcc_outreach_dcc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_outreach
    ADD CONSTRAINT dcc_outreach_dcc_id_fkey FOREIGN KEY (dcc_id) REFERENCES public.dccs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_outreach dcc_outreach_outreach_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_outreach
    ADD CONSTRAINT dcc_outreach_outreach_id_fkey FOREIGN KEY (outreach_id) REFERENCES public.outreach(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_partnerships dcc_partnerships_dcc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_partnerships
    ADD CONSTRAINT dcc_partnerships_dcc_id_fkey FOREIGN KEY (dcc_id) REFERENCES public.dccs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_partnerships dcc_partnerships_partnership_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_partnerships
    ADD CONSTRAINT dcc_partnerships_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.partnerships(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_publications dcc_publications_dcc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_publications
    ADD CONSTRAINT dcc_publications_dcc_id_fkey FOREIGN KEY (dcc_id) REFERENCES public.dccs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_publications dcc_publications_publication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_publications
    ADD CONSTRAINT dcc_publications_publication_id_fkey FOREIGN KEY (publication_id) REFERENCES public.publications(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_usecase dcc_usecase_dcc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_usecase
    ADD CONSTRAINT dcc_usecase_dcc_id_fkey FOREIGN KEY (dcc_id) REFERENCES public.dccs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_usecase dcc_usecase_usecase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dcc_usecase
    ADD CONSTRAINT dcc_usecase_usecase_id_fkey FOREIGN KEY (usecase_id) REFERENCES public.usecase(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: entity_node entity_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_node
    ADD CONSTRAINT entity_node_id_fkey FOREIGN KEY (id) REFERENCES public.node(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: fair_assessments fair_assessments_dcc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fair_assessments
    ADD CONSTRAINT fair_assessments_dcc_id_fkey FOREIGN KEY (dcc_id) REFERENCES public.dccs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fair_assessments fair_assessments_link_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fair_assessments
    ADD CONSTRAINT fair_assessments_link_fkey FOREIGN KEY (link) REFERENCES public.dcc_assets(link) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: file_assets file_assets_link_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_assets
    ADD CONSTRAINT file_assets_link_fkey FOREIGN KEY (link) REFERENCES public.dcc_assets(link) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gene_entity gene_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_entity
    ADD CONSTRAINT gene_entity_id_fkey FOREIGN KEY (id) REFERENCES public.entity_node(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gene_set_library_node gene_set_library_node_dcc_asset_link_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_set_library_node
    ADD CONSTRAINT gene_set_library_node_dcc_asset_link_fkey FOREIGN KEY (dcc_asset_link) REFERENCES public.dcc_assets(link) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gene_set_library_node gene_set_library_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_set_library_node
    ADD CONSTRAINT gene_set_library_node_id_fkey FOREIGN KEY (id) REFERENCES public.node(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gene_set_node gene_set_node_gene_set_library_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_set_node
    ADD CONSTRAINT gene_set_node_gene_set_library_id_fkey FOREIGN KEY (gene_set_library_id) REFERENCES public.gene_set_library_node(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gene_set_node gene_set_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gene_set_node
    ADD CONSTRAINT gene_set_node_id_fkey FOREIGN KEY (id) REFERENCES public.node(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: kg_assertion kg_assertion_dcc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kg_assertion
    ADD CONSTRAINT kg_assertion_dcc_id_fkey FOREIGN KEY (dcc_id) REFERENCES public.dccs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: kg_assertion kg_assertion_relation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kg_assertion
    ADD CONSTRAINT kg_assertion_relation_id_fkey FOREIGN KEY (relation_id) REFERENCES public.kg_relation_node(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: kg_assertion kg_assertion_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kg_assertion
    ADD CONSTRAINT kg_assertion_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.entity_node(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: kg_assertion kg_assertion_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kg_assertion
    ADD CONSTRAINT kg_assertion_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.entity_node(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: kg_relation_node kg_relation_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kg_relation_node
    ADD CONSTRAINT kg_relation_node_id_fkey FOREIGN KEY (id) REFERENCES public.node(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: node node_dcc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_dcc_id_fkey FOREIGN KEY (dcc_id) REFERENCES public.dccs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: partnership_publications partnership_publications_partnership_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnership_publications
    ADD CONSTRAINT partnership_publications_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.partnerships(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: partnership_publications partnership_publications_publication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnership_publications
    ADD CONSTRAINT partnership_publications_publication_id_fkey FOREIGN KEY (publication_id) REFERENCES public.publications(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: publications publications_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publications
    ADD CONSTRAINT publications_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.tools(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: r03_publications r03_publications_publication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.r03_publications
    ADD CONSTRAINT r03_publications_publication_id_fkey FOREIGN KEY (publication_id) REFERENCES public.publications(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: r03_publications r03_publications_r03_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.r03_publications
    ADD CONSTRAINT r03_publications_r03_id_fkey FOREIGN KEY (r03_id) REFERENCES public.r03(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usecase usecase_creator_dcc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usecase
    ADD CONSTRAINT usecase_creator_dcc_id_fkey FOREIGN KEY (creator_dcc_id) REFERENCES public.dccs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: biosample fk_biosample_anatomy_4; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample
    ADD CONSTRAINT fk_biosample_anatomy_4 FOREIGN KEY (anatomy) REFERENCES sparc.anatomy(id);


--
-- Name: biosample_disease fk_biosample_disease_biosample_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES sparc.biosample(id_namespace, local_id);


--
-- Name: biosample_disease fk_biosample_disease_disease_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_disease
    ADD CONSTRAINT fk_biosample_disease_disease_2 FOREIGN KEY (disease) REFERENCES sparc.disease(id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_biosample_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES sparc.biosample(id_namespace, local_id);


--
-- Name: biosample_from_subject fk_biosample_from_subject_subject_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_from_subject
    ADD CONSTRAINT fk_biosample_from_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES sparc.subject(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_biosample_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES sparc.biosample(id_namespace, local_id);


--
-- Name: biosample_gene fk_biosample_gene_gene_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_gene
    ADD CONSTRAINT fk_biosample_gene_gene_2 FOREIGN KEY (gene) REFERENCES sparc.gene(id);


--
-- Name: biosample fk_biosample_id_namespace_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample
    ADD CONSTRAINT fk_biosample_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES sparc.id_namespace(id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_biosample_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES sparc.biosample(id_namespace, local_id);


--
-- Name: biosample_in_collection fk_biosample_in_collection_collection_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_in_collection
    ADD CONSTRAINT fk_biosample_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: biosample fk_biosample_project_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample
    ADD CONSTRAINT fk_biosample_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES sparc.project(id_namespace, local_id);


--
-- Name: biosample fk_biosample_sample_prep_method_3; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample
    ADD CONSTRAINT fk_biosample_sample_prep_method_3 FOREIGN KEY (sample_prep_method) REFERENCES sparc.sample_prep_method(id);


--
-- Name: biosample_substance fk_biosample_substance_biosample_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_biosample_1 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES sparc.biosample(id_namespace, local_id);


--
-- Name: biosample_substance fk_biosample_substance_substance_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.biosample_substance
    ADD CONSTRAINT fk_biosample_substance_substance_2 FOREIGN KEY (substance) REFERENCES sparc.substance(id);


--
-- Name: collection_anatomy fk_collection_anatomy_anatomy_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_anatomy_2 FOREIGN KEY (anatomy) REFERENCES sparc.anatomy(id);


--
-- Name: collection_anatomy fk_collection_anatomy_collection_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_anatomy
    ADD CONSTRAINT fk_collection_anatomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_collection_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_compound
    ADD CONSTRAINT fk_collection_compound_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: collection_compound fk_collection_compound_compound_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_compound
    ADD CONSTRAINT fk_collection_compound_compound_2 FOREIGN KEY (compound) REFERENCES sparc.compound(id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_collection_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: collection_defined_by_project fk_collection_defined_by_project_project_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_defined_by_project
    ADD CONSTRAINT fk_collection_defined_by_project_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES sparc.project(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_collection_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_disease
    ADD CONSTRAINT fk_collection_disease_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: collection_disease fk_collection_disease_disease_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_disease
    ADD CONSTRAINT fk_collection_disease_disease_2 FOREIGN KEY (disease) REFERENCES sparc.disease(id);


--
-- Name: collection_gene fk_collection_gene_collection_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_gene
    ADD CONSTRAINT fk_collection_gene_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: collection_gene fk_collection_gene_gene_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_gene
    ADD CONSTRAINT fk_collection_gene_gene_2 FOREIGN KEY (gene) REFERENCES sparc.gene(id);


--
-- Name: collection fk_collection_id_namespace_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection
    ADD CONSTRAINT fk_collection_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES sparc.id_namespace(id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_1 FOREIGN KEY (superset_collection_id_namespace, superset_collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: collection_in_collection fk_collection_in_collection_collection_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_in_collection
    ADD CONSTRAINT fk_collection_in_collection_collection_2 FOREIGN KEY (subset_collection_id_namespace, subset_collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_collection_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: collection_phenotype fk_collection_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_phenotype
    ADD CONSTRAINT fk_collection_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES sparc.phenotype(id);


--
-- Name: collection_protein fk_collection_protein_collection_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_protein
    ADD CONSTRAINT fk_collection_protein_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: collection_protein fk_collection_protein_protein_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_protein
    ADD CONSTRAINT fk_collection_protein_protein_2 FOREIGN KEY (protein) REFERENCES sparc.protein(id);


--
-- Name: collection_substance fk_collection_substance_collection_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_substance
    ADD CONSTRAINT fk_collection_substance_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: collection_substance fk_collection_substance_substance_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_substance
    ADD CONSTRAINT fk_collection_substance_substance_2 FOREIGN KEY (substance) REFERENCES sparc.substance(id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_collection_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_collection_1 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: collection_taxonomy fk_collection_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.collection_taxonomy
    ADD CONSTRAINT fk_collection_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxon) REFERENCES sparc.ncbi_taxonomy(id);


--
-- Name: dcc fk_dcc_project_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.dcc
    ADD CONSTRAINT fk_dcc_project_1 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES sparc.project(id_namespace, local_id);


--
-- Name: file fk_file_analysis_type_7; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file
    ADD CONSTRAINT fk_file_analysis_type_7 FOREIGN KEY (analysis_type) REFERENCES sparc.analysis_type(id);


--
-- Name: file fk_file_assay_type_6; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file
    ADD CONSTRAINT fk_file_assay_type_6 FOREIGN KEY (assay_type) REFERENCES sparc.assay_type(id);


--
-- Name: file fk_file_collection_8; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file
    ADD CONSTRAINT fk_file_collection_8 FOREIGN KEY (bundle_collection_id_namespace, bundle_collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: file fk_file_data_type_5; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file
    ADD CONSTRAINT fk_file_data_type_5 FOREIGN KEY (data_type) REFERENCES sparc.data_type(id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_biosample_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_biosample_2 FOREIGN KEY (biosample_id_namespace, biosample_local_id) REFERENCES sparc.biosample(id_namespace, local_id);


--
-- Name: file_describes_biosample fk_file_describes_biosample_file_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_describes_biosample
    ADD CONSTRAINT fk_file_describes_biosample_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES sparc.file(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_collection_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: file_describes_collection fk_file_describes_collection_file_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_describes_collection
    ADD CONSTRAINT fk_file_describes_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES sparc.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_file_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES sparc.file(id_namespace, local_id);


--
-- Name: file_describes_subject fk_file_describes_subject_subject_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_describes_subject
    ADD CONSTRAINT fk_file_describes_subject_subject_2 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES sparc.subject(id_namespace, local_id);


--
-- Name: file fk_file_file_format_3; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file
    ADD CONSTRAINT fk_file_file_format_3 FOREIGN KEY (file_format) REFERENCES sparc.file_format(id);


--
-- Name: file fk_file_file_format_4; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file
    ADD CONSTRAINT fk_file_file_format_4 FOREIGN KEY (compression_format) REFERENCES sparc.file_format(id);


--
-- Name: file fk_file_id_namespace_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file
    ADD CONSTRAINT fk_file_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES sparc.id_namespace(id);


--
-- Name: file_in_collection fk_file_in_collection_collection_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: file_in_collection fk_file_in_collection_file_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file_in_collection
    ADD CONSTRAINT fk_file_in_collection_file_1 FOREIGN KEY (file_id_namespace, file_local_id) REFERENCES sparc.file(id_namespace, local_id);


--
-- Name: file fk_file_project_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.file
    ADD CONSTRAINT fk_file_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES sparc.project(id_namespace, local_id);


--
-- Name: gene fk_gene_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.gene
    ADD CONSTRAINT fk_gene_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES sparc.ncbi_taxonomy(id);


--
-- Name: phenotype_disease fk_phenotype_disease_disease_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_disease_2 FOREIGN KEY (disease) REFERENCES sparc.disease(id);


--
-- Name: phenotype_disease fk_phenotype_disease_phenotype_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.phenotype_disease
    ADD CONSTRAINT fk_phenotype_disease_phenotype_1 FOREIGN KEY (phenotype) REFERENCES sparc.phenotype(id);


--
-- Name: phenotype_gene fk_phenotype_gene_gene_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_gene_2 FOREIGN KEY (gene) REFERENCES sparc.gene(id);


--
-- Name: phenotype_gene fk_phenotype_gene_phenotype_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.phenotype_gene
    ADD CONSTRAINT fk_phenotype_gene_phenotype_1 FOREIGN KEY (phenotype) REFERENCES sparc.phenotype(id);


--
-- Name: project fk_project_id_namespace_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.project
    ADD CONSTRAINT fk_project_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES sparc.id_namespace(id);


--
-- Name: project_in_project fk_project_in_project_project_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_1 FOREIGN KEY (parent_project_id_namespace, parent_project_local_id) REFERENCES sparc.project(id_namespace, local_id);


--
-- Name: project_in_project fk_project_in_project_project_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.project_in_project
    ADD CONSTRAINT fk_project_in_project_project_2 FOREIGN KEY (child_project_id_namespace, child_project_local_id) REFERENCES sparc.project(id_namespace, local_id);


--
-- Name: protein_gene fk_protein_gene_gene_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.protein_gene
    ADD CONSTRAINT fk_protein_gene_gene_2 FOREIGN KEY (gene) REFERENCES sparc.gene(id);


--
-- Name: protein_gene fk_protein_gene_protein_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.protein_gene
    ADD CONSTRAINT fk_protein_gene_protein_1 FOREIGN KEY (protein) REFERENCES sparc.protein(id);


--
-- Name: protein fk_protein_ncbi_taxonomy_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.protein
    ADD CONSTRAINT fk_protein_ncbi_taxonomy_1 FOREIGN KEY (organism) REFERENCES sparc.ncbi_taxonomy(id);


--
-- Name: subject_disease fk_subject_disease_disease_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_disease
    ADD CONSTRAINT fk_subject_disease_disease_2 FOREIGN KEY (disease) REFERENCES sparc.disease(id);


--
-- Name: subject_disease fk_subject_disease_subject_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_disease
    ADD CONSTRAINT fk_subject_disease_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES sparc.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_id_namespace_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject
    ADD CONSTRAINT fk_subject_id_namespace_1 FOREIGN KEY (id_namespace) REFERENCES sparc.id_namespace(id);


--
-- Name: subject_in_collection fk_subject_in_collection_collection_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_collection_2 FOREIGN KEY (collection_id_namespace, collection_local_id) REFERENCES sparc.collection(id_namespace, local_id);


--
-- Name: subject_in_collection fk_subject_in_collection_subject_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_in_collection
    ADD CONSTRAINT fk_subject_in_collection_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES sparc.subject(id_namespace, local_id);


--
-- Name: subject_phenotype fk_subject_phenotype_phenotype_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_phenotype_2 FOREIGN KEY (phenotype) REFERENCES sparc.phenotype(id);


--
-- Name: subject_phenotype fk_subject_phenotype_subject_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_phenotype
    ADD CONSTRAINT fk_subject_phenotype_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES sparc.subject(id_namespace, local_id);


--
-- Name: subject fk_subject_project_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject
    ADD CONSTRAINT fk_subject_project_2 FOREIGN KEY (project_id_namespace, project_local_id) REFERENCES sparc.project(id_namespace, local_id);


--
-- Name: subject_race fk_subject_race_subject_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_race
    ADD CONSTRAINT fk_subject_race_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES sparc.subject(id_namespace, local_id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_ncbi_taxonomy_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_ncbi_taxonomy_2 FOREIGN KEY (taxonomy_id) REFERENCES sparc.ncbi_taxonomy(id);


--
-- Name: subject_role_taxonomy fk_subject_role_taxonomy_subject_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_role_taxonomy
    ADD CONSTRAINT fk_subject_role_taxonomy_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES sparc.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_subject_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_substance
    ADD CONSTRAINT fk_subject_substance_subject_1 FOREIGN KEY (subject_id_namespace, subject_local_id) REFERENCES sparc.subject(id_namespace, local_id);


--
-- Name: subject_substance fk_subject_substance_substance_2; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.subject_substance
    ADD CONSTRAINT fk_subject_substance_substance_2 FOREIGN KEY (substance) REFERENCES sparc.substance(id);


--
-- Name: substance fk_substance_compound_1; Type: FK CONSTRAINT; Schema: sparc; Owner: -
--

ALTER TABLE ONLY sparc.substance
    ADD CONSTRAINT fk_substance_compound_1 FOREIGN KEY (compound) REFERENCES sparc.compound(id);


--
-- Name: _private_job_queues; Type: ROW SECURITY; Schema: graphile_worker; Owner: -
--

ALTER TABLE graphile_worker._private_job_queues ENABLE ROW LEVEL SECURITY;

--
-- Name: _private_jobs; Type: ROW SECURITY; Schema: graphile_worker; Owner: -
--

ALTER TABLE graphile_worker._private_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: _private_known_crontabs; Type: ROW SECURITY; Schema: graphile_worker; Owner: -
--

ALTER TABLE graphile_worker._private_known_crontabs ENABLE ROW LEVEL SECURITY;

--
-- Name: _private_tasks; Type: ROW SECURITY; Schema: graphile_worker; Owner: -
--

ALTER TABLE graphile_worker._private_tasks ENABLE ROW LEVEL SECURITY;

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
    ('20241203203122');
