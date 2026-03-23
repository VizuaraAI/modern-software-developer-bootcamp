import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, "..", "vulnshop.db"));

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// -------------------------------------------------------
// Create tables
// -------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// -------------------------------------------------------
// Seed sample data
// -------------------------------------------------------

// ============================================================
// VULNERABILITY #8: Cleartext password storage
// ------------------------------------------------------------
// Passwords are stored as PLAIN TEXT in the database.
// No hashing algorithm (bcrypt, argon2, scrypt) is used.
// If the database is compromised, every user's password
// is immediately readable by the attacker.
// ============================================================

const seedUsers = db.prepare(`
  INSERT OR IGNORE INTO users (username, email, password, role)
  VALUES (?, ?, ?, ?)
`);

const users = [
  ["admin", "admin@vulnshop.com", "admin123", "admin"],
  ["alice", "alice@example.com", "password123", "customer"],
  ["bob", "bob@example.com", "bob-secure-pw", "customer"],
];

for (const user of users) {
  seedUsers.run(...user);
}

const seedProducts = db.prepare(`
  INSERT OR IGNORE INTO products (name, description, price, category, stock)
  VALUES (?, ?, ?, ?, ?)
`);

const products = [
  ["Wireless Mouse", "Ergonomic wireless mouse with USB receiver", 29.99, "Electronics", 150],
  ["Mechanical Keyboard", "RGB mechanical keyboard with Cherry MX switches", 89.99, "Electronics", 75],
  ["USB-C Hub", "7-in-1 USB-C hub with HDMI and ethernet", 45.99, "Electronics", 200],
  ["Laptop Stand", "Adjustable aluminum laptop stand", 34.99, "Accessories", 120],
  ["Webcam HD", "1080p HD webcam with built-in microphone", 59.99, "Electronics", 90],
  ["Desk Lamp", "LED desk lamp with adjustable brightness", 24.99, "Accessories", 300],
  ["Mouse Pad XL", "Extended mouse pad with stitched edges", 14.99, "Accessories", 500],
  ["Cable Organizer", "Silicone cable management clips (pack of 10)", 9.99, "Accessories", 1000],
];

for (const product of products) {
  seedProducts.run(...product);
}

const seedReviews = db.prepare(`
  INSERT OR IGNORE INTO reviews (product_id, user_id, rating, comment)
  VALUES (?, ?, ?, ?)
`);

const reviews = [
  [1, 2, 5, "Great mouse, very comfortable for long work sessions!"],
  [1, 3, 4, "Good value for money. Battery life is excellent."],
  [2, 2, 5, "Best keyboard I have ever used. The switches feel amazing."],
  [3, 3, 3, "Works fine but gets warm after extended use."],
];

for (const review of reviews) {
  seedReviews.run(...review);
}

export default db;
