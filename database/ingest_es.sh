#!/bin/sh

ELASTICSEARCH_URL=$(dotenv -f ../drc-portals/.env get ELASTICSEARCH_URL)
INDEX_VERSION=v12

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
uv run ingest_dcc_assets.py
uv run ingest_gmts.py
uv run ingest_c2m2_files.py
uv run ingest_kg.py

# after the above (not parallel)
uv run pagerank.py

es_put POST /_aliases << EOF
{
  "actions": [
    { "remove": { "index": "entity_${INDEX_VERSION}", "alias": "entity_staging" } },
    { "remove": { "index": "m2m_${INDEX_VERSION}", "alias": "m2m_staging" } }
  ]
}
EOF

# sanity check
(es_put POST /entity_${INDEX_VERSION}/_search|jq '.') << EOF
{"query":{"match_all":{}}, "size":1,"sort":[{"pagerank":{"order": "asc"}}]}
EOF

# provide a way to get entity from id
es_put PUT /_enrich/policy/entity_${INDEX_VERSION}_nested_lookup << EOF
{
  "match": {
    "indices": "entity_${INDEX_VERSION}",
    "match_field": "id",
    "enrich_fields": ["*"]
  }
}
EOF
es POST /_enrich/policy/entity_${INDEX_VERSION}_nested_lookup/_execute

es_put PUT /_ingest/pipeline/m2m_${INDEX_VERSION}_nested_target_expanded << EOF
{
  "processors": [
    {
      "enrich": {
        "policy_name": "entity_${INDEX_VERSION}_nested_lookup",
        "field": "target_id",
        "target_field": "target"
      }
    }
  ]
}
EOF

# create index for m2m
es_put PUT /m2m_${INDEX_VERSION}_nested_target_expanded << EOF
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
      "target": {
        "type": "nested",
        "properties": {
          "id": {"type": "keyword"},
          "type": {"type": "keyword"},
          "slug": {"type": "keyword"},
          "pagerank": {"type": "long"}
        }
      }
    },
    "dynamic_templates": [
      {
        "target_attributes": {
          "match_mapping_type": "string",
          "match": "target.a_*",
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
    "index": "m2m_${INDEX_VERSION}_nested_target_expanded",
    "pipeline": "m2m_${INDEX_VERSION}_nested_target_expanded"
  }
}
EOF

(es_put POST /entity_${INDEX_VERSION}_nested_target_expanded/_search|jq '.') << EOF
{"query":{"match_all":{}}, "size":1,"sort":[{"pagerank":{"order": "asc"}}]}
EOF

es_put PUT /_enrich/policy/m2m_${INDEX_VERSION}_nested_target_expanded_lookup << EOF
{
  "match": {
    "indices": "m2m_${INDEX_VERSION}_nested_target_expanded",
    "match_field": "source_id",
    "enrich_fields": ["predicate", "target"],
    "query": {"query_string": {"query":"-predicate:inv_* -predicate:m2m_*"}}
  }
}
EOF

es POST /_enrich/policy/m2m_${INDEX_VERSION}_nested_target_expanded_lookup/_execute

es_put PUT /_ingest/pipeline/entity_${INDEX_VERSION}_nested_expanded << EOF
{
  "processors": [
    {
      "enrich": {
        "policy_name": "m2m_${INDEX_VERSION}_nested_target_expanded_lookup",
        "field": "id",
        "target_field": "r",
        "max_matches": 128,
        "ignore_missing": true
      }
    },
    {
      "script": {
        "lang": "painless",
        "source": "
          if (ctx.r == null) {
            ctx.r = [];
          }
          List ctxEntrySet = new ArrayList(ctx.entrySet());
          for (entry in ctxEntrySet) {
            if (entry.getKey().startsWith('l_')) {
              Map value = [:];
              value['predicate'] = entry.getKey().substring(2);
              value['target'] = entry.getValue();
              ctx.r.add(value);
              ctx.remove(entry.getKey());
            }
          }
        "
      }
    }
  ]
}
EOF

es_put PUT /entity_${INDEX_VERSION}_nested_expanded << EOF
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
      "pagerank": {"type": "long"},
      "r": {
        "properties": {
          "predicate": {"type": "keyword"},
          "target": {
            "type": "nested",
            "properties": {
              "id": {"type": "keyword"},
              "type": {"type": "keyword"},
              "slug": {"type": "keyword"},
              "pagerank": {"type": "long"}
            }
          }
        }
      }
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
      }
      {
        "target_attributes": {
          "match_mapping_type": "string",
          "match": "r.target.a_*",
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
    "index": "entity_${INDEX_VERSION}_nested_expanded",
    "pipeline": "entity_${INDEX_VERSION}_nested_expanded"
  }
}
EOF

es_put PUT /_enrich/policy/entity_${INDEX_VERSION}_nested_expanded_lookup << EOF
{
  "match": {
    "indices": "entity_${INDEX_VERSION}_nested_expanded",
    "match_field": "id",
    "enrich_fields": ["*"]
  }
}
EOF
es POST /_enrich/policy/entity_${INDEX_VERSION}_nested_expanded_lookup/_execute

es_put PUT /_ingest/pipeline/m2m_${INDEX_VERSION}_nested_expanded_target_expanded << EOF
{
  "processors": [
    {
      "enrich": {
        "policy_name": "entity_${INDEX_VERSION}_nested_expanded_lookup",
        "field": "target_id",
        "target_field": "target"
      }
    }
  ]
}
EOF

es_put PUT /m2m_${INDEX_VERSION}_nested_expanded_target_expanded << EOF
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
      "target": {
        "type": "nested",
        "properties": {
          "id": {"type": "keyword"},
          "type": {"type": "keyword"},
          "slug": {"type": "keyword"},
          "pagerank": {"type": "long"},
          "r": {
            "type": "object",
            "properties": {
              "predicate": {"type": "keyword"},
              "target": {
                "type": "nested",
                "properties": {
                  "id": {"type": "keyword"},
                  "type": {"type": "keyword"},
                  "slug": {"type": "keyword"},
                  "pagerank": {"type": "long"}
                }
              }
            }
          }
        }
      }
    },
    "dynamic_templates": [
      {
        "attributes": {
          "match_mapping_type": "string",
          "match": "target.a_*",
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
      }
      {
        "target_attributes": {
          "match_mapping_type": "string",
          "match": "target.r.target.a_*",
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
    "index": "m2m_${INDEX_VERSION}_nested_expanded_target_expanded",
    "pipeline": "m2m_${INDEX_VERSION}_nested_expanded_target_expanded"
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
