# Parquet Visualizer

[![Deploy to GitHub Pages](https://github.com/albatross-core/parquet-visualizer/actions/workflows/deploy.yml/badge.svg)](https://github.com/albatross-core/parquet-visualizer/actions/workflows/deploy.yml)

A beautiful, client-side Parquet file visualizer built with React, Vite, Tailwind CSS, and parquet-wasm. Upload and explore Apache Parquet files directly in your browser - no data is sent to any server.

## Features

- 📊 **Interactive Data Table** - Sort and paginate through your data
- 🌐 **Open from URL** - Stream files from S3, R2, MinIO, or any HTTP server using range requests — browse huge files without downloading them
- 🔍 **Global Search** - Search across all columns in real-time
- 🧾 **Row Inspector** - Click any row to see all its values; embedded JSON payloads are parsed and pretty-printed with syntax highlighting
- 📋 **Schema Viewer** - Inspect column types and metadata
- 📈 **Statistics** - View file metrics (rows, columns, size, row groups)
- ⚡ **Lazy Loading** - Optimized for large files with progressive data loading
- 🎨 **Beautiful UI** - Modern design with Tailwind CSS and shadcn/ui
- 🔒 **Privacy First** - Everything runs client-side using WebAssembly
- 🚀 **Fast** - Powered by parquet-wasm for optimal performance
- 📱 **Responsive** - Works on all screen sizes

## Opening Files from S3 (or Any URL)

Paste an `https://` URL into the "Open from URL" field (or link directly with `?url=https://...`). The file is read with **HTTP range requests** — only the footer metadata and the row groups you actually view are downloaded, so multi-gigabyte files open in seconds. As always, data goes straight from the server to your browser; nothing passes through ours.

### Private buckets

Browsers can't use your AWS console session or `s3://` URIs — S3 requests must be presigned or signed with credentials. The easiest path is a presigned URL:

```bash
aws s3 presign s3://my-bucket/data.parquet --expires-in 3600
```

Paste the resulting URL into the app.

### CORS setup (required once per bucket)

Your bucket must allow cross-origin reads from the app. In the **S3 console** → your bucket → **Permissions** → **Cross-origin resource sharing (CORS)** → **Edit**, paste:

```json
[
  {
    "AllowedOrigins": ["https://albatross-core.github.io"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Range", "Content-Length", "ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

(If you self-host the app, replace the origin with your own.) Note that CORS only permits the browser to make the request — it does not make private objects public. S3-compatible stores like MinIO and Cloudflare R2 have equivalent CORS settings and work the same way.

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Deployment to GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Under "Source", select "GitHub Actions"
4. The workflow will automatically deploy on push to main/master

## Tech Stack

- [Vite](https://vite.dev/) - Build tool
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS v4](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [parquet-wasm](https://github.com/kylebarron/parquet-wasm) - Parquet reading
- [Apache Arrow](https://arrow.apache.org/docs/js/) - Data processing
- [TanStack Table](https://tanstack.com/table) - Table functionality

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request. To report a security issue, see the [Security Policy](SECURITY.md).

## License

[MIT](LICENSE) © Albatross AI
