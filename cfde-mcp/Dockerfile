FROM node:22

COPY . /app

WORKDIR /app

RUN npm install

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "dist/index.js"]