/**
 * Input validation functions for the bookstore API.
 *
 * Each validator receives a plain object and returns:
 *   { valid: boolean, errors: string[] }
 *
 * These are pure, synchronous functions with clear contracts --
 * excellent targets for unit testing.
 */

// -------------------------------------------------------
// validateBook — Validate a book object
// -------------------------------------------------------
/**
 * Validates a book data object.
 *
 * Required fields:
 *   - title  (string, 1-200 characters)
 *   - author (string, 1-100 characters)
 *   - price  (number, > 0)
 *   - isbn   (string, valid ISBN-13 format: 13 digits)
 *
 * Optional fields:
 *   - description (string, max 2000 characters)
 *   - publishedYear (number, 1000-current year)
 *   - genre (string)
 *
 * @param {object} data - The book data to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 *
 * @example
 *   validateBook({ title: "Dune", author: "Frank Herbert", price: 12.99, isbn: "9780441013593" })
 *   // { valid: true, errors: [] }
 */
export function validateBook(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Input must be an object"] };
  }

  // title
  if (!data.title || typeof data.title !== "string") {
    errors.push("title is required and must be a string");
  } else if (data.title.trim().length === 0) {
    errors.push("title must not be empty");
  } else if (data.title.length > 200) {
    errors.push("title must be 200 characters or fewer");
  }

  // author
  if (!data.author || typeof data.author !== "string") {
    errors.push("author is required and must be a string");
  } else if (data.author.trim().length === 0) {
    errors.push("author must not be empty");
  } else if (data.author.length > 100) {
    errors.push("author must be 100 characters or fewer");
  }

  // price
  if (data.price === undefined || data.price === null) {
    errors.push("price is required");
  } else if (typeof data.price !== "number" || isNaN(data.price)) {
    errors.push("price must be a valid number");
  } else if (data.price <= 0) {
    errors.push("price must be greater than 0");
  }

  // isbn
  if (!data.isbn || typeof data.isbn !== "string") {
    errors.push("isbn is required and must be a string");
  } else if (!/^\d{13}$/.test(data.isbn)) {
    errors.push("isbn must be a 13-digit string");
  }

  // Optional: description
  if (data.description !== undefined) {
    if (typeof data.description !== "string") {
      errors.push("description must be a string");
    } else if (data.description.length > 2000) {
      errors.push("description must be 2000 characters or fewer");
    }
  }

  // Optional: publishedYear
  if (data.publishedYear !== undefined) {
    const currentYear = new Date().getFullYear();
    if (
      typeof data.publishedYear !== "number" ||
      !Number.isInteger(data.publishedYear)
    ) {
      errors.push("publishedYear must be an integer");
    } else if (data.publishedYear < 1000 || data.publishedYear > currentYear) {
      errors.push(`publishedYear must be between 1000 and ${currentYear}`);
    }
  }

  // Optional: genre
  if (data.genre !== undefined && typeof data.genre !== "string") {
    errors.push("genre must be a string");
  }

  return { valid: errors.length === 0, errors };
}

// -------------------------------------------------------
// validateUser — Validate user registration data
// -------------------------------------------------------
/**
 * Validates user registration data.
 *
 * Required fields:
 *   - username (string, 3-30 characters, alphanumeric + underscores)
 *   - email    (string, valid email format)
 *   - password (string, min 8 characters, must contain uppercase,
 *               lowercase, and a digit)
 *
 * Optional fields:
 *   - name (string, max 100 characters)
 *
 * @param {object} data - The user data to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 *
 * @example
 *   validateUser({
 *     username: "alice42",
 *     email: "alice@example.com",
 *     password: "Str0ngPass"
 *   })
 *   // { valid: true, errors: [] }
 */
export function validateUser(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Input must be an object"] };
  }

  // username
  if (!data.username || typeof data.username !== "string") {
    errors.push("username is required and must be a string");
  } else if (data.username.length < 3 || data.username.length > 30) {
    errors.push("username must be between 3 and 30 characters");
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.push(
      "username must contain only letters, numbers, and underscores"
    );
  }

  // email
  if (!data.email || typeof data.email !== "string") {
    errors.push("email is required and must be a string");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("email must be a valid email address");
  }

  // password
  if (!data.password || typeof data.password !== "string") {
    errors.push("password is required and must be a string");
  } else {
    if (data.password.length < 8) {
      errors.push("password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(data.password)) {
      errors.push("password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(data.password)) {
      errors.push("password must contain at least one lowercase letter");
    }
    if (!/\d/.test(data.password)) {
      errors.push("password must contain at least one digit");
    }
  }

  // Optional: name
  if (data.name !== undefined) {
    if (typeof data.name !== "string") {
      errors.push("name must be a string");
    } else if (data.name.length > 100) {
      errors.push("name must be 100 characters or fewer");
    }
  }

  return { valid: errors.length === 0, errors };
}
