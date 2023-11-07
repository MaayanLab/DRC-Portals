# DRC Portals Dev Guide

## Getting Started
```bash
# prepare .env file & review
cp .env.example .env
# start database
docker-compose up -d postgres
# install node modules
npm i
# initialize prisma
npx prisma db push
# run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the platform.

The pages will auto-update as you edit the files.

## Learn More

To use authentication see the [Auth README](./lib/auth/README.md) for more info.

To use prisma (the database) see the [Prisma README](./lib/prisma/README.md) for more info.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
