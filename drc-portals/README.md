# DRC Portals Dev Guide

## Getting Started
```bash
# prepare .env file & review
cp .env.example .env
# start database if not already running
#  (NOTE: If you're running another postgres database on your system, you should turn it off as the ports will conflict)
docker-compose up -d drc-portal-postgres
# install node modules
npm i
# initialize prisma
npx prisma migrate deploy
# run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the platform.

The pages will auto-update as you edit the files.

## Provisioning the Database

Much of the site is driven by contents of the database, see [Provisioning the Database](../database/README.md) to populate your database with CFDE data.

## Pulling New Changes

As the site evolves, changes may be made to the database. For the most part you can update your code base like so:
```bash
# If the drc db and public schema already exist, to apply the migrations a fresh and do a clean ingest 
# into the public schema, [without deleting the public schema since that is generally owned by the 
# postgres use4r] delete the existing tables, functions and Types in the public schema
# Below, select the correct server/port/user or use dburl.py
#psql -h [localhost|server] -U [drc|drcadmin] -d drc  -p [5432|5433|5434] -a -f drop_drc_tables_from_public_schema.sql; 
#or, assuming ../database/C2M2 exists
psql "$(python3 ../database/C2M2/dburl.py)" -a -f drop_drc_tables_from_public_schema.sql -L log_drop_drc_public_tables.log; 

# get the latest changes
git pull
# update your database to match any added fields/tables
npx prisma migrate deploy
# then rerun-ingest as during Provisioning the Database above

# if the above doesn't work, you may need to run the below
#  command to completely recreate the database followed
#  by the ingest steps
npx prisma migrate reset
```

## Learn More

To use authentication see the [Auth README](./lib/auth/README.md) for more info.

To use prisma (the database) see the [Prisma README](./lib/prisma/README.md) for more info.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Production Deployment to Kubernetes

```bash
# configure .env
# initiall install
helm repo add maayanlab https://maayanlab.github.io/helm-charts
helm install drc-portal maayanlab/docker-compose -f <(docker-compose config)
```

## Releasing

```bash
# update versions, rebuild, and push docker container for this version
npm version patch

# create git release
VERSION=0.1.x
git add . && git commit -m $VERSION && git tag v$VERSION
git push && git push --tags

# update production (note that we have this in a drc namespace in prod)
helm upgrade -n drc drc-portal maayanlab/docker-compose -f <(docker-compose config)

# broke something? rollback with
helm rollback -n drc drc-portal <CURRENT_REVISION_NUMBER-1>
```
