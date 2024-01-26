# DRC Portals Dev Guide

## Getting Started
```bash
# prepare .env file & review
cp .env.example .env
# start database
#  (NOTE: If you're running another postgres database on your system, you should turn it off as the ports will conflict)
# Note that in line 110 (around that) for integration with other postgres containers, one may map other ports to 5432.
# The UCSD team will just use 5432:5432 port-binding to avoid confusion.
#  ports:
#      - 5432:5432
docker-compose up -d drc-portal-postgres
# install node modules
npm i
# initialize prisma: Sometimes, if many changes happened, it may help to do: 'npx prisma migrate reset' 
# Before that make sure you have all the migrations in prisma/migrations folder.
# Another useful option: npx prisma migrate deploy # deploy means: it will only update the public schema
# dev means it will update all schemas.
# It it still gives issues, you may have to clean the DB completely by removing the public schema as well in psql:
# DROP SCHEMA IF EXISTS public CASCADE; then, after the 'npx prisma migrate dev',
# go to database folder and re-populate by 'python3 ingestion.py' or 'python ingestion.py'
npx prisma migrate dev
# run dev server
npm run dev
```

## Pulling and pushing from database via Prisma
```bash
# To describe models from the latest version of the database, use:
npx prisma db pull
# This will update column names, primary and foreign key relations etc from the database into the schema.prisma file.

# To write to the database from the latest version of the schema.prisma file, use:
npx prisma db push
# This will update column names, primary and foreign key relations etc from the schema.prisma file into the database. However, check docs to make sure data is not lost while updating columns.
```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the platform.

The pages will auto-update as you edit the files.

## Provisioning the Database

Much of the site is driven by contents of the database, see [Provisioning the Database](../database/README.md) to populate your database with CFDE data.

## Pulling New Changes

As the site evolves, changes may be made to the database. For the most part you can update your code base like so:
```bash
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
