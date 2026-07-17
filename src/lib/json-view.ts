// Helpers for the row inspector's JSON view. Kept free of React/WASM
// imports so they can run under `bun test`.

// Parse a cell value that contains embedded JSON (a common pattern for
// event payload columns). Returns undefined unless the string parses to
// an object or array — scalars like "123" stay plain text.
export function tryParseJson(
  value: unknown
): Record<string, unknown> | unknown[] | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return undefined
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (parsed !== null && typeof parsed === "object") {
      return parsed as Record<string, unknown> | unknown[]
    }
    return undefined
  } catch {
    return undefined
  }
}

// Arrow returns BigInt for int64 columns, which JSON.stringify rejects.
export function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") return value.toString()
  return value
}

export function stringifyPretty(value: unknown): string {
  const result = JSON.stringify(value, jsonReplacer, 2)
  return result === undefined ? String(value) : result
}

// Serialize a full row for the copy button, expanding embedded JSON
// strings so the copied output matches what the inspector displays.
export function rowToJson(
  row: Record<string, unknown>,
  columns: string[]
): string {
  const out: Record<string, unknown> = {}
  for (const col of columns) {
    const value = row[col]
    const parsed = tryParseJson(value)
    out[col] = parsed !== undefined ? parsed : value
  }
  return stringifyPretty(out)
}
