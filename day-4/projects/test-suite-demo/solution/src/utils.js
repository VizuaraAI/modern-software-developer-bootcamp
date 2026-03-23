/**
 * Utility functions for the bookstore application.
 *
 * These are pure functions with no side effects -- ideal targets
 * for unit testing.  Students will use Claude Code to generate
 * comprehensive tests for each function.
 */

// -------------------------------------------------------
// slugify — Convert text to a URL-friendly slug
// -------------------------------------------------------
/**
 * Converts a string to a URL-safe slug.
 *
 * - Lowercases the text
 * - Replaces spaces and non-alphanumeric characters with hyphens
 * - Collapses consecutive hyphens into one
 * - Trims leading and trailing hyphens
 *
 * @param {string} text - The input string.
 * @returns {string} The slugified string.
 *
 * @example
 *   slugify("Hello World!")        // "hello-world"
 *   slugify("  The Great Gatsby ") // "the-great-gatsby"
 */
export function slugify(text) {
  if (typeof text !== "string") {
    throw new TypeError("slugify expects a string");
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// -------------------------------------------------------
// truncate — Truncate text with an ellipsis
// -------------------------------------------------------
/**
 * Truncates a string to `maxLength` characters and appends "..."
 * if the original text was longer.  If the text is shorter than
 * or equal to `maxLength`, it is returned unchanged.
 *
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum length before truncation.
 * @returns {string} The (possibly truncated) string.
 *
 * @example
 *   truncate("Hello, World!", 5) // "Hello..."
 *   truncate("Hi", 10)           // "Hi"
 */
export function truncate(text, maxLength) {
  if (typeof text !== "string") {
    throw new TypeError("truncate expects a string as the first argument");
  }
  if (typeof maxLength !== "number" || maxLength < 0) {
    throw new TypeError("maxLength must be a non-negative number");
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + "...";
}

// -------------------------------------------------------
// isValidEmail — Email validation
// -------------------------------------------------------
/**
 * Returns `true` if the provided string looks like a valid email
 * address.  This is a reasonable (not RFC-5322-exhaustive) check.
 *
 * @param {string} email - The string to validate.
 * @returns {boolean}
 *
 * @example
 *   isValidEmail("user@example.com")  // true
 *   isValidEmail("not-an-email")      // false
 */
export function isValidEmail(email) {
  if (typeof email !== "string") {
    return false;
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

// -------------------------------------------------------
// calculateDiscount — Compute the discounted price
// -------------------------------------------------------
/**
 * Calculates the price after applying a percentage discount.
 * The result is rounded to two decimal places.
 *
 * @param {number} price - Original price (must be >= 0).
 * @param {number} percentage - Discount percentage (0-100).
 * @returns {number} The discounted price.
 * @throws {Error} If price is negative or percentage is out of range.
 *
 * @example
 *   calculateDiscount(100, 20) // 80.00
 *   calculateDiscount(49.99, 10) // 44.99
 */
export function calculateDiscount(price, percentage) {
  if (typeof price !== "number" || typeof percentage !== "number") {
    throw new TypeError("price and percentage must be numbers");
  }
  if (price < 0) {
    throw new RangeError("price must be non-negative");
  }
  if (percentage < 0 || percentage > 100) {
    throw new RangeError("percentage must be between 0 and 100");
  }

  const discount = price * (percentage / 100);
  return Math.round((price - discount) * 100) / 100;
}

// -------------------------------------------------------
// formatCurrency — Format a number as a currency string
// -------------------------------------------------------
/**
 * Formats a number as a currency string.
 *
 * Supported currency codes: "USD", "EUR", "GBP".
 *
 * @param {number} amount - The monetary amount.
 * @param {string} [currency="USD"] - ISO 4217 currency code.
 * @returns {string} The formatted currency string.
 *
 * @example
 *   formatCurrency(19.99)         // "$19.99"
 *   formatCurrency(19.99, "EUR")  // "\u20AC19.99"
 *   formatCurrency(19.99, "GBP")  // "\u00A319.99"
 */
export function formatCurrency(amount, currency = "USD") {
  if (typeof amount !== "number") {
    throw new TypeError("amount must be a number");
  }

  const symbols = {
    USD: "$",
    EUR: "\u20AC",
    GBP: "\u00A3",
  };

  const symbol = symbols[currency];
  if (!symbol) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  return `${symbol}${amount.toFixed(2)}`;
}

// -------------------------------------------------------
// paginate — Paginate an array
// -------------------------------------------------------
/**
 * Returns a page-slice of an array along with pagination metadata.
 *
 * @param {Array} items - The full array of items.
 * @param {number} [page=1] - The 1-based page number.
 * @param {number} [perPage=10] - Items per page.
 * @returns {{ data: Array, page: number, perPage: number, total: number, totalPages: number }}
 *
 * @example
 *   paginate([1,2,3,4,5], 1, 2)
 *   // { data: [1,2], page: 1, perPage: 2, total: 5, totalPages: 3 }
 */
export function paginate(items, page = 1, perPage = 10) {
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }
  if (page < 1) {
    throw new RangeError("page must be >= 1");
  }
  if (perPage < 1) {
    throw new RangeError("perPage must be >= 1");
  }

  const total = items.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const data = items.slice(start, start + perPage);

  return { data, page, perPage, total, totalPages };
}
