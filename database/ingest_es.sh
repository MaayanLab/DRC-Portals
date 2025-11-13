#!/bin/sh

ELASTICSEARCH_URL=$(dotenv -f ../drc-portals/.env get ELASTICSEARCH_URL)
INDEX_VERSION=v1

es() {
  method=$1
  path=$2
  curl -H'Content-Type: application/json' -X${method} ${ELASTICSEARCH_URL}${path} -d @-
}

# create index for entity
es PUT /entity_${INDEX_VERSION} << EOF
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
es PUT /m2m_${INDEX_VERSION} << EOF
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
{"actions": [{ "remove": { "index": "*", "alias": "entity_staging" } }]}
EOF
es POST /_aliases << EOF
{"actions": [{ "add": { "index": "entity_${INDEX_VERSION}", "alias": "entity_staging" } }]}
EOF
es POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "m2m_staging" } }]}
EOF
es POST /_aliases << EOF
{"actions": [{ "add": { "index": "m2m_${INDEX_VERSION}", "alias": "m2m_staging" } }]}
EOF

# actually ingest data (can happen in parallel)
../.venv/bin/python ingest_dcc_assets.py
../.venv/bin/python ingest_gmts.py
../.venv/bin/python ingest_c2m2_files.py
../.venv/bin/python ingest_kg.py

es POST /_aliases << EOF
{
  "actions": [
    { "remove": { "index": "entity_${INDEX_VERSION}", "alias": "entity_staging" } },
    { "remove": { "index": "m2m_${INDEX_VERSION}", "alias": "m2m_staging" } }
  ]
}
EOF

# sanity checks
es POST /entity_${INDEX_VERSION}/_search << EOF
{"query":{"match_all":{}}, "size":10,"sort":[{"pagerank":{"order": "desc"}}]}
EOF
es POST /m2m_${INDEX_VERSION}/_search << EOF
{"query":{"match_all":{}}, "size":10}
EOF

# provide a way to get entity from id
es PUT /_enrich/policy/entity_${INDEX_VERSION}_lookup << EOF
{
  "match": {
    "indices": "entity_${INDEX_VERSION}",
    "match_field": "id",
    "enrich_fields": ["id", "slug", "type", "pagerank", "a_*", "r_*"]
  }
}
EOF
echo "" | es POST /_enrich/policy/entity_${INDEX_VERSION}_lookup/_execute

# Here we go from
# {
#   id: "ourid",
#   a_label: "ourlabel",
#   r_predicate1: "someid",
#   r_predicate2: "someotherid"
# }
# to
# {
#   id: "ourid",
#   a_label: "ourlabel",
#   r_predicate1_id: "someid",
#   r_predicate1_a_label: "somelabel",
#   r_predicate1_r_predicate3: "onehoprelationship",
#   r_predicate2_id: "someotherid",
#   r_predicate2_a_label: "someotherlabel",
#   r_predicate1_r_predicate3: "onehoprelationship",
# }
echo "" | es GET "/entity_${INDEX_VERSION}/_field_caps?fields=r_*" | jq -rc '{
  "processors": [
    .fields|keys|.[]|{"enrich":{
      "policy_name": "entity_" + $INDEX_VERSION + "_lookup",
      "field": .,
      "target_field": .,
      "max_matches": 1,
      "if": "ctx." + . + " != null"
    }}
  ] + [
    {
      "script": {
        "lang": "painless",
        "source": $source
      }
    }
  ]
}' --arg INDEX_VERSION $INDEX_VERSION --arg source "
  List ctxEntrySet = new ArrayList(ctx.entrySet());
  for (entry in ctxEntrySet) {
    if (entry.getKey().startsWith('r_')) {
      for (relEntry in entry.getValue().entrySet()) {
        ctx[entry.getKey() + '_' + relEntry.getKey()] = relEntry.getValue();
      }
      ctx.remove(entry.getKey());
    }
  }
" | es PUT /_ingest/pipeline/entity_${INDEX_VERSION}_expanded

# create index for entity_expanded
es PUT /entity_${INDEX_VERSION}_expanded << EOF
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
        "relationship_id": {
          "match_mapping_type": "string",
          "match": "r_*_id",
          "mapping": {
            "type": "keyword"
          }
        }
      },
      {
        "relationship_type": {
          "match_mapping_type": "string",
          "match": "r_*_type",
          "mapping": {
            "type": "keyword"
          }
        }
      },
      {
        "relationship_slug": {
          "match_mapping_type": "string",
          "match": "r_*_slug",
          "mapping": {
            "type": "keyword"
          }
        }
      },
      {
        "relationship_pagerank": {
          "match_mapping_type": "string",
          "match": "r_*_pagerank",
          "mapping": {
            "type": "long"
          }
        }
      },
      {
        "relationship_attributes": {
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
        "relationship_relationships": {
          "match_mapping_type": "string",
          "match": "r_*_r_*",
          "mapping": {
            "type": "keyword"
          }
        }
      }
    ]
  }
}
EOF

