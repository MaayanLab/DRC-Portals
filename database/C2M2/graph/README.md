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
  - [Stop the Load Container and Start Dev/Prod](#stop-the-load-container-and-start-devprod)
- [Setup SSL](#setup-ssl)
  - [Create a Neo4j Group and User](#create-a-neo4j-group-and-user)
  - [Optional: Install certbot](#optional-install-certbot)
  - [Create First Time Certs](#create-first-time-certs)
  - [Copy Certs Into Neo4j Volume Directories](#copy-certs-into-neo4j-volume-directories)
  - [Optional: Setup a Cron Job](#optional-setup-a-cron-job)

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
NEO4J_AUTH=
DB_ADDRESS=
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

After you have created the Cypher scripts and exported the C2M2 data from Postgres, you can start the Neo4j container and begin the import process. There is a docker-compose file specifically for running the import process, called `docker-compose.load.yaml`. To start the container, simply run:

```bash
docker-compose -f docker-compose.load.yaml up -d
```

The `-d` in the command above means to run the container in "detached" mode, essentially meaning the container will run in the background.

Also keep in mind that the docker-compose file requires the presence of an `.env` file in the same directory containing the Neo4j user auth details.

To check the status of the container after starting it, use:

```bash
docker ps
```

If you'd like to check the logs of the container, you can run:

```bash
docker logs --follow drc-portals-neo4j-load
```

## Import the Data Into Neo4j

### Optional Read: The `/import` Volume

It is important to note that the container has a volume mount: `/import`. We mount the `./import` directory located in this project to the `/import` directory in the Neo4j container. This allows us to easily "copy" the Postgres data and import scripts into the container, while simultaneously allowing us to edit those files in the host and have changes mirrored in the container. This can be handy for debugging or ad-hoc adjustments.

It is _highly_ recommended that you do not set any volume mount to the default Neo4j home directories. Suffice to say, the Neo4j container does some strange things with file permissions when host directories are mounted to the default container directories. If you want to create additional volumes (e.g., for logs or configs), it is strongly recommended to mount those directories to the root of the container, e.g. `/logs`, `/config` etc.

### Run the Load Process

To begin the process of loading the C2M2 data we exported from Postgres into Neo4j, simply run:

```bash
docker exec drc-portals-neo4j-load /import/load.sh
```

This will run the `load.sh` script _inside_ the Neo4j container. You should see some output detailing the progress of the script. Be aware that this process may take a while.

Once the script has finished, you will have a fully loaded C2M2 graph! The Neo4j browser should be available at: [localhost:7474](http://localhost:7474). If for whatever reason you can't easily access the web browser, you can also explore the graph using `cypher-shell` from within the container:

```bash
$ source .env
$ docker exec -it drc-portals-neo4j-load cypher-shell -p $PASSWORD -u $USERNAME
neo4j@neo4j> MATCH (p:Project) RETURN p.name LIMIT 25;
```

To exit `cypher-shell`, simply enter the `:quit` command.

### Stop the Load Container and Start Dev/Prod

Once the load process is complete, you may stop the container. You can do so by running:

```bash
docker-compose -f docker-compose.load.yaml down
```

There are two docker-compose files specifically for local development and production, `docker-compose.dev.yaml` and `docker-compose.prod.yaml` respectively. They both contain several configurations which should always be enabled, e.g. transaction timeouts and maximum memory. The production compose file has several more configurations related to enabling SSL. You can start the services described in either by running:

```bash
docker-compose -f <filename> up -d
```

## Setup SSL

For production environments, it is highly recommended to enable SSL policies for the bolt and https connectors to the Neo4j database. The prod docker-compose file already contains the required configurations for SSL, but there are several additional setup steps.

### Create a Neo4j Group and User

The Neo4j container will expect the SSL certificate files to be owned by the "neo4j" user and group created during the container image build. If the files _do not_ have these permissions, the container _will fail_ to start with a file read access error. Thankfully, the UID and GID are well known for the container "neo4j" user and group, so we can create them on the host using the respective ids, and then give add permissions to the files accordingly.

To create a "neo4j" user and group on the _host_, run the following script, included in the same directory as these instructions:

```bash
sh neo4j_system_setup.sh
```

This will do two things:

- Create a group on the host named "neo4j" with GID 7474
- Create a user on the host named "neo4j" with UID 7474, belonging to the "neo4j" group

### Optional: Install certbot

The following instructions assume that [certbot](https://certbot.eff.org/) is installed on the host machine. If it is not, you can install it by following the [official instructions](https://certbot.eff.org/instructions).

### Create First Time Certs

The next step is to generate the certs for the first time. Run the following command:

```bash
sudo certbot certonly
```

When prompted to specify an authentication option, choose option 1 (create a temporary webserver on port 80). Then, when prompted to provide the domain name(s), provide the domain you've registered and and created DNS records for.

Note that by choosing option 1 above, you _must_ open port 80 on the host for the above to succeed. If port 80 is not open, certbot will not be able to complete the certificate registration! Verify that the host does not have a firewall on port 80 if you are encountering any issues generating the certificate, as this is a common issue.

Registering the domain name, reserving IP addresses, and configuring DNS records is outside of the scope of these instructions, but there are a variety of DNS providers available, and most cloud service providers allow reserving static IP addresses.

### Copy Certs Into Neo4j Volume Directories

Once the certs have been generated, we can copy them into the `ssl` directory, which is mounted to the directory of the same name in the Neo4j container.

To create the ssl directory and copy the certs into it, run the following script, included in the same directory as these instructions:

```bash
sh renew_certs.sh
```

This will perform a handful of tasks:

- Renewing the certificates
  - You may be prompted to skip this step on the command line if the existing certs are still valid
- Creating the `ssl` directory, if it doesn't already exist
- Creating the `ssl/bak` directory (for storing backups of the certificate files), it it doesn't already exist
- Creating backups of the contents of the `ssl/https` and `ssl/bolt` folders
- Copying certs into the `ssl/https` and `ssl/bolt` folders
- Changing group ownership of the contents of `ssl` to the "neo4j" group
- Updating permissions on the contents of `ssl` to ensure they are group readable

Once completed, you can start the Neo4j container using the prod docker-compose file, which is configured to use the certificates stored in the `ssl` directory.

### Optional: Setup a Cron Job

While not strictly necessary, you will likely want to setup automatic renewal of the certificates. To do so, you can add a cron job using `crontab`.

To edit your crontab, simply run:

```bash
crontab -e
```

For example, if you want to renew the certificates on the first day of the month at midnight, you can add the following line to your crontab:

```bash
0 0 1 * * sh /path/to/renew_certs.sh
```
