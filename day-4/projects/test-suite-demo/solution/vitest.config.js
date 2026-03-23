import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Look for test files in the tests/ directory
    include: ["tests/**/*.{test,spec}.{js,ts}"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.js"],
      exclude: ["node_modules/", "tests/"],
      // Thresholds students should aim for
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
