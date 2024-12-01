FROM rust:1.82-alpine3.20

RUN apk add --no-cache \
  musl-dev \
  npm
RUN rustup component add clippy
RUN rustup component add rustfmt

WORKDIR /api
COPY . .
RUN npm install
RUN cargo build

CMD ["cargo", "run", "--bin", "squiglink_api"]
