# Parquet Visualizer

[![Deploy to GitHub Pages](https://github.com/albatross-core/parquet-visualizer/actions/workflows/deploy.yml/badge.svg)](https://github.com/albatross-core/parquet-visualizer/actions/workflows/deploy.yml)

A beautiful, client-side Parquet file visualizer built with React, Vite, Tailwind CSS, and parquet-wasm. Upload and explore Apache Parquet files directly in your browser - no data is sent to any server.

## Features

- 📊 **Interactive Data Table** - Sort and paginate through your data
- 🔍 **Global Search** - Search across all columns in real-time
- 📋 **Schema Viewer** - Inspect column types and metadata
- 📈 **Statistics** - View file metrics (rows, columns, size, row groups)
- ⚡ **Lazy Loading** - Optimized for large files with progressive data loading
- 🎨 **Beautiful UI** - Modern design with Tailwind CSS and shadcn/ui
- 🔒 **Privacy First** - Everything runs client-side using WebAssembly
- 🚀 **Fast** - Powered by parquet-wasm for optimal performance
- 📱 **Responsive** - Works on all screen sizes

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
