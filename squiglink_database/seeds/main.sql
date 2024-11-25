insert into
    brands (name, url)
values
    ('Squiglink', 'https://squig.link/');

insert into
    users (name, scoring_system, username)
values
    ('Super* Review', 'five_star', 'superreview');

insert into
    databases (compensation_measurement, kind, path, user_id)
values
    ('$1', 'iems', '/', 1);

insert into
    products (brand_id, name)
values
    (1, 'Sunrise');

insert into
    stores (name, url)
values
    ('Squiglink Merch', 'https://squig.link/merch/');

insert into
    product_listings (price_usd, product_id, store_id, url)
values
    (
        1337,
        1,
        1,
        'https://squig.link/merch/sunrise-quartz'
    );

insert into
    measurement_devices (name)
values
    ('6239');

insert into
    measurements (
        channel_left,
        channel_right,
        database_id,
        label,
        measurement_device_id,
        product_id
    )
values
    ('$2', '$3', 1, '(Boop Beep)', 1, 1);

insert into
    reviews (product_id, score, url, user_id)
values
    (1, '5', 'https://squig.link/reviews/sunrise', 1);
