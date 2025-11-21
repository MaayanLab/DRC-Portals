#!/bin/sh

ELASTICSEARCH_URL=$(dotenv -f ../drc-portals/.env get ELASTICSEARCH_URL)
INDEX_VERSION=v11

es() {
  method=$1; shift
  path=$1; shift
  curl -H'Content-Type: application/json' -X${method} ${ELASTICSEARCH_URL}${path} $@
}

es_put() {
  es $@ -d @-
}

# create index for entity
es_put PUT /entity_${INDEX_VERSION} << EOF
{
  "settings": {
    "analysis": {
      "analyzer": {
        "custom_analyzer": {
          "tokenizer": "custom_tokenizer",
          "filter": [
            "lowercase",
            "asciifolding"
          ]
        }
      },
      "tokenizer": {
        "custom_tokenizer": {
          "type": "simple_pattern_split",
          "pattern": "[^a-zA-Z0-9']",
          "lowercase": true
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": {"type": "keyword"},
      "type": {"type": "keyword"},
      "slug": {"type": "keyword"},
      "pagerank": {"type": "long"}
    },
    "dynamic_templates": [
      {
        "attributes": {
          "match_mapping_type": "string",
          "match": "a_*",
          "mapping": {
            "type": "text",
            "analyzer": "custom_analyzer",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          }
        }
      },
      {
        "relationships": {
          "match_mapping_type": "string",
          "match": "r_*",
          "mapping": {
            "type": "keyword"
          }
        }
      }
    ]
  }
}
EOF

# create index for m2m
es_put PUT /m2m_${INDEX_VERSION} << EOF
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

es_put POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "entity_staging" } }]}
EOF
es_put POST /_aliases << EOF
{"actions": [{ "add": { "index": "entity_${INDEX_VERSION}", "alias": "entity_staging" } }]}
EOF
es_put POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "m2m_staging" } }]}
EOF
es_put POST /_aliases << EOF
{"actions": [{ "add": { "index": "m2m_${INDEX_VERSION}", "alias": "m2m_staging" } }]}
EOF

# actually ingest data (can happen in parallel)
../.venv/bin/python ingest_dcc_assets.py
../.venv/bin/python ingest_gmts.py
../.venv/bin/python ingest_c2m2_files.py
../.venv/bin/python ingest_kg.py

es_put POST /_aliases << EOF
{
  "actions": [
    { "remove": { "index": "entity_${INDEX_VERSION}", "alias": "entity_staging" } },
    { "remove": { "index": "m2m_${INDEX_VERSION}", "alias": "m2m_staging" } }
  ]
}
EOF

# sanity checks
(es_put POST /entity_${INDEX_VERSION}/_search|jq '.') << EOF
{"query":{"match_all":{}}, "size":10,"sort":[{"pagerank":{"order": "desc"}}]}
EOF
(es_put POST /m2m_${INDEX_VERSION}/_search|jq '.') << EOF
{"query":{"match_all":{}}, "size":10}
EOF

# provide a way to get entity from id
es_put PUT /_enrich/policy/entity_${INDEX_VERSION}_lookup << EOF
{
  "match": {
    "indices": "entity_${INDEX_VERSION}",
    "match_field": "id",
    "enrich_fields": ["id", "slug", "type", "pagerank", "a_*", "r_*"]
  }
}
EOF
es POST /_enrich/policy/entity_${INDEX_VERSION}_lookup/_execute

es_put PUT /_ingest/pipeline/m2m_${INDEX_VERSION}_target_expanded << EOF
{
  "processors": [
    {
      "enrich": {
        "policy_name": "entity_${INDEX_VERSION}_lookup",
        "field": "target_id",
        "target_field": "target"
      }
    },
    {
      "script": {
        "lang": "painless",
        "source": "
          if (ctx.target != null) {
            for (entry in ctx.target.entrySet()) {
              ctx['target_' + entry.getKey()] = entry.getValue();
            }
            ctx.remove('target');
          }
        "
      }
    }
  ]
}
EOF

