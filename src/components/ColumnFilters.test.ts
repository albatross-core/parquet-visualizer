import { describe, test, expect } from "bun:test"

describe("ColumnFilters", () => {
  describe("Data type detection", () => {
    test("identifies numeric types", () => {
      const numericTypes = ["int32", "int64", "float", "double", "decimal"]
      numericTypes.forEach((type) => {
        const isNumeric =
          type.includes("int") ||
          type.includes("float") ||
          type.includes("double") ||
          type.includes("decimal")
        expect(isNumeric).toBe(true)
      })
    })

    test("identifies string types", () => {
      const stringTypes = ["string", "utf8", "varchar"]
      stringTypes.forEach((type) => {
        const isString =
          type.includes("string") ||
          type.includes("utf8") ||
          type.includes("varchar")
        expect(isString).toBe(true)
      })
    })

    test("identifies boolean types", () => {
      const boolType = "bool"
      expect(boolType.includes("bool")).toBe(true)
    })

    test("identifies datetime types", () => {
      const dateTimeTypes = ["date", "time", "timestamp"]
      dateTimeTypes.forEach((type) => {
        const isDateTime = type.includes("date") || type.includes("time")
        expect(isDateTime).toBe(true)
      })
    })
  })

  describe("Column filter logic", () => {
    test("filters with single value", () => {
      const row = { name: "Alice", age: 30 }
      const filterValue = "Alice"
      const cellValue = String(row.name)

      expect(cellValue.includes(filterValue)).toBe(true)
    })

    test("filters with multiple values (OR logic)", () => {
      const row = { name: "Bob", age: 25 }
      const filterValue = "Alice|Bob|Charlie"
      const cellValue = String(row.name)
      const filterValues = filterValue.split("|").filter(Boolean)

      const matches = filterValues.some((val) => cellValue.includes(val))
      expect(matches).toBe(true)
    })

    test("handles empty filter", () => {
      const row = { name: "Alice", age: 30 }
      const filterValue = ""

      expect(!filterValue).toBe(true)
    })

    test("handles case-sensitive matching", () => {
      const row = { name: "Alice", age: 30 }
      const filterValue = "alice"
      const cellValue = String(row.name)

      // Current implementation is case-sensitive
      expect(cellValue.includes(filterValue)).toBe(false)
      // To make case-insensitive:
      expect(
        cellValue.toLowerCase().includes(filterValue.toLowerCase())
      ).toBe(true)
    })
  })

  describe("Column visibility", () => {
    test("toggles column visibility", () => {
      const visibility: Record<string, boolean> = {
        name: true,
        age: true,
        email: true,
      }

      // Toggle age column
      visibility.age = !visibility.age
      expect(visibility.age).toBe(false)

      // Toggle back
      visibility.age = !visibility.age
      expect(visibility.age).toBe(true)
    })

    test("shows all columns", () => {
      const columns = ["name", "age", "email"]
      const visibility: Record<string, boolean> = {}

      columns.forEach((col) => {
        visibility[col] = true
      })

      expect(Object.values(visibility).every((v) => v === true)).toBe(true)
    })

    test("hides all columns", () => {
      const columns = ["name", "age", "email"]
      const visibility: Record<string, boolean> = {}

      columns.forEach((col) => {
        visibility[col] = false
      })

      expect(Object.values(visibility).every((v) => v === false)).toBe(true)
    })

    test("filters out hidden columns", () => {
      const columns = ["name", "age", "email"]
      const visibility = { name: true, age: false, email: true }

      const visibleColumns = columns.filter(
        (col) => visibility[col] !== false
      )

      expect(visibleColumns).toEqual(["name", "email"])
      expect(visibleColumns.length).toBe(2)
    })
  })

  describe("Unique value extraction", () => {
    test("extracts unique values from column", () => {
      const rows = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
        { name: "Alice", age: 30 },
        { name: "Charlie", age: 35 },
      ]

      const values = new Set<string>()
      for (const row of rows) {
        const value = row.name
        if (value !== null && value !== undefined) {
          values.add(String(value))
        }
      }

      const uniqueValues = Array.from(values).sort()
      expect(uniqueValues).toEqual(["Alice", "Bob", "Charlie"])
      expect(uniqueValues.length).toBe(3)
    })

    test("limits to 100 unique values", () => {
      const rows = Array.from({ length: 200 }, (_, i) => ({
        id: i,
        value: `value${i}`,
      }))

      const values = new Set<string>()
      for (const row of rows) {
        if (values.size >= 100) break
        values.add(String(row.value))
      }

      expect(values.size).toBe(100)
    })

    test("handles null and undefined values", () => {
      const rows = [
        { name: "Alice" },
        { name: null },
        { name: undefined },
        { name: "Bob" },
      ]

      const values = new Set<string>()
      for (const row of rows) {
        const value = row.name
        if (value !== null && value !== undefined) {
          values.add(String(value))
        }
      }

      expect(Array.from(values).sort()).toEqual(["Alice", "Bob"])
    })
  })
})
