import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ColumnFilters } from "@/components/ColumnFilters"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  Regex,
} from "lucide-react"
import type { ParquetData } from "@/lib/parquet"

interface DataTableProps {
  data: ParquetData
}

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [useRegex, setUseRegex] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [dataTypeFilter, setDataTypeFilter] = useState<string | null>(null)
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

  // Filter data based on column-specific filters
  const filteredRows = useMemo(() => {
    if (Object.keys(columnFilters).length === 0) return data.rows

    return data.rows.filter((row) => {
      return Object.entries(columnFilters).every(([column, filterValue]) => {
        if (!filterValue) return true

        const cellValue = String(row[column] ?? "")
        const filterValues = filterValue.split("|").filter(Boolean)

        return filterValues.some((val) => cellValue.includes(val))
      })
    })
  }, [data.rows, columnFilters])

  // Get visible columns based on filters
  const visibleColumns = useMemo(() => {
    let cols = data.columns

    // Filter by data type
    if (dataTypeFilter) {
      cols = cols.filter((col) => {
        const field = data.metadata.schema.find((f) => f.name === col)
        if (!field) return true

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
    }

    // Filter by visibility
    cols = cols.filter((col) => columnVisibility[col] !== false)

    return cols
  }, [data.columns, data.metadata.schema, dataTypeFilter, columnVisibility])

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    return visibleColumns.map((col) => ({
      accessorKey: col,
      header: ({ column }) => {
        const sortDirection = column.getIsSorted()
        return (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
            onClick={() => column.toggleSorting(sortDirection === "asc")}
          >
            {col}
            {sortDirection === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : sortDirection === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <ArrowUpDown className="w-4 h-4 opacity-50" />
            )}
            {columnFilters[col] && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                F
              </Badge>
            )}
          </button>
        )
      },
      cell: ({ getValue }) => {
        const value = getValue()
        if (value === null || value === undefined) {
          return <span className="text-muted-foreground italic">null</span>
        }
        if (typeof value === "boolean") {
          return (
            <span
              className={value ? "text-emerald-600" : "text-rose-600"}
            >
              {String(value)}
            </span>
          )
        }
        if (typeof value === "number") {
          return (
            <span className="font-mono text-blue-600">
              {value.toLocaleString()}
            </span>
          )
        }
        if (typeof value === "object") {
          return (
            <span className="font-mono text-xs text-muted-foreground max-w-[200px] truncate block">
              {JSON.stringify(value)}
            </span>
          )
        }
        const strValue = String(value)
        if (strValue.length > 100) {
          return (
            <span className="max-w-[300px] truncate block" title={strValue}>
              {strValue}
            </span>
          )
        }
        return strValue
      },
      filterFn: useRegex ? "auto" : "includesString",
    }))
  }, [visibleColumns, useRegex, columnFilters])

  // Custom global filter function that supports regex
  const globalFilterFn = useMemo(() => {
    if (!useRegex) return "includesString"

    return (row: any, columnId: string, filterValue: string) => {
      try {
        const regex = new RegExp(filterValue, "i")
        const value = row.getValue(columnId)
        return regex.test(String(value ?? ""))
      } catch {
        return String(row.getValue(columnId) ?? "")
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      }
    }
  }, [useRegex])

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: globalFilterFn,
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  })

  const filteredRowCount = table.getFilteredRowModel().rows.length
  const isFiltered = globalFilter.length > 0
  const hasColumnFilters = Object.keys(columnFilters).length > 0

  const handleColumnFilterChange = (column: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }))
  }

  const handleClearColumnFilter = (column: string) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[column]
      return newFilters
    })
  }

  return (
    <div className="space-y-4">
      {/* Advanced Filters */}
      <ColumnFilters
        schema={data.metadata.schema}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        dataTypeFilter={dataTypeFilter}
        onDataTypeFilterChange={setDataTypeFilter}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        onClearColumnFilter={handleClearColumnFilter}
        rows={data.rows}
      />

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={useRegex ? "Search with regex..." : "Search across all columns..."}
            className="w-full h-10 pl-9 pr-9 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant={useRegex ? "default" : "outline"}
          size="sm"
          onClick={() => setUseRegex(!useRegex)}
          className="gap-2"
          title="Toggle regex search"
        >
          <Regex className="w-4 h-4" />
          Regex
        </Button>

        {(isFiltered || hasColumnFilters) && (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Found {filteredRowCount.toLocaleString()} of {data.rows.length.toLocaleString()} rows
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {isFiltered || hasColumnFilters ? "No results found." : "No data."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            filteredRowCount
          )}{" "}
          of {filteredRowCount.toLocaleString()} {isFiltered || hasColumnFilters ? "filtered" : "loaded"} rows
          {data.hasMore && !isFiltered && !hasColumnFilters && ` (${data.metadata.numRows.toLocaleString()} total in file)`}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
