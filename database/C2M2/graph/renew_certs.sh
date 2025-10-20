#!/bin/sh

# Load the domain name from environment vars
source .env

# Renew the certificates (note that this command is interactive!)
echo Renewing certs...
sudo certbot renew

# Create the ssl directory if it doesn't exist, then cd into it
echo Creating ssl directory if it does not exist...
sudo mkdir -p ssl
cd ssl

# Create a backup folder if it doesn't exist
echo Creating backup folder if it does not exist...
sudo mkdir -p bak

for certsource in bolt https ; do
    echo Creating backups for $certsource...
    # Create a backup of the existing directory before copying the new files, and also backup the previous backups
    if [ -e $certsource ]; then
        sudo mv -b $certsource bak/
    else
        echo "$certsource does not exist, skipping backup"
    fi

    # Create the directory (because we just moved the old one into the backup folder)
    echo Creating new $certsource...
    sudo mkdir $certsource

    # Copy the certs
    echo Creating new $certsource/neo4j.cert...
    sudo cp /etc/letsencrypt/live/$DB_DOMAIN/fullchain.pem $certsource/neo4j.cert

    echo Creating new $certsource/neo4j.key...
    sudo cp /etc/letsencrypt/live/$DB_DOMAIN/privkey.pem $certsource/neo4j.key

    echo Creating new $certsource/trusted...
    sudo mkdir $certsource/trusted

    echo Creating new $certsource/trusted/neo4j.cert...
    sudo cp /etc/letsencrypt/live/$DB_DOMAIN/fullchain.pem $certsource/trusted/neo4j.cert ;
done

# Change group of all certificate files to neo4j
echo Ensuring neo4j group ownership of ssl directory...
sudo chgrp -R neo4j ./*

# Make sure all directories and files are group readable
echo Ensuring all ssl directories and files are neo4j group readable...
sudo chmod -R g+rx ./*