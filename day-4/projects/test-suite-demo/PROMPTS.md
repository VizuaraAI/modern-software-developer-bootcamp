# Test Suite Demo — Build Prompts

Use Claude Code to generate a comprehensive test suite for existing utility functions. The source code is already written — your job is to use AI to generate the tests.

## Setup

1. Copy the `solution/` folder into a new folder called `test-suite-demo`
2. Run `npm install`
3. Open Claude Code: `claude`

---

## Prompt 1 — Understand the code first

```
Read src/utils.js and src/validators.js. For each function, tell me:
1. What it does
2. What inputs it accepts
3. What it returns
4. Any edge cases I should test

Do not write any tests yet — just analyze the code.
```

---

## Prompt 2 — Generate tests for utils.js

```
Read src/utils.js and generate a comprehensive test suite for all 6 functions.
Save the tests to tests/utils.test.js using Vitest syntax (import { describe, it, expect } from "vitest").

For each function, write tests that cover:
1. Happy path — normal valid inputs that should work
2. Edge cases — empty strings, zero, boundary values (e.g., exactly at the limit)
3. Invalid inputs — wrong types, negative numbers, out-of-range values
4. Every branch — every if/else and ternary must be exercised by at least one test

Functions to test:
- slugify(text) — converts text to a URL-safe slug
- truncate(text, maxLength) — truncates with ellipsis
- isValidEmail(email) — returns true/false
- calculateDiscount(price, percentage) — returns discounted price
- formatCurrency(amount, currency) — returns formatted string
- paginate(items, page, perPage) — returns a page of items with metadata

Use descriptive test names like: it("slugify: converts spaces to hyphens")
Group related tests with describe blocks.
```

---

## Prompt 3 — Generate tests for validators.js

```
Read src/validators.js and generate comprehensive tests for validateBook and validateUser.
Save to tests/validators.test.js.

For each validator, test:
1. A fully valid object that should pass
2. Each required field being missing (one test per field)
3. Each field failing its specific rule (e.g., price below 0, ISBN wrong format)
4. Multiple validation errors at once
5. Optional fields being absent (should still pass)

The validators return either null (valid) or an array of error strings (invalid).
```

---

## Prompt 4 — Run tests and fix failures

```
Run `npm test`. If any tests fail:
1. Read the failing test and the corresponding source function carefully
2. Determine whether the test expectation is wrong or the source code is wrong
3. Fix the test (do not modify the source code — it is correct)
4. Run again until all tests pass
```

---

## Prompt 5 — Check coverage and close gaps

```
Run `npm run test:coverage`. The project requires 80% minimum for lines, functions, branches, and statements.

If any metric is below 80%:
1. Look at the coverage report to see which lines or branches are not covered
2. Add targeted tests to cover those specific cases
3. Run coverage again until all thresholds pass

Then push further and aim for 100% branch coverage — every if/else, every ternary.
```

---

## Verification checklist

- [ ] `npm test` passes with zero failures
- [ ] `npm run test:coverage` shows all metrics at or above 80%
- [ ] Tests have descriptive names — someone reading only the test file understands what each function does
- [ ] Every function has at least one happy path, one edge case, and one invalid input test
- [ ] describe blocks group related tests logically

## What makes a good test

Good tests are like documentation — someone reading only `tests/utils.test.js` should understand exactly what `slugify`, `truncate`, and the other functions do without reading the source code.

Aim for:
- **Happy paths** — does it work for normal inputs?
- **Edge cases** — what happens at the boundaries?
- **Error conditions** — does it fail gracefully for bad inputs?
- **Branch coverage** — is every code path exercised?
