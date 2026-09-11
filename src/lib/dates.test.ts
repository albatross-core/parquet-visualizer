import { describe, test, expect } from "bun:test"
import { epochMsToIso } from "./dates"

describe("epochMsToIso", () => {
  test("converts epoch milliseconds to ISO 8601", () => {
    expect(epochMsToIso(0)).toBe("1970-01-01T00:00:00.000Z")
    expect(epochMsToIso(1700000000000)).toBe("2023-11-14T22:13:20.000Z")
  })

  test("truncates the fractional part of micro/nanosecond timestamps", () => {
    expect(epochMsToIso(1789127505582.646)).toBe("2026-09-11T11:51:45.582Z")
  })

  test("keeps nulls", () => {
    expect(epochMsToIso(null)).toBeNull()
    expect(epochMsToIso(undefined)).toBeUndefined()
  })

  test("keeps out-of-range values as raw numbers", () => {
    // int64 max, used by some systems as "no expiry", is not a valid JS Date
    expect(epochMsToIso(9223372036854776)).toBe(9223372036854776)
  })
})
