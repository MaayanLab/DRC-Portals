FROM keycloak/keycloak:24.0
ENTRYPOINT ["/bin/sh"]
WORKDIR /opt/keycloak
ADD start.sh /opt/bin/start.sh

# these settings allow it to operate behind a
#  TLS-termination proxy.
ENV KC_PROXY=edge
ENV KC_HOSTNAME_STRICT=false
EXPOSE 8080

CMD ["/opt/bin/start.sh"]