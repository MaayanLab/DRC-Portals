#!/bin/sh

if [ ! -f conf/build ]; then
  /opt/keycloak/bin/kc.sh build
  touch conf/build
fi

/opt/keycloak/bin/kc.sh start
