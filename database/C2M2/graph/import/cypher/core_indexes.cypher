CREATE RANGE INDEX index_Biosample_local_id IF NOT EXISTS FOR (n:Biosample) ON (n.local_id);
CREATE RANGE INDEX index_File_local_id IF NOT EXISTS FOR (n:File) ON (n.local_id);
CREATE RANGE INDEX index_Subject_local_id IF NOT EXISTS FOR (n:Subject) ON (n.local_id);
