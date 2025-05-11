ALTER TABLE users ADD COLUMN default_shipping_address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL;
