# Squiglink API

The API powering the next generation of Squiglink [Lab](https://github.com/squiglink/lab) and [Studio](http://github.com/squiglink/studio) while preserving backwards compatibility with CrinGraph and forks.

## Install

1. Install [Docker](https://www.docker.com/) and [Task](https://taskfile.dev/docs/installation).

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

Done? Send requests to <http://localhost:3000> or host instances of Lab and Studio.

## Tips

Execute `task` in the project folder to list available tasks.
