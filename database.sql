
CREATE TYPE order_status AS ENUM (
    'PENDING', 'IN PROCESS', 'DELIVERED', 'CANCELLED'
);

CREATE TYPE payment_status AS ENUM (
    'PENDING', 'IN PROCESS', 'COMPLETED', 'CANCELLED'
);


-- Customer(id, name, email_address, phone_number, password_hash)
CREATE TABLE customer (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL
        CHECK (name ~ '^[A-Za-z ]+$'),
    email_address VARCHAR(50) NOT NULL UNIQUE,
    phone_number CHAR(10)
        CHECK (phone_number ~ '^[0-9]{10}$'),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories(category_id, category_name)
CREATE TABLE categories (
    category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Addresses(id, customer_id, city, state, country, address_type, postal_code)
CREATE TABLE addresses (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INT NOT NULL,
    address_line VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(50) DEFAULT 'INDIA' NOT NULL,
    address_type VARCHAR(100) NOT NULL,
    postal_code VARCHAR(15),
    FOREIGN KEY (customer_id)
        REFERENCES customer(id)
        ON DELETE CASCADE
);

-- Products(product_id, image_url, product_name, product_description, category_id, stock, original_price, selling_price)
CREATE TABLE products (
    product_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    product_description VARCHAR(1000) NOT NULL,
    category_id INT NOT NULL,
    stock NUMERIC(5,0) NOT NULL
        CHECK (stock >= 0),
    original_price NUMERIC(10,2) NOT NULL
        CHECK (original_price > 0),
    selling_price NUMERIC(10,2)
        CHECK (
            selling_price IS NULL
            OR (
                selling_price > 0
                AND selling_price <= original_price
            )
        ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE CASCADE
);

-- Orders(order_id, customer_id, status, shipping_address_id, total_amount)
CREATE TABLE orders (
    order_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INT NOT NULL,
    status order_status NOT NULL DEFAULT 'PENDING',
    shipping_address_id INT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL
        CHECK (total_amount > 0),
    FOREIGN KEY (customer_id)
        REFERENCES customer(id)
        ON DELETE CASCADE,
    FOREIGN KEY (shipping_address_id)
        REFERENCES addresses(id)
        ON DELETE CASCADE
);

-- Order Items(order_id, product_id, quantity)
CREATE TABLE order_item (
    order_id INT
        REFERENCES orders(order_id)
        ON DELETE CASCADE,
    product_id INT
        REFERENCES products(product_id),
    price_at_purchase NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL
        CHECK (quantity > 0),
    PRIMARY KEY (order_id, product_id)
);

-- Payments(payment_id, order_id, sender_id, amount, gateway_id, gateway_order_id, gateway_payment_id, signature, status)
CREATE TABLE payment (
    payment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INT
        REFERENCES orders(order_id)
        ON DELETE CASCADE,
    sender_id VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL
        CHECK (amount > 0),
    gateway_id VARCHAR(255) NOT NULL,
    gateway_order_id VARCHAR(255) NOT NULL,
    gateway_payment_id VARCHAR(255) NOT NULL,
    signature VARCHAR(255) NOT NULL,
    status payment_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart(cart_id, customer_id)
CREATE TABLE cart (
    cart_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INT NOT NULL UNIQUE
        REFERENCES customer(id)
        ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items(cart_id, product_id, quantity)
CREATE TABLE cart_item (
    cart_id INT
        REFERENCES cart(cart_id),
    product_id INT
        REFERENCES products(product_id),
    quantity INT NOT NULL
        CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_id, product_id)
);


-- indexes for the foreign keys 
CREATE INDEX idx_addresses_customer 
ON addresses(customer_id);

CREATE INDEX idx_products_category 
ON products(category_id);

CREATE INDEX idx_order_customer 
ON orders(customer_id);

CREATE INDEX idx_order_shipping 
ON orders(shipping_address_id);

CREATE INDEX idx_order_item_product 
ON order_item(product_id);

CREATE INDEX idx_payement_order 
ON payment(order_id);

CREATE INDEX idx_cart_item_product 
ON cart_item(product_id);

