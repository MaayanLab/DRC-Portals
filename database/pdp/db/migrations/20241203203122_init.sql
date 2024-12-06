-- migrate:up
create schema "pdp";
create schema "api";

create table "pdp"."entity" (
  "type" varchar not null,
  "id" uuid,
  "attributes" jsonb not null,
  "pagerank" float default 0,
  primary key ("type", "id")
) partition by list ("type");
create index on "pdp"."entity" using gin (jsonb_to_tsvector('english', "attributes", '"all"'));
create index on "pdp"."entity" ("pagerank");

create view "api"."entity" as
select * from "pdp"."entity";

create table "pdp"."relationship" (
  "source_type" varchar not null,
  "source_id" uuid not null,
  "predicate" varchar not null,
  "target_type" varchar not null,
  "target_id" uuid not null,
  primary key ("predicate", "source_id", "target_id"),
  foreign key ("source_type", "source_id") references "pdp"."entity" ("type", "id"),
  foreign key ("target_type", "target_id") references "pdp"."entity" ("type", "id")
) partition by list ("predicate");
create index on "pdp"."relationship" ("source_type");
create index on "pdp"."relationship" ("target_type");

create view "api"."relationship" as
select * from "pdp"."relationship";

create or replace function "api"."search_entity"("search" varchar)
returns setof "api"."entity" as $$
  select *
  from "pdp"."entity" "source"
  where jsonb_to_tsvector('english', "source"."attributes", '"all"') @@ websearch_to_tsquery('english', "search");
$$ language sql strict immutable parallel safe;

create or replace function "api"."entity_relationships"(entity "api"."entity")
returns setof "api"."entity" as $$
  select "target".*
  from "pdp"."relationship"
  inner join "pdp"."entity" "target" on ("target"."type", "target"."id") = ("relationship"."target_type", "relationship"."target_id")
  where (source_type, source_id) = (entity.type, entity.id);
$$ language sql strict immutable parallel safe;
comment on function "api"."entity_relationships" is E'@filterable';

-- migrate:down
drop schema "pdp" cascade;
drop schema "api" cascade;
