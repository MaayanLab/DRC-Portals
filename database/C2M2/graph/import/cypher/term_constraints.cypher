CREATE CONSTRAINT constraint_AnalysisType_id IF NOT EXISTS FOR (n:AnalysisType) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_Anatomy_id IF NOT EXISTS FOR (n:Anatomy) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_AssayType_id IF NOT EXISTS FOR (n:AssayType) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_Compound_id IF NOT EXISTS FOR (n:Compound) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_DataType_id IF NOT EXISTS FOR (n:DataType) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_Disease_id IF NOT EXISTS FOR (n:Disease) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_DiseaseAssociationType_id IF NOT EXISTS FOR (n:DiseaseAssociationType) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_FileFormat_id IF NOT EXISTS FOR (n:FileFormat) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_Gene_id IF NOT EXISTS FOR (n:Gene) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_NCBITaxonomy_id IF NOT EXISTS FOR (n:NCBITaxonomy) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_Phenotype_id IF NOT EXISTS FOR (n:Phenotype) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_PhenotypeAssociationType_id IF NOT EXISTS FOR (n:PhenotypeAssociationType) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_Protein_id IF NOT EXISTS FOR (n:Protein) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_SamplePrepMethod_id IF NOT EXISTS FOR (n:SamplePrepMethod) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_SubjectEthnicity_id IF NOT EXISTS FOR (n:SubjectEthnicity) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_SubjectRace_id IF NOT EXISTS FOR (n:SubjectRace) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_SubjectRole_id IF NOT EXISTS FOR (n:SubjectRole) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_SubjectGranularity_id IF NOT EXISTS FOR (n:SubjectGranularity) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_SubjectSex_id IF NOT EXISTS FOR (n:SubjectSex) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT constraint_Substance_id IF NOT EXISTS FOR (n:Substance) REQUIRE n.id IS UNIQUE;