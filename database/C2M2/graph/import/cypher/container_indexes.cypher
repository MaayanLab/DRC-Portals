CREATE RANGE INDEX index_Collection_local_id IF NOT EXISTS FOR (n:Collection) ON (n.local_id);
CREATE RANGE INDEX index_Project_local_id IF NOT EXISTS FOR (n:Project) ON (n.local_id);
