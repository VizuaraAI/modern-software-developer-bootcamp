# Bookstore API — Build Prompts

Use these prompts with Claude Code to build this project from scratch. Compare your result with `solution/` when done.

## Setup

Create a new empty folder called `bookstore-api`, navigate into it, and open Claude Code:
```
mkdir bookstore-api && cd bookstore-api && claude
```

---

## Prompt 1 — Initialize the project

```
Set up a Node.js REST API project:
- Create package.json with "type": "module"
- Install these dependencies: express, cors, better-sqlite3
- Create the folder structure: src/routes/ and src/middleware/
```

---

## Prompt 2 — Build the API

```
Build a Bookstore REST API with the following specification:

Database layer (src/database.js):
- Use better-sqlite3, store data in bookstore.db at the project root
- Books table: id (INTEGER PRIMARY KEY AUTOINCREMENT), title (TEXT NOT NULL),
  author (TEXT NOT NULL), isbn (TEXT UNIQUE), price (REAL), category (TEXT),
  stock (INTEGER DEFAULT 0), created_at (TEXT DEFAULT current timestamp)
- On startup, if the books table is empty, seed 5 sample books with varied
  categories (Fiction, Science, History, etc.)
- Export functions: getBooks({ category, search, page, limit }),
  getBookById(id), createBook(data), updateBook(id, data), deleteBook(id), getStats()

Validation middleware (src/middleware/validate.js):
- createBookValidation: title required, author required, price must be a
  non-negative number if provided, stock must be a non-negative integer if provided
- updateBookValidation: same rules but all fields are optional
- validate: middleware function that checks results and returns 422 with errors array

Routes (src/routes/books.js):
- GET  /api/books         List books. Supports ?category=, ?search=, ?page=, ?limit= (default 10)
- GET  /api/stats         Return { totalBooks, totalCategories, avgPrice, totalStock }
- GET  /api/books/:id     Get single book. 404 if not found
- POST /api/books         Create book with validation. 409 if ISBN is duplicate
- PUT  /api/books/:id     Partial update with validation. 404 if not found. 409 if ISBN duplicate
- DELETE /api/books/:id   Delete book. Return { message: "Book deleted successfully" }

Server (src/index.js):
- Express app with cors() and express.json() middleware
- GET /health returns { status: "OK", timestamp, uptime }
- Mount book routes at /api
- 404 handler for unknown routes
- Global error handler that logs the error and returns { error: message }
- Start on process.env.PORT or 3000, log the URL on startup
```

---

## Prompt 3 — Test with curl

```
Start the server with `node src/index.js`, then test every endpoint using curl.
Run and show output for:
1. GET /health
2. GET /api/books
3. GET /api/books?category=Fiction
4. GET /api/books?search=history
5. POST /api/books with body {"title":"Clean Code","author":"Robert Martin","price":39.99,"category":"Technology","stock":5}
6. GET /api/books/:id  (use the id from step 5)
7. PUT /api/books/:id  with body {"price":34.99}
8. GET /api/stats
9. DELETE /api/books/:id
10. POST /api/books with missing title — verify you get a 422 error

Fix any errors before continuing.
```

---

## Verification checklist

- [ ] All 7 endpoints respond correctly
- [ ] `GET /api/books` supports `?category=` and `?search=` filtering
- [ ] `GET /api/books` returns paginated results with page/total metadata
- [ ] Duplicate ISBN returns 409
- [ ] Missing required fields return 422 with a helpful errors array
- [ ] Database file (`bookstore.db`) persists data across server restarts
- [ ] `GET /api/stats` returns correct aggregate numbers
