alter table c2m2.file add access_url varchar default '';
update c2m2.file set access_url = (
  case
    when persistent_id ~* '^(s3|gs|ftp|gsiftp|globus|htsget|drs)://' then persistent_id
    when persistent_id ~* '^https?://([^/]+)/(.+?)\.([^\./]+)$' then persistent_id
    else ''
  end
);
