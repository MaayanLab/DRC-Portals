FROM node:21
WORKDIR /app

# fix "sharp-missing-in-production" warning
RUN npm i -g sharp
ENV NEXT_SHARP_PATH=/usr/local/lib/node_modules/sharp

ADD .next/standalone ./
ADD .next/static ./.next/static
ADD public ./public
ADD prisma ./prisma

ENV DATABASE_URL ""
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]
