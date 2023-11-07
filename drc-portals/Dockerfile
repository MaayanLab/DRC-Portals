FROM node
WORKDIR /app

ADD ./package.json .
ADD ./package-lock.json .
RUN npm i

EXPOSE 3000
ENV DATABASE_URL ""
ADD . /app
RUN npx prisma generate && npm run build

CMD ["npm", "start"]
