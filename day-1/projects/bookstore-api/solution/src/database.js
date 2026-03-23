import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Initialize Database ─────────────────────────────────────
const dbPath = join(__dirname, '..', 'bookstore.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Create Tables ───────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    author      TEXT    NOT NULL,
    isbn        TEXT    UNIQUE,
    price       REAL    NOT NULL CHECK (price > 0),
    category    TEXT    NOT NULL CHECK (category IN ('fiction', 'non-fiction', 'science', 'technology', 'history')),
    stock       INTEGER DEFAULT 0,
    createdAt   TEXT    DEFAULT CURRENT_TIMESTAMP,
    updatedAt   TEXT    DEFAULT CURRENT_TIMESTAMP
  );
`);

// ─── Seed Sample Data ────────────────────────────────────────
const count = db.prepare('SELECT COUNT(*) AS count FROM books').get();

if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO books (title, author, isbn, price, category, stock)
    VALUES (@title, @author, @isbn, @price, @category, @stock)
  `);

  const seedBooks = [
    {
      title: 'The Pragmatic Programmer',
      author: 'David Thomas & Andrew Hunt',
      isbn: '9780135957059',
      price: 49.99,
      category: 'technology',
      stock: 25,
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '9780441013593',
      price: 15.99,
      category: 'fiction',
      stock: 40,
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '9780553380163',
      price: 18.99,
      category: 'science',
      stock: 30,
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      price: 39.99,
      category: 'technology',
      stock: 20,
    },
    {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      isbn: '9780062316097',
      price: 22.99,
      category: 'history',
      stock: 35,
    },
  ];

  const insertMany = db.transaction((books) => {
    for (const book of books) {
      insert.run(book);
    }
  });

  insertMany(seedBooks);
  console.log('Database seeded with 5 sample books.');
}

// ─── Helper Functions ────────────────────────────────────────

/**
 * Get all books with optional filtering, search, and pagination.
 */
export function getBooks({ category, search, page = 1, limit = 10 } = {}) {
  let whereClause = 'WHERE 1=1';
  const params = {};

  if (category) {
    whereClause += ' AND category = @category';
    params.category = category;
  }

  if (search) {
    whereClause += ' AND (title LIKE @search OR author LIKE @search)';
    params.search = `%${search}%`;
  }

  // Get total count
  const totalStmt = db.prepare(`SELECT COUNT(*) AS total FROM books ${whereClause}`);
  const { total } = totalStmt.get(params);

  // Get paginated results
  const offset = (page - 1) * limit;
  const booksStmt = db.prepare(
    `SELECT * FROM books ${whereClause} ORDER BY createdAt DESC LIMIT @limit OFFSET @offset`
  );
  const books = booksStmt.all({ ...params, limit, offset });

  return {
    books,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single book by ID.
 */
export function getBookById(id) {
  return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
}

/**
 * Create a new book.
 */
export function createBook({ title, author, isbn, price, category, stock = 0 }) {
  const stmt = db.prepare(`
    INSERT INTO books (title, author, isbn, price, category, stock)
    VALUES (@title, @author, @isbn, @price, @category, @stock)
  `);

  const result = stmt.run({ title, author, isbn: isbn || null, price, category, stock });
  return getBookById(result.lastInsertRowid);
}

/**
 * Update an existing book by ID (partial update).
 */
export function updateBook(id, fields) {
  const existing = getBookById(id);
  if (!existing) return null;

  const allowedFields = ['title', 'author', 'isbn', 'price', 'category', 'stock'];
  const updates = [];
  const params = { id };

  for (const field of allowedFields) {
    if (fields[field] !== undefined) {
      updates.push(`${field} = @${field}`);
      params[field] = fields[field];
    }
  }

  if (updates.length === 0) return existing;

  updates.push("updatedAt = datetime('now')");

  const sql = `UPDATE books SET ${updates.join(', ')} WHERE id = @id`;
  db.prepare(sql).run(params);

  return getBookById(id);
}

/**
 * Delete a book by ID. Returns true if deleted, false if not found.
 */
export function deleteBook(id) {
  const result = db.prepare('DELETE FROM books WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * Get bookstore statistics.
 */
export function getStats() {
  const totalBooks = db.prepare('SELECT COUNT(*) AS count FROM books').get().count;

  const totalValue = db.prepare(
    'SELECT COALESCE(SUM(price * stock), 0) AS value FROM books'
  ).get().value;

  const categoryRows = db.prepare(
    'SELECT category, COUNT(*) AS count FROM books GROUP BY category ORDER BY category'
  ).all();

  const booksByCategory = {};
  for (const row of categoryRows) {
    booksByCategory[row.category] = row.count;
  }

  const averagePrice = db.prepare(
    'SELECT COALESCE(AVG(price), 0) AS avg FROM books'
  ).get().avg;

  return {
    totalBooks,
    totalValue: Math.round(totalValue * 100) / 100,
    booksByCategory,
    averagePrice: Math.round(averagePrice * 100) / 100,
  };
}

export default db;
