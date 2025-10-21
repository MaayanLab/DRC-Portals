#!/bin/sh

es() {
  METHOD=$1
  PATH=$2
  curl -H'Content-Type: application/json'-X${METHOD} http://elastic:drcpass@localhost:9200${PATH} -d @-
}

es_transform_execute() {
  transform=$1
  es POST /_transform/${transform}/_start
  while true; do
    STATUS="$(es GET /_transform/${transform}/_stats | jq -r '.transforms[0].state')"
    printf "$STATUS\r"
    if [[ "$STATUS" == "stopped" ]]; then
      break
    fi
    sleep 1
  done
}

# create index for entity
es PUT /entity_v1 << EOF
{
  "mappings": {
    "properties": {
      "id": {"type": "keyword"},
      "type": {"type": "keyword"},
      "slug": {"type": "keyword"},
      "pagerank": {"type": "long"}
    }
  }
}
EOF

es POST /_aliases << EOF
{
  "actions": [
    { "add": { "index": "entity_v1", "alias": "entity_staging" } }
  ]
}
EOF

# create index for m2m
es PUT /m2m_v1 << EOF
{
  "mappings": {
    "properties": {
      "source_id": {"type": "keyword"},
      "predicate": {"type": "keyword"},
      "target_id": {"type": "keyword"}
    }
  }
}
EOF
es POST /_aliases << EOF
{
  "actions": [
    { "add": { "index": "m2m_v1", "alias": "m2m_staging" } }
  ]
}
EOF

# actually ingest data (can happen in parallel)
../.venv/bin/python ingest_dcc_assets.py
../.venv/bin/python ingest_gmts.py
../.venv/bin/python ingest_c2m2_files.py
../.venv/bin/python ingest_kg.py

# STEP 1.1 provide a way to get entity from id
es PUT /_enrich/policy/entity_lookup << EOF
{
  "match": {
    "indices": "entity_staging",
    "match_field": "id",
    "enrich_fields": ["id", "slug", "type", "a_*"]
  }
}
EOF

# STEP 1.2 use m2m to compute pagerank & get predicate counts
es PUT /_transform/entity_relations << EOF
{
  "source": { "index": "m2m_staging" },
  "dest": { "index": "entity_relations" },
  "pivot": {
    "group_by": {
      "target_id": { "terms": { "field": "target_id" } }
    },
    "aggregations": {
      "pagerank": { "value_count": { "field": "source_id" } },
      "predicates": {
        "terms": { "field": "predicate" },
        "aggs": {
          "source_count": { "cardinality": { "field": "source_id" } },
          "last_source_id": {
            "scripted_metric": {
              "init_script": "state.hit = null",
              "map_script": "if (state.hit == null) { state.hit = doc.source_id.value }",
              "combine_script": "return state.hit",
              "reduce_script": "for (s in states) { if (s != null) return s; } return null"
            }
          }
        }
      }
    }
  }
}
EOF

es POST /_enrich/policy/entity_lookup/_execute
es_transform_execute entity_relations

# wait for both of these to complete


# step 2 assemble entity with pagecount & all relations
es PUT /_ingest/pipeline/entity_complete << EOF
{
  "processors": [
    {
      "enrich": {
        "policy_name": "entity_lookup",
        "field": "target_id",
        "target_field": "entity_data"
      }
    },
    {
      "script": {
        "lang": "painless",
        "source": "
          ctx.id = ctx.target_id;
          ctx.remove('target_id');

          if (ctx.entity_data != null) {
            for (entry in ctx.entity_data.entrySet()) {
              ctx[entry.getKey()] = entry.getValue();
            }
          }
          if (ctx.predicates != null) {
            for (entry in ctx.predicates.entrySet()) {
              def key = entry.getKey();
              def value = entry.getValue();
              if (value.source_count == 1 && value.last_source_id != null) {
                ctx['r_' + key] = value.last_source_id;
              }
            }
          }
        "
      }
    }
  ]
}
EOF