es POST /_reindex << EOF
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

# provide a way to get entity from id
es PUT /_enrich/policy/entity_${INDEX_VERSION}_expanded_lookup << EOF
{
  "match": {
    "indices": "entity_${INDEX_VERSION}_expanded",
    "match_field": "id",
    "enrich_fields": ["id", "slug", "type", "pagerank", "a_*", "r_*"]
  }
}
EOF
echo "" | es POST /_enrich/policy/entity_${INDEX_VERSION}_expanded_lookup/_execute

# expand target_id into full target entity
es PUT /_ingest/pipeline/m2m_${INDEX_VERSION}_target_expanded << EOF
{
  "processors": [
    {
      "enrich": {
        "policy_name": "entity_${INDEX_VERSION}_expanded_lookup",
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
es PUT /m2m_${INDEX_VERSION}_target_expanded << EOF
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
        "attributes": {
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
        "relationship_id": {
          "match_mapping_type": "string",
          "match": "target_r_*_id",
          "mapping": {
            "type": "keyword"
          }
        }
      },
      {
        "relationship_type": {
          "match_mapping_type": "string",
          "match": "target_r_*_type",
          "mapping": {
            "type": "keyword"
          }
        }
      },
      {
        "relationship_slug": {
          "match_mapping_type": "string",
          "match": "target_r_*_slug",
          "mapping": {
            "type": "keyword"
          }
        }
      },
      {
        "relationship_pagerank": {
          "match_mapping_type": "string",
          "match": "target_r_*_pagerank",
          "mapping": {
            "type": "long"
          }
        }
      },
      {
        "relationship_attributes": {
          "match_mapping_type": "string",
          "match": "target_r_*_a_*",
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
        "relationship_relationships": {
          "match_mapping_type": "string",
          "match": "target_r_*_r_*",
          "mapping": {
            "type": "keyword"
          }
        }
      }
    ]
  }
}
EOF

es POST /_reindex << EOF
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


es PUT /_ingest/pipeline/m2m_${INDEX_VERSION}_expanded << EOF
{
  "processors": [
    {
      "enrich": {
        "policy_name": "entity_${INDEX_VERSION}_lookup",
        "field": "source_id",
        "target_field": "source"
      }
    },
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
          for (entry in ctx.source.entrySet()) {
            ctx['source_' + entry.getKey()] = entry.getValue();
          }
          ctx.remove('source');
          for (entry in ctx.target.entrySet()) {
            ctx['target_' + entry.getKey()] = entry.getValue();
          }
          ctx.remove('target');
        "
      }
    }
  ]
}
EOF

# create index for m2m
es PUT /m2m_${INDEX_VERSION}_expanded << EOF
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
      "predicate": {"type": "keyword"},
      "source_id": {"type": "keyword"},
      "source_type": {"type": "keyword"},
      "source_slug": {"type": "keyword"},
      "source_pagerank": {"type": "long"},
      "target_id": {"type": "keyword"},
      "target_type": {"type": "keyword"},
      "target_slug": {"type": "keyword"},
      "target_pagerank": {"type": "long"}
    },
    "dynamic_templates": [
      {
        "source_attributes": {
          "match_mapping_type": "string",
          "match": "source_a_*",
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
        "source_relationships": {
          "match_mapping_type": "string",
          "match": "source_r_*",
          "mapping": {
            "type": "keyword"
          }
        }
      },
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

es POST /_reindex << EOF
{
  "source": {
    "index": "m2m_${INDEX_VERSION}"
  },
  "dest": {
    "index": "m2m_${INDEX_VERSION}_expanded",
    "pipeline": "m2m_${INDEX_VERSION}_expanded"
  }
}
EOF

# remove aliases if they exist
es POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "entity" } }]}
EOF
es POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "entity_expanded" } }]}
EOF
es POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "m2m_target_expanded" } }]}
EOF
# update this version to production
es POST /_aliases << EOF
{
  "actions": [
    { "add": { "index": "entity_${INDEX_VERSION}", "alias": "entity" } },
    { "add": { "index": "entity_${INDEX_VERSION}_expanded", "alias": "entity_expanded" } },
    { "add": { "index": "m2m_${INDEX_VERSION}_target_expanded", "alias": "m2m_target_expanded" } }
  ]
}
EOF

# get current indexes
# echo "" | es GET /_cat/indices?v
# echo "" | es GET /_aliases

# delete old index
# echo "" | es DELETE /entity_${INDEX_VERSION}
# echo "" | es DELETE /m2m_${INDEX_VERSION}
# echo "" | es DELETE /m2m_target_expanded_${INDEX_VERSION}
