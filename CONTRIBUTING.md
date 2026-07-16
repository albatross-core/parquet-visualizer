# Contributing to Parquet Visualizer

Thanks for your interest in contributing! This document explains how to get set up and what we expect from contributions.

## Getting Started

Parquet Visualizer uses [Bun](https://bun.sh/) as its package manager and test runner.

```bash
# Install dependencies
bun install

# Start the dev server
bun run dev
```

The app runs entirely client-side — there is no backend to configure.

## Development Workflow

1. Fork the repository and create a branch from `main`.
2. Make your changes.
3. Make sure everything passes locally:

```bash
# Unit tests
bun run test

# Lint
bun run lint

# Type-check and production build
bun run build

# End-to-end tests (requires Playwright browsers)
bun run test:e2e
```

4. Open a pull request against `main`. CI runs unit tests, the build, and Playwright e2e tests on every PR.

## Project Structure

```
src/
  components/     React components (DataTable, SchemaViewer, StatsCards, ...)
  components/ui/  shadcn/ui primitives
  lib/            Parquet parsing and utilities
e2e/              Playwright end-to-end tests
```

## Guidelines

- **Keep it client-side.** A core promise of this project is that no data leaves the browser. Changes that upload user data anywhere will not be accepted.
- **Add tests** for new behavior — unit tests next to the code (`*.test.ts`) and e2e tests in `e2e/` for user-facing flows.
- **Match the existing style.** ESLint is the source of truth; run `bun run lint` before pushing.
- **Keep PRs focused.** Small, single-purpose PRs are reviewed faster.

## Reporting Bugs and Requesting Features

Please use the [issue templates](https://github.com/albatross-core/parquet-visualizer/issues/new/choose). For security issues, see [SECURITY.md](SECURITY.md) — do not open a public issue.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
