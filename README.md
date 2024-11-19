# Squiglink

## Setup

1. Install dependencies:

   ```sh
   # Cargo
   docker compose run backend cargo build

   # npm
   docker compose run backend npm install
   ```

2. Migrate the databases:

   ```sh
   docker compose run backend cargo run --bin squiglink_database
   ```

3. Start the application:

   ```sh
   docker compose up
   ```

4. Open <http://localhost:3000> in a browser.

## Tips

- Run Clippy:

  ```sh
  docker compose run backend cargo clippy -- --deny warnings
  ```

- Run Prettier:

  ```
  docker compose run backend npx prettier --write .
  ```

- Run rustfmt:

  ```sh
  docker compose run backend cargo fmt
  ```

- Run tests:

  ```sh
  docker compose run backend cargo test
  ```
