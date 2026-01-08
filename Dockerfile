FROM node:25-alpine3.23

RUN npm install --global pnpm@^10.27.0

WORKDIR /api

CMD ["pnpm", "tsx", "watch", "source/index.ts"]
