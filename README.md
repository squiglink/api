# Squiglink API

## Setup

1. Install dependencies:

   ```sh
   docker compose run api cargo build
   ```

2. Migrate the databases:

   ```sh
   docker compose run api cargo run --bin squiglink_database migrate
   ```

3. Seed the database:

   ```sh
   docker compose run api cargo run --bin squiglink_database seed
   ```

4. Start the application:

   ```sh
   docker compose up
   ```

5. Open <http://localhost:3000> in a browser.

## Tips

- Run Clippy:

  ```sh
  docker compose run api cargo clippy -- --deny warnings
  ```

- Run Prettier:

  ```
  docker compose run api npx prettier --write .
  ```

- Run rustfmt:

  ```sh
  docker compose run api cargo fmt
  ```

- Run tests:

  ```sh
  docker compose run api cargo test
  ```
