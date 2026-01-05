CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hashed TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,    
    user_role VARCHAR(20) NOT NULL CHECK(user_role IN ('admin','staff')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE products(
    sku VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,    
    brand TEXT,
    barcode TEXT UNIQUE,
    category TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 30,
    expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_logs(
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) REFERENCES products(sku) ON DELETE CASCADE,
    action TEXT CHECK (
        action IS NULL OR action IN ('sale', 'restock', 'update', 'added')
    ),    amount INTEGER,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username,password_hashed,email,user_role)VALUES('Staff1','$2b$10$CDb2djZFjEEIcXzREPhRReyajNR18VFojx/7dZhYy.n6Scvb/EfLy','staff1@imsasar.com','staff');
INSERT INTO users (username,password_hashed,email,user_role)VALUES('Staff2','$2b$10$08f3VMFhJobevidFl0zAh.cjMP55iItvLty4OKpGJ399nmHhKXg6q','staff2@imsasar.com','staff');
INSERT INTO users (username,password_hashed,email,user_role)VALUES('Staff3','$2b$10$BZt8BCJ16Rf5bJBEwhDpZ.bYfctAlzZQmy/pjhOq05hj5YIRWpuVW','staff3@imsasar.com','staff');
INSERT INTO users (username,password_hashed,email,user_role)VALUES('Admin1','$2a$10$0BJ6prNxLU6jf9SpgtY5VuXBjAVQ7yELRB34F.3.v3Nf.WdZ6YShK','imsdemo04@gmail.com','admin');
INSERT INTO users (username,password_hashed,email,user_role)VALUES('Admin2','$2a$10$28v.eD7A886CgdEML4KzUeFKsofndk3a0t1YWJ82/5vEGvwOqyiBe','imsdemo14@gmail.com','admin');
INSERT INTO products(sku,name,brand,category,expiry)VALUES('AP-PH-IP16','Apple iPhone16','Apple','Mobiles',NULL);
INSERT INTO products(sku,name,brand,category,expiry)VALUES('AP-PH-IP16P','Apple iPhone16 Plus','Apple','Mobiles',NULL);
INSERT INTO products(sku,name,brand,category,expiry)VALUES('AP-PH-IP16PRO','Apple iPhone16 Pro','Apple','Mobiles',NULL);
INSERT INTO products(sku,name,brand,category,expiry)VALUES('AP-PH-IP15','Apple iPhone15','Apple','Mobiles',NULL);
INSERT INTO products(sku,name,brand,category,expiry)VALUES('SS-PH-S25ULT','Samsung Galaxy S25 Ultra','Samsung','Mobiles',NULL);
INSERT INTO products(sku,name,brand,category,expiry)VALUES('SS-PH-F36-5G','Samsung Galaxy F36 5G','Samsung','Mobiles',NULL);
INSERT INTO products(sku,name,brand,category,expiry)VALUES('SS-PH-A35','Samsung Galaxy A35 5G','Samsung','Mobiles',NULL);
INSERT INTO products(sku,name,brand,category,expiry)VALUES('OP-PH-OP13ULT','OnePlus 13 Ultra','OnePlus','Mobiles',NULL);
INSERT INTO products(sku,name,brand,category,expiry)VALUES('OP-PH-NORD','OnePlus Nord','OnePlus','Mobiles',NULL);
INSERT INTO products(sku,name,brand,category,expiry)VALUES('AP-LP-MBA-M4','Apple Macbook Air M4','Apple','Laptop',NULL);
INSERT INTO products(sku,name,brand,category,expiry)VALUES('DE-LP-XPS13','Dell XPS 13','Dell','Laptop',NULL);
INSERT INTO products(sku,name,brand,category,expiry)VALUES('LE-LP-YOGA9I','Lenovo Yoga 9i','Lenovo','Laptop',NULL);

