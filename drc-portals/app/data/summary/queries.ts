const metadata_files = `
select
  file_assets.filetype,
  file_assets.filetype,
  count(*) as files,
  count(distinct dcc_assets.dcc_id) as distinct_dccs,
  sum(file_assets.size)/1e9 as total_size_gb
from dcc_assets
inner join file_assets on dcc_assets.link = file_assets.link
inner join dccs on dccs.id = dcc_assets.dcc_id
where current = true
and deleted = false
group by file_assets.filetype
order by total_size_gb desc;
`

const metadata_entities = `
select
  node.type type, entity_node.type as entity_type,
  count(node.id) as entities,
  count(distinct dcc_id) as distinct_dccs
from node
left join entity_node on node.id = entity_node.id
group by node.type, entity_node.type
order by entities desc;
`
const metadata_source_assertions = `
select
  entity_node.type,
  count(distinct entity_node.id) as distinct_source_entities,
  count(distinct kg_assertion.dcc_id) as distinct_dccs,
  count(kg_assertion.id) as assertions
from kg_assertion
inner join entity_node on kg_assertion.source_id = entity_node.id
group by entity_node.type
order by assertions desc;
`
const metadata_target_assertions = `
select
  entity_node.type,
  count(distinct entity_node.id) as distinct_target_entities,
  count(distinct kg_assertion.dcc_id) as distinct_dccs,
  count(kg_assertion.id) as assertions
from kg_assertion
inner join entity_node on kg_assertion.target_id = entity_node.id
group by entity_node.type
order by assertions desc;
`

const data_volume = `
select
  count(*) as files,
  count(distinct id_namespace) as distinct_id_namespaces,
  count(distinct file_format) as distinct_file_formats,
  count(distinct data_type) as distinct_data_types,
  count(distinct assay_type) as distinct_assay_types,
  sum(size_in_bytes::numeric)/1e15 as total_size_pb,
  sum(coalesce(uncompressed_size_in_bytes,size_in_bytes)::numeric)/1e15 as uncompressed_total_size_pb
from c2m2.file
order by files desc;
`

const data_volume_by_assay = `
with summary as (
  select
    assay_type,
    count(*) as files,
    count(distinct id_namespace) as distinct_id_namespaces,
    count(distinct file_format) as distinct_file_formats,
    count(distinct data_type) as distinct_data_types,
    sum(size_in_bytes::numeric)/1e9 as total_size_gb,
    sum(coalesce(uncompressed_size_in_bytes,size_in_bytes)::numeric)/1e9 as uncompressed_total_size_gb
  from c2m2.file
  group by assay_type
)
select
  summary.assay_type as assay_type_id,
  coalesce(at.name, 'No Assay Specified') as assay_type,
  summary.files,
  summary.distinct_id_namespaces,
  summary.distinct_file_formats,
  summary.distinct_data_types,
  summary.total_size_gb,
  summary.uncompressed_total_size_gb
from summary
left join c2m2.assay_type at on at.id = summary.assay_type
order by summary.files desc;
`
