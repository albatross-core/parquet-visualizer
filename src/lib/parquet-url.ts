// Helpers for opening Parquet files from remote URLs (S3, R2, MinIO, any
// HTTP server). Kept free of WASM imports so they can run under `bun test`.

export type UrlValidation =
  | { ok: true; url: string }
  | { ok: false; reason: string }

export function validateParquetUrl(input: string): UrlValidation {
  const trimmed = input.trim()

  if (!trimmed) {
    return { ok: false, reason: "Enter a URL to a Parquet file" }
  }

  if (trimmed.startsWith("s3://")) {
    return {
      ok: false,
      reason:
        "s3:// URLs can't be fetched by a browser. Generate a presigned URL (aws s3 presign s3://bucket/key) or use the object's https:// URL if the bucket is public.",
    }
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return { ok: false, reason: "That doesn't look like a valid URL" }
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "Only http(s) URLs are supported" }
  }

  return { ok: true, url: url.toString() }
}

export function fileNameFromUrl(urlString: string): string {
  try {
    const url = new URL(urlString)
    const segments = url.pathname.split("/").filter(Boolean)
    const last = segments[segments.length - 1]
    if (last) {
      return decodeURIComponent(last)
    }
  } catch {
    // fall through to default
  }
  return "remote.parquet"
}

// Cross-origin failures surface as opaque network errors — the browser hides
// whether it was CORS, DNS, or a dropped connection. Match the messages each
// engine uses for them (Chrome/Firefox/Safari respectively).
export function isLikelyCorsError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return /failed to fetch|networkerror|load failed|cors|cross-origin/i.test(
    message
  )
}

export function s3CorsSnippet(origin: string): string {
  return JSON.stringify(
    [
      {
        AllowedOrigins: [origin],
        AllowedMethods: ["GET", "HEAD"],
        AllowedHeaders: ["*"],
        ExposeHeaders: ["Content-Range", "Content-Length", "ETag"],
        MaxAgeSeconds: 3000,
      },
    ],
    null,
    2
  )
}
