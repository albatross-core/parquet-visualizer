import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Filter,
  Columns3,
  Type,
  X,
  ChevronDown,
} from "lucide-react"
import type { ParquetSchema } from "@/lib/parquet"

interface ColumnFiltersProps {
  schema: ParquetSchema[]
  columnVisibility: Record<string, boolean>
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void
  dataTypeFilter: string | null
  onDataTypeFilterChange: (type: string | null) => void
  columnFilters: Record<string, string>
  onColumnFilterChange: (column: string, value: string) => void
  onClearColumnFilter: (column: string) => void
  rows: Record<string, unknown>[]
}

export function ColumnFilters({
  schema,
  columnVisibility,
  onColumnVisibilityChange,
  dataTypeFilter,
  onDataTypeFilterChange,
  columnFilters,
  onColumnFilterChange,
  onClearColumnFilter,
  rows,
}: ColumnFiltersProps) {
  const [columnFilterOpen, setColumnFilterOpen] = useState<string | null>(null)

  // Get unique data types
  const dataTypes = useMemo(() => {
    const types = new Set<string>()
    schema.forEach((field) => {
      const type = field.type.toLowerCase()
      if (type.includes("int") || type.includes("float") || type.includes("double") || type.includes("decimal")) {
        types.add("numeric")
      } else if (type.includes("string") || type.includes("utf8") || type.includes("varchar")) {
        types.add("string")
      } else if (type.includes("bool")) {
        types.add("boolean")
      } else if (type.includes("date") || type.includes("time")) {
        types.add("datetime")
      }
    })
    return Array.from(types)
  }, [schema])

  // Get filtered schema based on data type filter
  const filteredSchema = useMemo(() => {
    if (!dataTypeFilter) return schema

    return schema.filter((field) => {
      const type = field.type.toLowerCase()
      switch (dataTypeFilter) {
        case "numeric":
          return type.includes("int") || type.includes("float") || type.includes("double") || type.includes("decimal")
        case "string":
          return type.includes("string") || type.includes("utf8") || type.includes("varchar")
        case "boolean":
          return type.includes("bool")
        case "datetime":
          return type.includes("date") || type.includes("time")
        default:
          return true
      }
    })
  }, [schema, dataTypeFilter])

  // Get unique values for a column (limited to first 100 unique values)
  const getColumnUniqueValues = (columnName: string) => {
    const values = new Set<string>()
    for (const row of rows) {
      if (values.size >= 100) break
      const value = row[columnName]
      if (value !== null && value !== undefined) {
        values.add(String(value))
      }
    }
    return Array.from(values).sort().slice(0, 100)
  }

  const toggleAllColumns = (visible: boolean) => {
    const newVisibility: Record<string, boolean> = {}
    schema.forEach((field) => {
      newVisibility[field.name] = visible
    })
    onColumnVisibilityChange(newVisibility)
  }

  const visibleCount = Object.values(columnVisibility).filter(Boolean).length
  const totalCount = schema.length
  const activeFilterCount = Object.keys(columnFilters).length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Column Visibility */}
        <DropdownMenu
          trigger={
            <Button variant="outline" size="sm" className="gap-2">
              <Columns3 className="w-4 h-4" />
              Columns
              {visibleCount < totalCount && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                  {visibleCount}/{totalCount}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3" />
            </Button>
          }
        >
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => toggleAllColumns(true)}>
            Show all
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toggleAllColumns(false)}>
            Hide all
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            {schema.map((field) => (
              <DropdownMenuCheckboxItem
                key={field.name}
                checked={columnVisibility[field.name] !== false}
                onSelect={() => {
                  onColumnVisibilityChange({
                    ...columnVisibility,
                    [field.name]: !columnVisibility[field.name],
                  })
                }}
              >
                {field.name}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </DropdownMenu>

        {/* Data Type Filter */}
        <DropdownMenu
          trigger={
            <Button variant="outline" size="sm" className="gap-2">
              <Type className="w-4 h-4" />
              Type
              {dataTypeFilter && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                  {dataTypeFilter}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3" />
            </Button>
          }
        >
          <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onDataTypeFilterChange(null)}>
            All types
          </DropdownMenuItem>
          {dataTypes.map((type) => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={dataTypeFilter === type}
              onSelect={() => onDataTypeFilterChange(type === dataTypeFilter ? null : type)}
            >
              {type}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenu>

        {/* Column-specific Filters */}
        <DropdownMenu
          trigger={
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Column Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3" />
            </Button>
          }
        >
          <DropdownMenuLabel>Filter by column</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            {filteredSchema.map((field) => (
              <DropdownMenuItem
                key={field.name}
                onSelect={() => setColumnFilterOpen(field.name)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{field.name}</span>
                  {columnFilters[field.name] && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                      filtered
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenu>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(columnFilters).map(([column, value]) => (
              <Badge key={column} variant="secondary" className="gap-1">
                <span className="text-xs">
                  {column}: {value.slice(0, 20)}
                  {value.length > 20 && "..."}
                </span>
                <button
                  onClick={() => onClearColumnFilter(column)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Column Filter Modal */}
      {columnFilterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-4 max-w-md w-full mx-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filter: {columnFilterOpen}</h3>
              <button
                onClick={() => setColumnFilterOpen(null)}
                className="hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Filter value (supports exact match or multiple values separated by |)
                </label>
                <input
                  type="text"
                  value={columnFilters[columnFilterOpen] || ""}
                  onChange={(e) => onColumnFilterChange(columnFilterOpen, e.target.value)}
                  placeholder="e.g., value1|value2|value3"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Quick select (first 100 unique values):
                </label>
                <div className="max-h-[200px] overflow-y-auto border rounded-lg p-2 space-y-1">
                  {getColumnUniqueValues(columnFilterOpen).map((value) => (
                    <button
                      key={value}
                      onClick={() => {
                        const currentFilter = columnFilters[columnFilterOpen] || ""
                        const values = currentFilter.split("|").filter(Boolean)
                        if (values.includes(value)) {
                          onColumnFilterChange(
                            columnFilterOpen,
                            values.filter((v) => v !== value).join("|")
                          )
                        } else {
                          onColumnFilterChange(
                            columnFilterOpen,
                            [...values, value].join("|")
                          )
                        }
                      }}
                      className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-accent ${
                        (columnFilters[columnFilterOpen] || "")
                          .split("|")
                          .includes(value)
                          ? "bg-accent font-medium"
                          : ""
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClearColumnFilter(columnFilterOpen)
                    setColumnFilterOpen(null)
                  }}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setColumnFilterOpen(null)}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
