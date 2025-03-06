FROM node:23.9-alpine3.21

RUN npm install --global pnpm@^10.6.0

WORKDIR /api
COPY package.json pnpm-lock.yaml .
RUN pnpm install

CMD ["pnpm", "dev"]
