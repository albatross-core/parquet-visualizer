import { describe, test, expect } from "bun:test"
import {
  validateParquetUrl,
  fileNameFromUrl,
  isLikelyCorsError,
  s3CorsSnippet,
} from "./parquet-url"

describe("validateParquetUrl", () => {
  test("accepts https URLs", () => {
    const result = validateParquetUrl("https://bucket.s3.amazonaws.com/data.parquet")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe("https://bucket.s3.amazonaws.com/data.parquet")
    }
  })

  test("accepts http URLs (local MinIO)", () => {
    expect(validateParquetUrl("http://localhost:9000/bucket/data.parquet").ok).toBe(true)
  })

  test("trims whitespace", () => {
    const result = validateParquetUrl("  https://example.com/f.parquet  ")
    expect(result.ok).toBe(true)
  })

  test("preserves presigned URL query strings", () => {
    const presigned =
      "https://bucket.s3.amazonaws.com/data.parquet?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=abc"
    const result = validateParquetUrl(presigned)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toContain("X-Amz-Signature=abc")
    }
  })

  test("rejects s3:// URLs with presign guidance", () => {
    const result = validateParquetUrl("s3://my-bucket/data.parquet")
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toContain("presigned")
    }
  })

  test("rejects empty input", () => {
    expect(validateParquetUrl("").ok).toBe(false)
    expect(validateParquetUrl("   ").ok).toBe(false)
  })

  test("rejects non-URL text", () => {
    expect(validateParquetUrl("not a url").ok).toBe(false)
  })

  test("rejects non-http protocols", () => {
    expect(validateParquetUrl("ftp://example.com/data.parquet").ok).toBe(false)
    expect(validateParquetUrl("file:///tmp/data.parquet").ok).toBe(false)
  })
})

describe("fileNameFromUrl", () => {
  test("extracts the last path segment", () => {
    expect(fileNameFromUrl("https://example.com/path/to/data.parquet")).toBe("data.parquet")
  })

  test("ignores query strings", () => {
    expect(
      fileNameFromUrl("https://bucket.s3.amazonaws.com/data.parquet?X-Amz-Signature=abc")
    ).toBe("data.parquet")
  })

  test("decodes percent-encoded names", () => {
    expect(fileNameFromUrl("https://example.com/my%20file.parquet")).toBe("my file.parquet")
  })

  test("falls back for URLs without a path", () => {
    expect(fileNameFromUrl("https://example.com/")).toBe("remote.parquet")
    expect(fileNameFromUrl("not a url")).toBe("remote.parquet")
  })
})

describe("isLikelyCorsError", () => {
  test("matches Chrome's opaque fetch error", () => {
    expect(isLikelyCorsError(new TypeError("Failed to fetch"))).toBe(true)
  })

  test("matches Firefox's network error", () => {
    expect(
      isLikelyCorsError(new TypeError("NetworkError when attempting to fetch resource."))
    ).toBe(true)
  })

  test("matches Safari's load failure", () => {
    expect(isLikelyCorsError(new TypeError("Load failed"))).toBe(true)
  })

  test("matches string errors from WASM", () => {
    expect(isLikelyCorsError("Failed to fetch")).toBe(true)
  })

  test("does not match parse errors", () => {
    expect(isLikelyCorsError(new Error("Invalid Parquet magic bytes"))).toBe(false)
  })
})

describe("s3CorsSnippet", () => {
  test("produces valid JSON with the given origin", () => {
    const snippet = s3CorsSnippet("https://example.github.io")
    const parsed = JSON.parse(snippet)
    expect(parsed[0].AllowedOrigins).toEqual(["https://example.github.io"])
    expect(parsed[0].AllowedMethods).toEqual(["GET", "HEAD"])
    expect(parsed[0].ExposeHeaders).toContain("Content-Range")
  })
})
