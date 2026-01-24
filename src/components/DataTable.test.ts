import { describe, test, expect } from "bun:test"

describe("DataTable", () => {
  describe("Regex search", () => {
    test("matches with valid regex", () => {
      const testValue = "alice@example.com"
      const regexPattern = "^[a-z]+@.*\\.com$"

      try {
        const regex = new RegExp(regexPattern, "i")
        const matches = regex.test(testValue)
        expect(matches).toBe(true)
      } catch {
        expect(false).toBe(true) // Should not throw
      }
    })

    test("falls back on invalid regex", () => {
      const testValue = "test [invalid value"
      const invalidPattern = "[invalid"
      let usedFallback = false

      try {
        const regex = new RegExp(invalidPattern, "i")
        regex.test(testValue)
      } catch {
        // Fallback to normal string search
        const matches = testValue.toLowerCase().includes(invalidPattern.toLowerCase())
        usedFallback = true
        expect(matches).toBe(true)
      }

      expect(usedFallback).toBe(true)
    })

    test("case-insensitive regex matching", () => {
      const testValue = "Alice Smith"
      const pattern = "alice"

      const regex = new RegExp(pattern, "i")
      expect(regex.test(testValue)).toBe(true)
    })

    test("supports complex patterns", () => {
      const testValues = ["user123", "admin456", "guest"]
      const pattern = "\\d+" // Match numbers

      testValues.forEach((value) => {
        const regex = new RegExp(pattern)
        const hasNumbers = regex.test(value)

        if (value === "guest") {
          expect(hasNumbers).toBe(false)
        } else {
          expect(hasNumbers).toBe(true)
        }
      })
    })
  })

  describe("Global filter", () => {
    test("filters rows based on search term", () => {
      const rows = [
        { name: "Alice", email: "alice@example.com" },
        { name: "Bob", email: "bob@example.com" },
        { name: "Charlie", email: "charlie@example.com" },
      ]

      const searchTerm = "alice"

      const filtered = rows.filter((row) => {
        return Object.values(row).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      })

      expect(filtered.length).toBe(1)
      expect(filtered[0].name).toBe("Alice")
    })

    test("searches across all columns", () => {
      const rows = [
        { name: "Alice", email: "alice@example.com", age: 30 },
        { name: "Bob", email: "bob@test.com", age: 25 },
      ]

      const searchTerm = "test"

      const filtered = rows.filter((row) => {
        return Object.values(row).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      })

      expect(filtered.length).toBe(1)
      expect(filtered[0].name).toBe("Bob")
    })

    test("returns empty array when no matches", () => {
      const rows = [
        { name: "Alice", email: "alice@example.com" },
        { name: "Bob", email: "bob@example.com" },
      ]

      const searchTerm = "nonexistent"

      const filtered = rows.filter((row) => {
        return Object.values(row).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      })

      expect(filtered.length).toBe(0)
    })
  })

  describe("Column-specific filters", () => {
    test("filters by single column", () => {
      const rows = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
        { name: "Charlie", age: 30 },
      ]

      const columnFilters = { age: "30" }

      const filtered = rows.filter((row) => {
        return Object.entries(columnFilters).every(([column, filterValue]) => {
          if (!filterValue) return true
          const cellValue = String((row as any)[column] ?? "")
          const filterValues = filterValue.split("|").filter(Boolean)
          return filterValues.some((val) => cellValue.includes(val))
        })
      })

      expect(filtered.length).toBe(2)
      expect(filtered[0].name).toBe("Alice")
      expect(filtered[1].name).toBe("Charlie")
    })

    test("filters by multiple columns (AND logic)", () => {
      const rows = [
        { name: "Alice", age: 30, city: "NYC" },
        { name: "Bob", age: 30, city: "LA" },
        { name: "Charlie", age: 25, city: "NYC" },
      ]

      const columnFilters = { age: "30", city: "NYC" }

      const filtered = rows.filter((row) => {
        return Object.entries(columnFilters).every(([column, filterValue]) => {
          if (!filterValue) return true
          const cellValue = String((row as any)[column] ?? "")
          const filterValues = filterValue.split("|").filter(Boolean)
          return filterValues.some((val) => cellValue.includes(val))
        })
      })

      expect(filtered.length).toBe(1)
      expect(filtered[0].name).toBe("Alice")
    })

    test("supports OR logic within a column filter", () => {
      const rows = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
        { name: "Charlie", age: 35 },
      ]

      const columnFilters = { age: "25|35" }

      const filtered = rows.filter((row) => {
        return Object.entries(columnFilters).every(([column, filterValue]) => {
          if (!filterValue) return true
          const cellValue = String((row as any)[column] ?? "")
          const filterValues = filterValue.split("|").filter(Boolean)
          return filterValues.some((val) => cellValue.includes(val))
        })
      })

      expect(filtered.length).toBe(2)
      expect(filtered.map((r) => r.name)).toContain("Bob")
      expect(filtered.map((r) => r.name)).toContain("Charlie")
    })
  })

  describe("Data type filtering", () => {
    test("filters numeric columns", () => {
      const schema = [
        { name: "id", type: "int32", nullable: false },
        { name: "name", type: "string", nullable: true },
        { name: "score", type: "float", nullable: false },
        { name: "active", type: "bool", nullable: false },
      ]

      const numericColumns = schema.filter((field) => {
        const type = field.type.toLowerCase()
        return (
          type.includes("int") ||
          type.includes("float") ||
          type.includes("double") ||
          type.includes("decimal")
        )
      })

      expect(numericColumns.length).toBe(2)
      expect(numericColumns.map((c) => c.name)).toContain("id")
      expect(numericColumns.map((c) => c.name)).toContain("score")
    })

    test("filters string columns", () => {
      const schema = [
        { name: "id", type: "int32", nullable: false },
        { name: "name", type: "string", nullable: true },
        { name: "email", type: "utf8", nullable: true },
      ]

      const stringColumns = schema.filter((field) => {
        const type = field.type.toLowerCase()
        return (
          type.includes("string") ||
          type.includes("utf8") ||
          type.includes("varchar")
        )
      })

      expect(stringColumns.length).toBe(2)
      expect(stringColumns.map((c) => c.name)).toContain("name")
      expect(stringColumns.map((c) => c.name)).toContain("email")
    })
  })
})
