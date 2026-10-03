FROM node:26.7.0-alpine
RUN apk add --no-cache openssl libc6-compat
USER node
WORKDIR /app

# fix "sharp-missing-in-production" warning
RUN set -x \
  && mkdir ~/.npm-global \
  && npm config set prefix '~/.npm-global' \
  && echo "export PATH=~/.npm-global/bin:\$PATH" >> ~/.profile \
  && npm i -g sharp
ENV NEXT_SHARP_PATH=/home/node/.npm-global/lib/node_modules/sharp

ADD .next/standalone ./
ADD .next/static ./.next/static
ADD public ./public
ADD prisma ./prisma

ENV DATABASE_URL=""
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
