CREATE RANGE INDEX index_Biosample_local_id IF NOT EXISTS FOR (n:Biosample) ON (n.local_id);
CREATE RANGE INDEX index_File_local_id IF NOT EXISTS FOR (n:File) ON (n.local_id);
CREATE RANGE INDEX index_Subject_local_id IF NOT EXISTS FOR (n:Subject) ON (n.local_id);
CREATE TEXT INDEX index_Biosample_persistent_id IF NOT EXISTS FOR (n:Biosample) ON (n.persistent_id);
CREATE TEXT INDEX index_File_persistent_id IF NOT EXISTS FOR (n:File) ON (n.persistent_id);
CREATE TEXT INDEX index_Subject_persistent_id IF NOT EXISTS FOR (n:Subject) ON (n.persistent_id);
CREATE TEXT INDEX index_File_access_url IF NOT EXISTS FOR (n:File) ON (n.access_url);
