import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createSchema('pdp')
		.execute()
	await sql`
		create table pdp._entity (
			id uuid primary key,
			slug varchar not null,
			type varchar not null,
			attributes jsonb not null,
			searchable tsvector not null,
			pagerank bigint not null,
			unique (type, slug)
		);
		create view pdp.entity as select * from pdp._entity;

		-- this trigger
		--  1. ensures that entity ids are hashed based on the content providing deduplication
		--  2. defaults the slug to the id
		--  3. constructs the searchable tsvector
		--  4. returns the existing pagerank
		create function pdp.entity_insert() returns trigger
		as $$
		begin
			if NEW.id is null then
				NEW.id := uuid_generate_v5(
					uuid_generate_v5('00000000-0000-0000-0000-000000000000', NEW.type),
					NEW.attributes::text
				);
			end if;
			if NEW.slug is null then
				NEW.slug = NEW.id::varchar;
			end if;
			NEW.searchable = jsonb_to_tsvector('english', jsonb_build_object('@type', NEW.type) || NEW.attributes, '"all"');
			insert into pdp._entity (id, slug, type, attributes, searchable, pagerank)
			values (NEW.id, NEW.slug, NEW.type, NEW.attributes, NEW.searchable, 0)
			on conflict (id)
			do nothing
			returning pagerank
			into NEW.pagerank;
			return NEW;
		end;
		$$ language plpgsql;
		create trigger entity_insert_trigger instead of insert on pdp.entity
		for each row execute function pdp.entity_insert();

		-- copy into this table to load the entities
		create table pdp.entity_ingest (
			id uuid,
			slug varchar,
			type varchar not null,
			attributes jsonb not null
		);
		create function pdp.entity_ingest_insert() returns trigger
		as $$
		begin
			with deleted_entity_ingest as (
				delete from pdp.entity_ingest
				returning id, slug, type, attributes
			)
			insert into pdp.entity (id, slug, type, attributes)
			select * from deleted_entity_ingest;
			return null;
		end;
		$$ language plpgsql;
		create trigger entity_ingest_insert_trigger after insert on pdp.entity_ingest
		for each statement execute function pdp.entity_ingest_insert();

		create table pdp._edge (
			predicate varchar not null,
			source_id uuid references pdp._entity (id) on delete cascade,
			target_id uuid references pdp._entity (id) on delete cascade,
			primary key (target_id, source_id, predicate)
		) partition by list (predicate);

		-- this trigger
		--  1. ensures that the partition for the predicate is created when needed
		create view pdp.edge as select * from pdp._edge;
		create function pdp.edge_insert() returns trigger
		as $$
		begin
			loop
				begin
					insert into pdp._edge (predicate, source_id, target_id)
					values (NEW.predicate, NEW.source_id, NEW.target_id)
					on conflict (predicate, source_id, target_id) do nothing;
				exception when SQLSTATE '23514' then
					raise info 'Creating partition for %', NEW.predicate;
					execute format(
						'create table pdp."_edge__%s" partition of pdp._edge for values in (%L);',
						uuid_generate_v5('00000000-0000-0000-0000-000000000000', NEW.predicate)::text,
						NEW.predicate
					);
					continue;
				end;
    		exit;
			end loop;
			update pdp._entity set pagerank = pagerank + 1 where id = NEW.source_id or id = NEW.target_id;
			return NEW;
		end;
		$$ language plpgsql;
		create trigger edge_insert_trigger instead of insert on pdp.edge
		for each row execute function pdp.edge_insert();

		-- insert into this table to load the entities in bulk
		create table pdp.edge_ingest (
			source_id uuid not null references pdp._entity (id),
			predicate varchar not null,
			target_id uuid not null references pdp._entity (id)
		);
		create or replace function pdp.edge_ingest_insert() returns trigger
		as $$
		declare
			row varchar;
		begin
		  -- process all the rows currently in the edge_ingest table
			create temporary table deleted_edge_ingest on commit drop as
			with deleted_edge_ingest as (delete from pdp.edge_ingest returning *)
			select * from deleted_edge_ingest;
			-- bulk update entity pageranks
			insert into pdp._entity
			select e.id, e.slug, e.type, e.attributes, e.searchable, (e.pagerank + r.pagerank) as pagerank
			from pdp._entity e
			inner join (
				select r.id, count(r.id) as pagerank
				from (
					select source_id as id from deleted_edge_ingest
					union all
					select target_id as id from deleted_edge_ingest
				) r
				group by r.id
			) r on r.id = e.id
			on conflict (id)
			do update set pagerank = excluded.pagerank;
			-- create any missing partitions
			for row in (
				select distinct predicate
				from deleted_edge_ingest
				where not exists (
					select from information_schema.tables
					where table_schema = 'pdp'
					and table_name = '_edge__' || uuid_generate_v5('00000000-0000-0000-0000-000000000000', predicate)::text
				)
			) loop
				execute format(
					'create table pdp."_edge__%s" partition of pdp._edge for values in (%L);',
					uuid_generate_v5('00000000-0000-0000-0000-000000000000', row)::text,
					row
				);
			end loop;
			-- bulk add the edges
			insert into pdp._edge (source_id, predicate, target_id)
			select * from deleted_edge_ingest
			on conflict (source_id, predicate, target_id) do nothing;
			return null;
		end;
		$$ language plpgsql;
		create trigger edge_ingest_insert_trigger after insert on pdp.edge_ingest
		for each statement execute function pdp.edge_ingest_insert();
	`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.dropSchema('pdp')
		.cascade()
		.execute()
}
