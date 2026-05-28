#!/bin/sh

ELASTICSEARCH_URL=$(dotenv -f ../drc-portals/.env get ELASTICSEARCH_URL)
export INDEX_VERSION=v18

es() {
  method=$1; shift
  path=$1; shift
  curl -H'Content-Type: application/json' -X${method} ${ELASTICSEARCH_URL}${path} $@
}

es_put() {
  es $@ -d @-
}
