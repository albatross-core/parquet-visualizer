// Helpers for timestamp/date cells. Kept free of React/WASM imports so
// they can run under `bun test`.

// apache-arrow returns timestamp/date values as epoch milliseconds (with a
// fractional part for micro/nanosecond columns). Convert them to ISO 8601
// strings. Anything that isn't a valid date — null, or out-of-range values
// such as int64 max used as "infinity" — is returned unchanged.
export function epochMsToIso(value: unknown): unknown {
  if (typeof value !== "number") return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}
