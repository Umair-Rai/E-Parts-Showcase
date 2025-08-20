-- Create ENUM type for order status
CREATE TYPE order_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);

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

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customer(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status order_status DEFAULT 'PENDING',
    admin_id INT REFERENCES admin(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE order_item (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES product(id) ON DELETE CASCADE,
    quantity INT NOT NULL
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