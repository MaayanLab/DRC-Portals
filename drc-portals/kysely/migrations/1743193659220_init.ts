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
			NEW.id := uuid_generate_v5(
				uuid_generate_v5('00000000-0000-0000-0000-000000000000', NEW.type),
				(jsonb_build_object('@id', NEW.slug) || NEW.attributes)::text
			);
			NEW.slug = coalesce(NEW.slug, NEW.id::varchar);
			NEW.searchable = jsonb_to_tsvector('english', jsonb_build_object('@type', NEW.type) || NEW.attributes, '"all"');
			insert into pdp._entity (id, slug, type, attributes, searchable, pagerank)
			values (NEW.id, NEW.slug, NEW.type, NEW.searchable, 0)
			on conflict (id)
			do nothing;
		end;
		$$ language plpgsql;
		create trigger entity_insert_trigger instead of insert on pdp.entity
		for each row execute function pdp.entity_insert();

		-- copy into this table to load the entities
		create table pdp.entity_ingest as (
			slug varchar,
			type varchar not null,
			attributes jsonb not null
		);
		create function pdp.entity_ingest_insert() returns trigger
		as $$
		begin
			insert into pdp.entity (slug, type, attributes)
			delete from pdp.entity_ingest
			returning row.slug, row.type, row.attributes;
		end;
		$$ language plpgsql;
		create trigger entity_ingest_insert_trigger after insert on pdp.entity_ingest
		for each statement execute function pdp.entity_ingest_insert();

		create table pdp._edge (
			predicate varchar not null,
			source_id uuid references pdp.entity (id),
			target_id uuid references pdp.entity (id),
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
					values (NEW.predicate, NEW.source_id, NEW.target_id);
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
			return NEW;
		end;
		$$ language plpgsql;
		create trigger edge_insert_trigger instead of insert on pdp.edge
		for each row execute function pdp.edge_insert();

		-- insert into this table to load the entities
		create table pdp.edge_ingest as (
			source uuid not null,
			predicate varchar not null,
			target uuid not null
		);
		create function pdp.edge_ingest_insert() returns trigger
		as $$
		begin
			insert into pdp.edge (source, predicate, target)
			delete from pdp.edge_ingest
			returning row.source, row.predicate row.target;
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
