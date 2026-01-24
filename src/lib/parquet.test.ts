import { describe, test, expect } from "bun:test"
import { formatBytes, formatNumber } from "./utils"

describe("Utils", () => {
  describe("formatBytes", () => {
    test("formats bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 Bytes")
      expect(formatBytes(1024)).toBe("1 KB")
      expect(formatBytes(1024 * 1024)).toBe("1 MB")
      expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB")
    })

    test("formats with decimals", () => {
      expect(formatBytes(1536, 2)).toBe("1.5 KB")
      expect(formatBytes(1024 * 1.5, 2)).toBe("1.5 KB")
    })
  })

  describe("formatNumber", () => {
    test("formats numbers with locale separators", () => {
      expect(formatNumber(1000)).toContain("1")
      expect(formatNumber(1000000)).toContain("1")
    })
  })
})