# create index for m2m
es_put PUT /m2m_${INDEX_VERSION}_target_expanded << EOF
{
  "settings": {
    "analysis": {
      "analyzer": {
        "custom_analyzer": {
          "tokenizer": "custom_tokenizer",
          "filter": [
            "lowercase",
            "asciifolding"
          ]
        }
      },
      "tokenizer": {
        "custom_tokenizer": {
          "type": "simple_pattern_split",
          "pattern": "[^a-zA-Z0-9']",
          "lowercase": true
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "source_id": {"type": "keyword"},
      "predicate": {"type": "keyword"},
      "target_id": {"type": "keyword"},
      "target_type": {"type": "keyword"},
      "target_slug": {"type": "keyword"},
      "target_pagerank": {"type": "long"}
    },
    "dynamic_templates": [
      {
        "target_attributes": {
          "match_mapping_type": "string",
          "match": "target_a_*",
          "mapping": {
            "type": "text",
            "analyzer": "custom_analyzer",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          }
        }
      },
      {
        "target_relationships": {
          "match_mapping_type": "string",
          "match": "target_r_*",
          "mapping": {
            "type": "keyword"
          }
        }
      }
    ]
  }
}
EOF

es_put POST /_reindex << EOF
{
  "source": {
    "index": "m2m_${INDEX_VERSION}"
  },
  "dest": {
    "index": "m2m_${INDEX_VERSION}_target_expanded",
    "pipeline": "m2m_${INDEX_VERSION}_target_expanded"
  }
}
EOF

es_put PUT /_enrich/policy/m2m_${INDEX_VERSION}_target_expanded_lookup << EOF
{
  "match": {
    "indices": "m2m_${INDEX_VERSION}_target_expanded",
    "match_field": "source_id",
    "enrich_fields": ["predicate", "target_id", "target_slug", "target_type", "target_a_*"],
    "query": {"query_string": {"query":"-predicate:inv_*"}}
  }
}
EOF

es POST /_enrich/policy/m2m_${INDEX_VERSION}_target_expanded_lookup/_execute

es GET "/entity_${INDEX_VERSION}/_field_caps?fields=r_*" | jq -rc '{
  "processors": [
    .fields|keys|.[]|{"enrich":{
      "policy_name": "entity_" + $INDEX_VERSION + "_lookup",
      "field": .,
      "target_field": .,
      "if": "ctx." + . + " != null"
    }}
  ] + [
    {
      "script": {
        "lang": "painless",
        "source": $source1
      }
    },
    {
      "enrich": {
        "policy_name": "m2m_" + $INDEX_VERSION + "_target_expanded_lookup",
        "field": "id",
        "target_field": "r",
        "max_matches": 128,
        "ignore_missing": true
      }
    },
    {
      "script": {
        "lang": "painless",
        "source": $source2
      }
    }
  ]
}' --arg INDEX_VERSION $INDEX_VERSION --arg source1 "
  List ctxEntrySet = new ArrayList(ctx.entrySet());
  for (entry in ctxEntrySet) {
    if (entry.getKey().startsWith('r_')) {
      Map value = entry.getValue();
      List valueEntrySet = new ArrayList(value.entrySet());
      for (valueEntry in valueEntrySet) {
        if (valueEntry.getKey().startsWith('r_')) continue;
        ctx[entry.getKey() + '_' + valueEntry.getKey()] = valueEntry.getValue();
      }
      ctx.remove(entry.getKey());
    }
  }
" --arg source2 "
  if (ctx.r != null) {
    for (target in ctx.r) {
      for (entry in target.entrySet()) {
        if (entry.getKey().startsWith('target_')) {
          String key = entry.getKey().substring('target_'.length());
          if (key.startsWith('a_')) {
            if (ctx['r_' + target.predicate + '_' + key] == null) {
              ctx['r_' + target.predicate + '_' + key] = entry.getValue();
            } else {
              ctx['r_' + target.predicate + '_' + key] += ' ' + entry.getValue();
            }
          }
        }
      }
    }
    ctx.remove('r');
  }
" | es_put PUT /_ingest/pipeline/entity_${INDEX_VERSION}_expanded

es_put PUT /entity_${INDEX_VERSION}_expanded << EOF
{
  "settings": {
    "analysis": {
      "analyzer": {
        "custom_analyzer": {
          "tokenizer": "custom_tokenizer",
          "filter": [
            "lowercase",
            "asciifolding"
          ]
        }
      },
      "tokenizer": {
        "custom_tokenizer": {
          "type": "simple_pattern_split",
          "pattern": "[^a-zA-Z0-9']",
          "lowercase": true
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": {"type": "keyword"},
      "type": {"type": "keyword"},
      "slug": {"type": "keyword"},
      "pagerank": {"type": "long"}
    },
    "dynamic_templates": [
      {
        "attributes": {
          "match_mapping_type": "string",
          "match": "a_*",
          "mapping": {
            "type": "text",
            "analyzer": "custom_analyzer",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          }
        }
      },
      {
        "target_attributes": {
          "match_mapping_type": "string",
          "match": "r_*_a_*",
          "mapping": {
            "type": "text",
            "analyzer": "custom_analyzer",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          }
        }
      },
      {
        "target_id": {
          "match_mapping_type": "string",
          "match": "r_*_id",
          "unmatch": "r_*_a_*",
          "mapping": {
            "type": "keyword"
          }
        }
      },
      {
        "target_type": {
          "match_mapping_type": "string",
          "match": "r_*_type",
          "unmatch": "r_*_a_*",
          "mapping": {
            "type": "keyword"
          }
        }
      },
      {
        "target_slug": {
          "match_mapping_type": "string",
          "match": "r_*_slug",
          "unmatch": "r_*_a_*",
          "mapping": {
            "type": "keyword"
          }
        }
      },
      {
        "target_pagerank": {
          "match_mapping_type": "string",
          "match": "r_*_pagerank",
          "unmatch": "r_*_a_*",
          "mapping": {
            "type": "long"
          }
        }
      }
    ]
  }
}
EOF

es_put POST /_reindex << EOF
{
  "source": {
    "index": "entity_${INDEX_VERSION}"
  },
  "dest": {
    "index": "entity_${INDEX_VERSION}_expanded",
    "pipeline": "entity_${INDEX_VERSION}_expanded"
  }
}
EOF

# remove aliases if they exist
es_put POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "entity" } }]}
EOF
es_put POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "entity_expanded" } }]}
EOF
es_put POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "m2m_target_expanded" } }]}
EOF
# update this version to production
es_put POST /_aliases << EOF
{
  "actions": [
    { "add": { "index": "entity_${INDEX_VERSION}", "alias": "entity" } },
    { "add": { "index": "entity_${INDEX_VERSION}_expanded", "alias": "entity_expanded" } },
    { "add": { "index": "m2m_${INDEX_VERSION}_target_expanded", "alias": "m2m_target_expanded" } },
    { "add": { "index": "m2m_${INDEX_VERSION}_expanded_target_expanded", "alias": "m2m_expanded_target_expanded" } }
  ]
}
EOF

# get current indexes
# es GET /_cat/indices?v
# es GET /_aliases

# delete old index
# es DELETE /entity_${INDEX_VERSION}
# es DELETE /m2m_${INDEX_VERSION}_expanded
# es DELETE /m2m_${INDEX_VERSION}_target_expanded
