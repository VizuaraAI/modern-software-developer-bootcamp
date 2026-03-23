import { Router } from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getStats,
} from '../database.js';
import {
  createBookValidation,
  updateBookValidation,
  validate,
} from '../middleware/validate.js';

const router = Router();

// ─── GET /api/books ──────────────────────────────────────────
// List all books with optional filtering, search, and pagination
router.get('/books', (req, res) => {
  try {
    const { category, search, page, limit } = req.query;

    const result = getBooks({
      category,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// ─── GET /api/stats ──────────────────────────────────────────
// Get bookstore statistics (placed before :id to avoid conflict)
router.get('/stats', (_req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ─── GET /api/books/:id ──────────────────────────────────────
// Get a single book by ID
router.get('/books/:id', (req, res) => {
  try {
    const book = getBookById(parseInt(req.params.id, 10));

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// ─── POST /api/books ─────────────────────────────────────────
// Create a new book
router.post('/books', createBookValidation, validate, (req, res) => {
  try {
    const { title, author, isbn, price, category, stock } = req.body;
    const book = createBook({ title, author, isbn, price, category, stock });
    res.status(201).json(book);
  } catch (err) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A book with this ISBN already exists' });
    }
    console.error('Error creating book:', err);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// ─── PUT /api/books/:id ──────────────────────────────────────
// Update an existing book (partial update allowed)
router.put('/books/:id', updateBookValidation, validate, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const book = updateBook(id, req.body);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (err) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A book with this ISBN already exists' });
    }
    console.error('Error updating book:', err);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// ─── DELETE /api/books/:id ───────────────────────────────────
// Delete a book
router.delete('/books/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = deleteBook(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

export default router;
