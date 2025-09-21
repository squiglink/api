# Squiglink API

The API powering the next generation of Squiglink [Lab](https://github.com/squiglink/lab) and [Studio](http://github.com/squiglink/studio) while preserving backwards compatibility with CrinGraph and forks.

## Install

```sh
# Copy the configuration file.
cp .env.example .env

# Fill in the configuration file.
edit .env

# Install dependencies.
docker compose run api pnpm install

# Migrate the database.
docker compose run api pnpm kysely migrate:latest

# Migrate the test database (development-only).
docker compose run api pnpm kysely-test migrate:latest

# Seed the database (development-only).
docker compose run api pnpm kysely seed run

# Start the containers.
docker compose up
```

Done? Send requests to <http://localhost:3000> or host instances of Lab and Studio.

## Tips

```sh
# Generate the OpenAPI specification
docker compose run api pnpm generate-openapi

# Generate type definitions from the database.
docker compose run api pnpm kysely-codegen

# Check for linting errors in the code.
docker compose run api pnpm oxlint --deny-warnings

# Check for formatting errors in the code.
docker compose run api pnpm prettier --check .

# Fix formatting errors in the code.
docker compose run api pnpm prettier --write .

# Run tests.
docker compose run api pnpm test

# Check for typing errors in the code.
docker compose run api pnpm tsc --noEmit
```
