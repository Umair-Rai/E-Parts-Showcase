-- Admin table
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Customer table
CREATE TABLE customer (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    number VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Category table
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pic TEXT[] NOT NULL,
    special_category BOOLEAN DEFAULT FALSE
);

-- Product table
CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT REFERENCES category(id) ON DELETE CASCADE,
    sizes TEXT[] NOT NULL,
    descriptions TEXT[] NOT NULL,
    pic TEXT[] NOT NULL,
    admin_id INT REFERENCES admin(id) ON DELETE SET NULL
);

-- Mechanical seal attributes table
CREATE TABLE mechanical_seal_attributes (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES product(id) ON DELETE CASCADE,
    product_size VARCHAR(50) NOT NULL, -- NEW ATTRIBUTE: tells which product size this record belongs to
    sizes TEXT[] NOT NULL,
    descriptions TEXT[] NOT NULL,
    material VARCHAR(255) NOT NULL,
    temperature VARCHAR(50) NOT NULL,
    pressure VARCHAR(50) NOT NULL,
    speed VARCHAR(50) NOT NULL
);


CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customer(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_item (
  id SERIAL PRIMARY KEY,
  cart_id INT NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  size VARCHAR(50),
  description TEXT
);