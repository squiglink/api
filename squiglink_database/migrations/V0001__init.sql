create type database_kind as enum('earbuds', 'headphones', 'iems');

create type user_scoring_system as enum(
    'five_star',
    'hundred_point',
    'ten_point_decimal',
    'ten_point'
);

create table
    brands (
        id bigserial primary key,
        name text not null unique,
        url text unique
    );

create table
    users (
        id bigserial primary key,
        display_name text not null unique,
        scoring_system user_scoring_system not null,
        username text not null unique
    );

create table
    databases (
        id bigserial primary key,
        compensation_measurement text,
        kind database_kind not null,
        path text not null,
        user_id bigint references users (id) not null,
        unique (path, user_id)
    );

create table
    measurement_devices (
        id bigserial primary key,
        name text not null unique
    );

create table
    models (
        id bigserial primary key,
        brand_id bigint references brands (id) not null,
        name text not null unique,
        preferred_shop_url text,
        unique (brand_id, name)
    );

create table
    measurements (
        id bigserial primary key,
        channel_left text,
        channel_right text,
        database_id bigint references databases (id) not null,
        label text,
        measurement_device_id bigint references measurement_devices (id) not null,
        model_id bigint references models (id) not null,
        unique (label, model_id)
    );

alter table measurements
add constraint measurements_either_channel_is_not_null check (
    channel_left is not null
    or channel_right is not null
);

create table
    reviews (
        id bigserial primary key,
        model_id bigint references models (id) not null,
        score real,
        url text not null,
        user_id bigint references users (id) not null,
        unique (model_id, user_id)
    );
