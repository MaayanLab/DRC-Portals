# Stage 1: Build natively on host CPU (prevents QEMU/SWC binary crashes)
FROM --platform=$BUILDPLATFORM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Final linux/amd64 image for serving static assets
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*
COPY --from=builder /app/out ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]