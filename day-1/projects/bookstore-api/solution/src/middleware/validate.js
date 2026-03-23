import { body, validationResult } from 'express-validator';

// ─── Allowed Categories ──────────────────────────────────────
const CATEGORIES = ['fiction', 'non-fiction', 'science', 'technology', 'history'];

// ─── Validation Rules: Create Book (POST) ────────────────────
export const createBookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be 200 characters or fewer'),

  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required'),

  body('isbn')
    .optional({ values: 'null' })
    .trim()
    .isLength({ min: 13, max: 13 })
    .withMessage('ISBN must be exactly 13 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a number greater than 0'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
];

// ─── Validation Rules: Update Book (PUT) ─────────────────────
export const updateBookValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title must be 200 characters or fewer'),

  body('author')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Author cannot be empty'),

  body('isbn')
    .optional({ values: 'null' })
    .trim()
    .isLength({ min: 13, max: 13 })
    .withMessage('ISBN must be exactly 13 characters'),

  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be a number greater than 0'),

  body('category')
    .optional()
    .trim()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
];

// ─── Validation Error Handler ────────────────────────────────
export function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
}
