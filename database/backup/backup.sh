#!/bin/sh

export AWS_ACCESS_KEY_ID="$S3_POSTGRES_BACKUP_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$S3_POSTGRES_BACKUP_AWS_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$S3_POSTGRES_BACKUP_AWS_DEFAULT_REGION"

PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${POSTGRES_HOST}" -U "${POSTGRES_USER}" -Fc -Z 9 "${POSTGRES_DB}" \
  -t '"public"."User"' -t '"public"."Account"' -t '"public"."Session"' -t '"public"."_DCCToUser"' \
  -t '"public"."dcc_assets"' -t '"public"."code_assets"' -t '"public"."file_assets"' \
  | aws s3 cp - "s3://${S3_POSTGRES_BACKUP_PREFIX}/$(date +%Y-%m-%d)-public.pgdump"

PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${POSTGRES_HOST}" -U "${POSTGRES_USER}" -Fc -Z 9 "${POSTGRES_DB}" \
  -n keycloak \
  | aws s3 cp - "s3://${S3_POSTGRES_BACKUP_PREFIX}/$(date +%Y-%m-%d)-keycloak.pgdump"
