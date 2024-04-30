## Introduction
The Crosscut Metadata Model (C2M2) is a flexible metadata standard for describing experimental resources in biomedicine and related fields. A complete C2M2 submission, also called an "instance" or a "datapackage", is a zipped folder containing multiple tab-delimited files (TSVs) representing metadata records along with a JSON schema. To read more about datapackages, skip to the [Frictionless Data Packages](#frictionless-data-packages) section. 

Each TSV file is a **data table** containing various **data records** (rows) and their values for different **fields** (columns). **Entity tables** describe various types of data objects, while **association tables** describe the relationships between different entities. 

This page is adapted from the [original C2M2 documentation](https://github.com/nih-cfde/published-documentation) developed by the CFDE Coordination Center (CFDE-CC). 

## Resources
* The [c2m2-frictionless-dataclass](https://github.com/nih-cfde/c2m2-frictionless-dataclass/tree/main) 
    - This repository includes the `c2m2-frictionless` Python package, which contains specific helper functions for C2M2 datapackage building and validation. 
    - This package is not designed to generate a complete C2M2 datapackage from any given data, but should be used in collaboration with the provided schema and ontology preparation scripts, as well as with DCC-specific scripts.
* The most up-to-date [C2M2 JSON schema](https://osf.io/c63aw/)
* The most up-to-date [C2M2 ontology preparation script and files](https://osf.io/bq6k9/)
* The original [C2M2 documentation](https://github.com/nih-cfde/c2m2/blob/master/draft-C2M2_specification/README.md) from the CFDE Coordination Center contains more details on the concepts discussed here.

## Frictionless Data Packages
C2M2 instances are also known as "datapackages" based on the [Data Package](http://frictionlessdata.io/docs/data-package/) meta-specification from [Frictionless Data](http://frictionlessdata.io/). 

From the original C2M2 documentation: 
> The Data Package meta-specification is a platform-agnostic toolkit for defining format and content requirements for files so that automatic validation can be performed on those files, just as a database management system stores definitions for database tables and automatically validates incoming data based on those definitions. Using this toolkit, the C2M2 JSON Schema specification defines foreign-key relationships between metadata fields (TSV columns), rules governing missing data, required content types and formats for particular fields, and other similar database management constraints. These architectural rules help to guarantee the internal structural integrity of each C2M2 submission, while also serving as a baseline standard to create compatibility across multiple submissions received from different DCCs.

## Identifiers
In order to standardize and integrate information across DCCs, there must be a system of assigning unambiguous identifiers to individual DCC concepts and resources. These are the "C2M2 IDs", consisting of a `id_namespace` prefix and `local_id` suffix. Additionally, the C2M2 also allows individual resources to be assigned a `persistent_id`. 

From the original C2M2 documentation: 
> Optional `persistent_id` identifiers are meant to be stable enough to be scientifically cited, and to provide for further investigation by accessing related resolver services. To be used as a C2M2 `persistent_id`, an ID
> 1. will represent an explicit commitment by the managing DCC that the attachment of the ID to the resource it represents is permanent and final
> 2. must be a format-compliant URI or a compact identifier, where the protocol (the "scheme" or "prefix") specified in the ID is registered with at least one of the following (see the given lists for examples of URIs and compact identifiers)
>     - the IANA (list of registered schemes)
>     - scheme used must be assigned either "Permanent" or "Provisional" status
>     - Identifiers.org (list of registered prefixes)
>     - N2T (Name-To-Thing) (list of registered prefixes)
>     - protocols not appearing in the above registries but explicitly approved by the CFDE-CC. Currently, this list is limited to one protocol, namely drs:// URIs identifying GA4GH Data Repository Service resources.
> 3. if representing a file, an ID used as a `persistent_id` cannot be a direct-download URL for that file: it must instead be an identifier permanently attached to the file and only indirectly resolvable (through the scheme or prefix specified within the ID) to the file itself

## C2M2 Tables

*Sourced from the [CFDE Coordination Center Documentation Wiki](https://github.com/nih-cfde/published-documentation/wiki/C2M2-Table-Summary)*

All of the tables in a C2M2 datapackage are inter-linked via foreign key relationships, as shown in the following diagram of the complete C2M2 system. 