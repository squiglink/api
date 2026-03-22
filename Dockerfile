# Base

FROM oven/bun:1.3.11-alpine AS base

WORKDIR /server

# Development

FROM base AS development

CMD ["bun", "--watch", "source/index.ts"]

# Production build

FROM base AS production-build

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY migrations ./migrations
COPY source ./source
RUN bun build --compile --outfile server source/index.ts

# Production

FROM alpine AS production

COPY --from=production-build /server/server /server/server

WORKDIR /server

CMD ["./server", "start"]
