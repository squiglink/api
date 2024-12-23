# Squiglink API

## Install

1. Execute:

   ```sh
   docker compose run api pnpm install
   docker compose run api pnpm kysely migrate:latest
   docker compose run api pnpm kysely seed run
   docker compose run api pnpm kysely-test migrate:latest
   docker compose up
   ```

2. Open <http://localhost:3000>.

## Tips

```sh
docker compose run api pnpm kysely-codegen
docker compose run api pnpm prettier --check .
docker compose run api pnpm prettier --write .
docker compose run api pnpm vitest
```