es POST /_reindex << EOF
{
  "source": {
    "index": "entity_relations"
  },
  "dest": {
    "index": "entity_complete_v2",
    "pipeline": "entity_complete"
  }
}
EOF

curl -H'Content-Type: application/json' -XGET 'http://elastic:drcpass@localhost:9200/entity_staging/_search?pretty' -d @- << EOF
{"size":5,"query":{"match_all":{}}}
EOF

# step 3: 


curl -H'Content-Type: application/json' -XDELETE http://elastic:drcpass@localhost:9200/_transform/m2m_pagerank
curl -H'Content-Type: application/json' -XPUT http://elastic:drcpass@localhost:9200/_transform/m2m_pagerank -d '
{
  "source": { "index": "m2m" },
  "dest": { "index": "entity_pagerank" },
  "pivot": {
    "group_by": {
      "target_id": { "terms": { "field": "target_id.keyword" } }
    },
    "aggregations": {
      "pagerank": { "value_count": { "field": "source_id.keyword" } }
    }
  }
}
'
curl -H'Content-Type: application/json' -XPOST http://elastic:drcpass@localhost:9200/_transform/m2m_pagerank/_start
# check status
while true; do
  STATUS="$(curl -s -H'Content-Type: application/json' -XGET http://elastic:drcpass@localhost:9200/_transform/m2m_pagerank/_stats | jq -r '.transforms[0].state')"
  printf "$STATUS\r"
  if [[ "$STATUS" == "stopped" ]]; then
    break
  fi
  sleep 1
done

curl -H'Content-Type: application/json' -XPUT http://elastic:drcpass@localhost:9200/_enrich/policy/pagerank-enrich -d '
{
  "match": {
    "indices": "entity_pagerank",
    "match_field": "target_id",
    "enrich_fields": ["pagerank"]
  }
}
'
curl -H'Content-Type: application/json' -XPOST http://elastic:drcpass@localhost:9200/_enrich/policy/pagerank-enrich/_execute
curl -H'Content-Type: application/json' -XPUT http://elastic:drcpass@localhost:9200/_ingest/pipeline/complete_entity -d '
{
  "processors": [
    {
      "set": {
        "field": "id",
        "value": "{{_id}}"
      }
    },
    {
      "enrich": {
        "policy_name": "pagerank-enrich",
        "field": "id",
        "target_field": "pagerank_data"
      }
    },
    {
      "set": {
        "field": "pagerank",
        "value": "{{pagerank_data.pagerank}}",
        "ignore_failure": true
      }
    },
    {
      "remove": {
        "field": "pagerank_data",
        "ignore_failure": true
      }
    }
  ]
}
'
curl -H'Content-Type: application/json' -XPOST 'http://elastic:drcpass@localhost:9200/entity/_update_by_query?pipeline=complete_entity'


# expand target_id
curl -H'Content-Type: application/json' -XDELETE http://elastic:drcpass@localhost:9200/_ingest/pipeline/m2m_expand
curl -H'Content-Type: application/json' -XDELETE http://elastic:drcpass@localhost:9200/_enrich/policy/entity-lookup
curl -H'Content-Type: application/json' -XPUT http://elastic:drcpass@localhost:9200/_enrich/policy/entity-lookup -d '
{
  "match": {
    "indices": "entity",
    "match_field": "_id",
    "enrich_fields": ["slug", "type", "pagerank", "a_*"]
  }
}
'
curl -H'Content-Type: application/json' -XPOST http://elastic:drcpass@localhost:9200/_enrich/policy/entity-lookup/_execute

curl -H'Content-Type: application/json' -XPUT http://elastic:drcpass@localhost:9200/_ingest/pipeline/m2m_expand -d '
{
  "processors": [
    {
      "enrich": {
        "policy_name": "entity-lookup",
        "field": "target_id",
        "target_field": "target"
      }
    }
  ]
}
'

curl -H'Content-Type: application/json' -XPOST http://elastic:drcpass@localhost:9200/_reindex -d '
{
  "source": { "index": "m2m" },
  "dest": { "index": "m2m_target_expanded2", "pipeline": "m2m_expand" }
}
'

