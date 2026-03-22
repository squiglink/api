# Base

FROM oven/bun:1.3.11-alpine AS base

WORKDIR /server

# Development

FROM base AS development

CMD ["bun", "--watch", "source/index.ts"]

# Production

FROM base AS production

RUN apk add --no-cache go-task-task postgresql-client

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY kysely.config.ts ./
COPY migrations ./migrations
COPY source ./source
COPY Taskfile.production.yaml ./Taskfile.yaml

CMD ["bun", "source/index.ts"]
