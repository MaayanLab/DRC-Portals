CREATE TEXT INDEX node_text_index_IDNamespace_name IF NOT EXISTS FOR (n:IDNamespace) ON (n.name);
CREATE TEXT INDEX node_text_index_DCC_name IF NOT EXISTS FOR (n:DCC) ON (n.name);