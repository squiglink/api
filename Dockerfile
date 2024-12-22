FROM node:23.5-alpine3.21

RUN npm install --global pnpm@^9.15.1

WORKDIR /api
COPY package.json pnpm-lock.yaml .
RUN pnpm install

CMD ["pnpm", "dev"]
