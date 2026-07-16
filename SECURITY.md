# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Parquet Visualizer, please report it privately — **do not open a public issue**.

Use GitHub's private vulnerability reporting:

1. Go to the repository's [Security tab](https://github.com/albatross-core/parquet-visualizer/security)
2. Click **"Report a vulnerability"**
3. Describe the issue, steps to reproduce, and potential impact

We will acknowledge your report as soon as possible and keep you informed of progress toward a fix.

## Scope

Parquet Visualizer runs entirely client-side in the browser. Files you open are processed locally with WebAssembly and are never uploaded to any server. Relevant security concerns include:

- Cross-site scripting (XSS) via malicious Parquet file contents rendered in the UI
- Memory-safety issues triggered by crafted Parquet files (via parquet-wasm / Apache Arrow)
- Vulnerabilities in the build or deployment pipeline

## Supported Versions

Only the latest version deployed from the `main` branch is supported.
