## Table of Contents
- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Generating Assertions](#generating-assertions)
- [Resources](#resources)

## Introduction

**Knowledge graphs** are often used to represent and visualize the semantic relationships within an interconnected dataset. They are also helpful for querying and exploring those relationships between different data types, as well as for imputing knowledge through machine learning-based methods. 

The CFDE Data Distillery Partnership is building a **Data Distillery Knowledge Graph (DDKG)** that integrates data from each DCC into a unified knowledge graph. Each DCC provides standardized, machine-readable assertions generated from their datasets -- the "distilled" data" -- which follow a common schema. Specifically, the DDKG schema is based on the Unified Biomedical Knowledge Graph (UBKG) schema originating from the Unified Medical Language System (UMLS), and supports over 180 ontologies for representing Common Fund data. The goal of the project is to provide a single resource for querying and visualizing cross-DCC data relationships in order to further knowledge discovery and integration across the CFDE. 

## Generating Assertions

1. Before generating any assertions, identify the type of data and knowledge you want to capture -- what data sources are you using? What type of data does each source provide? What types of relationships exist between the different data types and data sources? 
  - These assertions will usually take the form of a **triple** consisting of a **subject**, **predicate**, and **object**. As an example, the Illuminating the Druggable Genome (IDG) DCC provides data on the relationships between compounds, diseases, and understudied proteins. An assertion that bipolar disorder is an indication for the drug aripiprazole may be represented as follows using PubChem and SNOMED ontology terms:
  ```
  PUBCHEM 60795    indication    SNOMED 13746004
  ```

2. Review the list of ontologies and vocabularies currently supported by the DDKG [here](https://github.com/TaylorResearchLab/CFDE_DataDistillery/blob/main/user_guide/ontology%20neo4j%20SABs%20and%20sample%20codes%20-%20ontology%20neo4j%20SABs%20and%20sample%20codes.csv), and make note of the overlap with your dataset. While edges/relationships can be described with a string, node identifiers should be an Internationalized Resource Identifier (IRI) or an ontology term from an integrated Source Abbreviation (SAB). 
  - For any unsupported terms or complicated situations in your data, check with the DDKG team on the best course of action. 

3. Review the current DDKG ingestion format, which can be found [here](https://github.com/TaylorResearchLab/CFDE_DataDistillery/blob/main/user_guide/Distillery_Ingest_format%20-%20Instructions.csv). Briefly, a complete set of assertions requires two tab-separated (TSV) text files, each with a set of unique columns: 

  - `nodes.tsv`: A table containing metadata on entity nodes
    - `node_id` **(Required)**: The unique identifier for the node; preferably a term in the format `{SAB}<space>{Code}`, e.g. `PUBCHEM 60795`
    - `node_namespace`: The source abbreviation (SAB) for the term, e.g. `PUBCHEM`
    - `node_label` **(Required)**: The preferred term or human-readable label for the node, e.g. `aripiprazole`
    - `node_definition`: A definition for the node
    - `node_synonyms`: Text synonyms for the node, if any; these should be separated by vertical bars `|`
    - `node_dbxrefs`: External database references for the node, preferably in `{SAB}<space>{Code}` format
    - `value`: A numeric decimal value, usually reserved for nodes representing some quantitative measurement
    - `lowerbound`: A numeric decimal value representing the *minimum* allowed value for the node, if applicable
    - `upperbound`: A numeric decimal value representing the *maximum* allowed value for the node, if applicable
    - `units`: Units for the `value`, `lowerbound`, and `upperbound` field
  - `edges.tsv`: A table describing relationships between entities defined in `nodes.tsv`
    - `subject_id` **(Required)**: An existing `node_id` that is the subject of the assertion, e.g. `PUBCHEM 60795`
    - `relationship` **(Required)**: A custom string or an IRI referencing a relational ontology relationship type, e.g. `indication`
      - The DDKG recommends relationship IDs be obtained from the Relations Ontology (RO), but concise custom strings are allowed for relationships not covered within the RO.
    - `object_id` **(Required)**: An existing `node_id` that is the object of the assertion, e.g. `SNOMED 13746004`
    - `evidence_class`: Any evidence or value specific to the SAB and relevant to the relationship

4. Begin generating assertions according to the required format. Although this process will vary depending on the dataset, one way to complete this task would be to first build `edges.tsv`, then fill in `nodes.tsv`. 
  a. First identify all relationships captured within a dataset, identify the ontologies/SABs involved, and build the `edges.tsv` table with just the triples. 
  b. Then extract all unique nodes represented within `edges.tsv`, identify the relevant SAB terms and metadata, and fill in `nodes.tsv`.

## Resources
- [CFDE Data Distillery Project Github Repository](https://github.com/TaylorResearchLab/CFDE_DataDistillery)
- [CFDE Data Distillery User Guide](https://github.com/TaylorResearchLab/CFDE_DataDistillery/tree/main/user_guide)

Return to [Documentation page](/info/documentation)