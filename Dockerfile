FROM node:24.6-alpine3.22

RUN npm install --global pnpm@^10.15.0

WORKDIR /api

CMD ["pnpm", "tsx", "watch", "source/index.ts"]
