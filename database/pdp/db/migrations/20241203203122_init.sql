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
create unique index on "pdp"."entity" ("id");
create index on "pdp"."entity" ("type", "id");
create index on "pdp"."entity" using gin (jsonb_to_tsvector('english', "attributes", '"all"'));
create index on "pdp"."entity" ("pagerank");

create index on "pdp"."entity" ("pagerank", "type", "id");

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
create index on "pdp"."relationship" ("target_type", "target_id");

create index on "pdp"."relationship" ("target_id");
create index on "pdp"."relationship" ("source_id");

create view "api"."relationship" as
select * from "pdp"."relationship";

create or replace function "api"."search_entity"("search" varchar)
returns setof "api"."entity" as $$
  select "source".*
  from "pdp"."entity" "source"
  where jsonb_to_tsvector('english', "source"."attributes", '"all"') @@ websearch_to_tsquery('english', "search")
  order by "source"."pagerank";
$$ language sql strict immutable parallel safe;
comment on function "api"."search_entity" is E'@filterable';

create or replace function "api"."entity_relationships"(entity "api"."entity")
returns setof "api"."entity" as $$
  select "target".*
  from "pdp"."entity" "target"
  where exists (select 1 from "pdp"."relationship" where ("relationship"."target_type", "relationship"."target_id") = ("target"."type", "target"."id") and ("relationship"."source_type", "relationship"."source_id") = ("entity"."type", "entity"."id") limit 1)
union
  select "source".*
  from "pdp"."entity" "source"
  where exists (select 1 from "pdp"."relationship" where ("relationship"."source_type", "relationship"."source_id") = ("source"."type", "source"."id") and ("relationship"."target_type", "relationship"."target_id") = ("entity"."type", "entity"."id") limit 1)
order by "pagerank"
;
$$ language sql strict immutable parallel safe;
comment on function "api"."entity_relationships" is E'@filterable';

-- migrate:down
drop schema "pdp" cascade;
drop schema "api" cascade;
