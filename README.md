# Squiglink Server

The server powering the next generation of Squiglink [Lab](https://github.com/squiglink/lab) and [Studio](http://github.com/squiglink/studio) while preserving backwards compatibility with CrinGraph and forks.

## Install

### Development

1. Install [Docker](https://www.docker.com/) and [Task](https://taskfile.dev).

2. Copy the configuration file:

   ```sh
   cp .env.example .env
   ```

3. Edit the configuration file:

   ```sh
   msedit .env
   ```

4. Setup the application:

   ```sh
   task setup
   ```

5. Start the application:

   ```sh
   task start
   ```

Done?:

- Execute `task` to list available tasks.
- Send requests to <http://localhost:3000> or host instances of Lab and Studio.

### Production

1. Install [Docker](https://www.docker.com/).

2. Fetch the required files:

   ```sh
   curl -o .env https://raw.githubusercontent.com/squiglink/server/main/.env.example
   curl -o Dockerfile https://raw.githubusercontent.com/squiglink/server/main/Dockerfile
   curl -o compose.yaml https://raw.githubusercontent.com/squiglink/server/main/compose.production.yaml
   ```

3. Edit the configuration file:

   ```sh
   msedit .env
   ```

4. Create and migrate the database:

   ```sh
   docker compose run --rm server task database-create
   docker compose run --rm server task kysely -- migrate:latest
   ```

5. Start the application:

   ```sh
   docker compose up --detach
   ```

Done?:

- Execute `docker compose run --rm server task` to list available tasks.
- Send requests to <http://localhost:3000> or host instances of Lab and Studio.
