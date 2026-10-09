// Has synonyms
MATCH (n:Compound)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_Compound__searchText IF NOT EXISTS FOR (n:Compound) ON (n._searchText);

MATCH (n:DataType)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_DataType__searchText IF NOT EXISTS FOR (n:DataType) ON (n._searchText);

MATCH (n:Disease)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_Disease__searchText IF NOT EXISTS FOR (n:Disease) ON (n._searchText);

MATCH (n:AnalysisType)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_AnalysisType__searchText IF NOT EXISTS FOR (n:AnalysisType) ON (n._searchText);

MATCH (n:Anatomy)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_Anatomy__searchText IF NOT EXISTS FOR (n:Anatomy) ON (n._searchText);

MATCH (n:Gene)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_Gene__searchText IF NOT EXISTS FOR (n:Gene) ON (n._searchText);

MATCH (n:Protein)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_Protein__searchText IF NOT EXISTS FOR (n:Protein) ON (n._searchText);

MATCH (n:AssayType)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_AssayType__searchText IF NOT EXISTS FOR (n:AssayType) ON (n._searchText);

MATCH (n:Substance)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_Substance__searchText IF NOT EXISTS FOR (n:Substance) ON (n._searchText);

MATCH (n:Biofluid)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_Biofluid__searchText IF NOT EXISTS FOR (n:Biofluid) ON (n._searchText);

MATCH (n:FileFormat)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_FileFormat__searchText IF NOT EXISTS FOR (n:FileFormat) ON (n._searchText);

MATCH (n:NCBITaxonomy)
CALL (n) {
    SET n._searchText = reduce(acc = '', item IN [n.name] + coalesce(n.synonyms, []) | acc || '|' + toLower(item)) + '|'
} IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_NCBITaxonomy__searchText IF NOT EXISTS FOR (n:NCBITaxonomy) ON (n._searchText);

// No synonyms
MATCH (n:Phenotype)
CALL (n) {
    SET n._searchText = '|' + toLower(n.name) + '|'
}
IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_Phenotype__searchText IF NOT EXISTS FOR (n:Phenotype) ON (n._searchText);

MATCH (n:SubjectGranularity)
CALL (n) {
    SET n._searchText = '|' + toLower(n.name) + '|'
}
IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_SubjectGranularity__searchText IF NOT EXISTS FOR (n:SubjectGranularity) ON (n._searchText);

MATCH (n:SubjectSex)
CALL (n) {
    SET n._searchText = '|' + toLower(n.name) + '|'
}
IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_SubjectSex__searchText IF NOT EXISTS FOR (n:SubjectSex) ON (n._searchText);

MATCH (n:SamplePrepMethod)
CALL (n) {
    SET n._searchText = '|' + toLower(n.name) + '|'
}
IN TRANSACTIONS OF 10000 ROWS;
CREATE TEXT INDEX index_SamplePrepMethod__searchText IF NOT EXISTS FOR (n:SamplePrepMethod) ON (n._searchText);
