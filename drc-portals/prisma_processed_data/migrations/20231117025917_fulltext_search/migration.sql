/*
  This is a manually constructed migration
*/
create function create_xidentity_fulltext_index() returns trigger
as $$
BEGIN
  NEW.searchable := NEW."label" || ' ' || NEW."description";
  return NEW;
END;
$$ language plpgsql;

create trigger create_xidentity_fulltext_index_trigger
before insert or update on "xidentity"
for each row execute function create_xidentity_fulltext_index();

create index "xidentity_description_fts" on "xidentity" using gin (
  to_tsvector('english'::regconfig, "description")
);

create index "xidentity_searchable_fts" on "xidentity" using gin (
  to_tsvector('english'::regconfig, "searchable")
);

create extension if not exists pg_trgm;
create index "xidentity_label_trgm" on "xidentity" using gin ("label" gin_trgm_ops);
