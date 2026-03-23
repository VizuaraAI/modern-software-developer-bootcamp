# Test Suite Demo -- AI-Generated Test Writing

This is a starter project for the Day 4 workshop exercise on using AI to
generate comprehensive test suites. The project contains well-documented
utility and validation functions with **zero tests** -- your job is to
use Claude Code to generate them.

## Getting started

```bash
# Install dependencies
npm install

# Run tests (will show 0 tests initially)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Project structure

```
test-suite-demo/
  src/
    utils.js         # 6 pure utility functions
    validators.js    # 2 input validation functions
  tests/
    .gitkeep         # Empty -- you will generate tests here
  vitest.config.js   # Vitest configuration with coverage thresholds
  package.json
```

## Exercise

### Step 1 -- Generate tests with Claude Code

Open this project in Claude Code and try prompts like:

```
> Read src/utils.js and generate comprehensive tests for all functions.
> Save them to tests/utils.test.js
```

```
> Generate tests for src/validators.js that cover valid inputs,
> invalid inputs, edge cases, and boundary values. Save to
> tests/validators.test.js
```

### Step 2 -- Run the tests

```bash
npm test
```

Do they all pass? If not, work with Claude Code to fix any issues.

### Step 3 -- Check coverage

```bash
npm run test:coverage
```

The project has coverage thresholds set at **80%** for lines, functions,
branches, and statements. Did the AI-generated tests meet those
thresholds?

### Step 4 -- Improve the tests

Ask Claude Code to:
- Add edge cases it missed
- Test error conditions and thrown exceptions
- Achieve 100% branch coverage
- Add descriptive test names

### Functions to test

#### `src/utils.js`
| Function | Description |
|----------|-------------|
| `slugify(text)` | Convert text to a URL-safe slug |
| `truncate(text, maxLength)` | Truncate with ellipsis |
| `isValidEmail(email)` | Email format validation |
| `calculateDiscount(price, percentage)` | Apply percentage discount |
| `formatCurrency(amount, currency)` | Format as currency string |
| `paginate(items, page, perPage)` | Paginate an array |

#### `src/validators.js`
| Function | Description |
|----------|-------------|
| `validateBook(data)` | Validate a book object (title, author, price, isbn) |
| `validateUser(data)` | Validate user registration data (username, email, password) |

## Tips

- Good tests are **descriptive**: someone reading only the test file
  should understand what the function does.
- Cover **happy paths**, **edge cases**, **invalid inputs**, and
  **boundary values**.
- Use `describe` blocks to group related tests and `it`/`test` for
  individual cases.
- Aim for 100% branch coverage -- every `if`, `else`, and ternary.
