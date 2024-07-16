# C2M2 Graph Load Pipeline

## Glossary

- [Prerequisites](#prerequisites)
  - [Python](#python)
  - [Postgres](#postgres)
  - [Docker](#docker)
  - [Environment Variables](#environment-variables)
- [Cypher Scripts and Export Data](#cypher-scripts-and-export-data)
- [Create the Neo4j Container](#create-the-neo4j-container)
- [Import the Data Into Neo4j](#import-the-data-into-neo4j)
  - [Optional Read: The `/import` Volume](#optional-read-the-import-volume)
  - [Run the Load Process](#run-the-load-process)
  - [Optional: Run Graph Revisions](#optional-run-graph-revisions)

## Prerequisites

### Python

To follow this guide you will need to install Python on your machine. If Python is not installed, there are numerous guides online describing how to do so, but it is highly recommended to use a version manager like [pyenv](https://github.com/pyenv/pyenv) if possible, or ask your system admin. Otherwise, refer to the official Python installation [page](https://www.python.org/downloads/).

### Postgres

You will also need the `psql` command line tool in order to export data from the C2M2 database. `psql` is included as part of a Postgres installation. If you don't have Postgres installed on your machine, you can find information on how to do so [here](https://www.postgresql.org/docs/current/tutorial-install.html). Of course, if you are installing to a remote machine, be sure to ask a system admin for guidance or help if you run into any issues!

### Docker

This guide also uses Docker to configure and start a Neo4j container. Please follow the official Docker installation [instructions](https://docs.docker.com/engine/install/) if you do not have Docker installed on your machine. Note that installing Docker should also install the `docker-compose` command line tools featured later in this guide.

You may have to contact a system admin to help install Docker if you are using a remote machine.

### Environment Variables

Both the Python scripts and docker-compose file referred to in this guide presume the existence of a `.env` file containing connection details for Neo4j and Postgres. You will need to create a `.env` file containing the connection variables for these tools to function properly. A file named `.env.example` should be included alongside this file which can be used as a template for your new `.env` file.

In case the example file does not exist, refer to the following to create a new `.env` file:

```bash
# Neo4j vars
USERNAME=
PASSWORD=
GRAPH_C2M2_DBNAME=
GRAPH_C2M2_READER_USERNAME=
GRAPH_C2M2_READER_PASSWORD=

# Postgres vars
PG_DBNAME=
PG_USER=
PG_PASSWORD=
PG_HOST=
PG_PORT=
```

## Cypher Scripts and Export Data

The first step to load the C2M2 data into Neo4j is to generate the Cypher scripts we will run to load the data, if they don't already exist. These scripts should already be found under the `./import/cypher` directory included alongside this file. If for whatever reason you need to recreate them, simply run:

```bash
python3 convert_tables_to_cypher.py
```

Next, we need to get the actual data from Postgres. Simply run:

```bash
source export_data_from_pg.sh
```

Note that this script _will_ fail if:

- psql is not installed on your machine
- There is no `.env` file in the same directory as the script
- The connection details for Postgres listed in the `.env` file are incorrect
- The expected C2M2 tables do not exist in the provided Postgres database

## Create the Neo4j Container

After you have created the Cypher scripts and exported the C2M2 data from Postgres, you can start the Neo4j container and begin the import process. To start the container, simply run:

```bash
docker-compose up -d
```

The `-d` in the command above means to run the container in "detached" mode, essentially meaning the container will run in the background.

Note that the current docker-compose file attempts to use a named volume called `drc-portals-neo4j-data`. If this volume does not exist, it will be created. Otherwise it will be mounted to the `/var/lib/neo4j/data` directory inside the container.

Also keep in mind that the docker-compose file requires the presence of an `.env` file in the same directoryu containing the Neo4j user auth details.

To check the status of the container after starting it, use:

```bash
docker ps
```

If you'd like to check the logs of the container, you can run:

```bash
docker logs --follow drc-portals-neo4j
```

## Import the Data Into Neo4j

### Optional Read: The `/import` Volume

It is important to note that the container has a second volume mount: `/import`. We mount the `./import` directory located in this project to the `/import` directory in the Neo4j container. This allows us to easily "copy" the Postgres data and import scripts into the container, while simultaneously allowing us to edit those files in the host and have changes mirrored in the container. This can be handy for debugging or ad-hoc adjustments.

Be aware that this is _NOT_ the default import directory for Neo4j! We explicitly change the import directory with the following environment variable option in the docker-compose file:

```yaml
- NEO4J_server.directories.import=/import
```

It is _highly_ recommended that you do not edit this setting! Suffice to say, the Neo4j container does some strange things with file permissions when host directories are mounted to the _default_ container directories. If you absolutely must create additional volumes (e.g., for logs or configs), it is strongly recommended to create _new_ directories, as we do with the `/import` directory.

### Run the Load Process

To begin the process of loading the C2M2 data we exported from Postgres into Neo4j, simply run:

```bash
docker exec drc-portals-neo4j /import/load.sh
```

This will run the `load.sh` script _inside_ the Neo4j container. You should see some output detailing the progress of the script. Be aware that this process may take a while.

Once the script has finished, you will have a fully loaded C2M2 graph! The Neo4j browser should be available at: [localhost:7474](http://localhost:7474). If for whatever reason you can't easily access the web browser, you can also explore the graph using `cypher-shell` from within the container:

```bash
$ source .env
$ docker exec -it drc-portals-neo4j cypher-shell -p $PASSWORD -u $USERNAME
neo4j@neo4j> MATCH (p:Project) RETURN p.name LIMIT 25;
```

To exit `cypher-shell`, simply enter the `:quit` command.

### Optional: Run Graph Revisions

The `apply_revisions.sh` script executes several Cypher files which update the graph with supplementary nodes/relationships which do not naturally exist in the C2M2 model. The current revisions are:

- The addition of Synonym nodes and HAS_SYNONYM relationships, and a full text index for searching them. This is incredibly useful for implementing efficient and accurate term-based search.

To run the revisions script, simply run:

```bash
docker exec drc-portals-neo4j /import/apply-revisions.sh
```
