import { describe, test, expect } from "bun:test"
import {
  tryParseJson,
  stringifyPretty,
  rowToJson,
} from "./json-view"

describe("tryParseJson", () => {
  test("parses JSON object strings", () => {
    const result = tryParseJson('{"category_id":"3.4","device_id":"web-f731"}')
    expect(result).toEqual({ category_id: "3.4", device_id: "web-f731" })
  })

  test("parses JSON array strings", () => {
    expect(tryParseJson("[1, 2, 3]")).toEqual([1, 2, 3])
  })

  test("tolerates surrounding whitespace", () => {
    expect(tryParseJson('  {"a": 1}  ')).toEqual({ a: 1 })
  })

  test("returns undefined for plain strings", () => {
    expect(tryParseJson("ItemViewedEvent")).toBeUndefined()
  })

  test("returns undefined for scalar JSON", () => {
    expect(tryParseJson("123")).toBeUndefined()
    expect(tryParseJson("true")).toBeUndefined()
    expect(tryParseJson('"quoted"')).toBeUndefined()
    expect(tryParseJson("null")).toBeUndefined()
  })

  test("returns undefined for malformed JSON", () => {
    expect(tryParseJson('{"unclosed": ')).toBeUndefined()
    expect(tryParseJson("{not json}")).toBeUndefined()
  })

  test("returns undefined for non-strings", () => {
    expect(tryParseJson(42)).toBeUndefined()
    expect(tryParseJson(null)).toBeUndefined()
    expect(tryParseJson({ already: "parsed" })).toBeUndefined()
  })
})

describe("stringifyPretty", () => {
  test("pretty-prints with two-space indentation", () => {
    expect(stringifyPretty({ a: 1 })).toBe('{\n  "a": 1\n}')
  })

  test("handles BigInt values from Arrow int64 columns", () => {
    expect(stringifyPretty({ ts: 1784109600098n })).toBe(
      '{\n  "ts": "1784109600098"\n}'
    )
  })

  test("handles undefined", () => {
    expect(stringifyPretty(undefined)).toBe("undefined")
  })
})

describe("rowToJson", () => {
  test("expands embedded JSON payload strings", () => {
    const row = {
      event: "ItemViewedEvent",
      payload: '{"category_id":"3.5","item_price":40}',
    }
    const parsed = JSON.parse(rowToJson(row, ["event", "payload"]))
    expect(parsed.event).toBe("ItemViewedEvent")
    expect(parsed.payload).toEqual({ category_id: "3.5", item_price: 40 })
  })

  test("respects column order and preserves nulls", () => {
    const row = { b: null, a: 1 }
    expect(rowToJson(row, ["a", "b"])).toBe('{\n  "a": 1,\n  "b": null\n}')
  })

  test("handles BigInt cell values", () => {
    const row = { ts: 1784109600331n }
    const parsed = JSON.parse(rowToJson(row, ["ts"]))
    expect(parsed.ts).toBe("1784109600331")
  })
})
