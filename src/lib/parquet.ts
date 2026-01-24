import initWasm, { ParquetFile } from "parquet-wasm"
import { tableFromIPC } from "apache-arrow"
// @ts-ignore - WASM import
import wasmUrl from "parquet-wasm/esm/parquet_wasm_bg.wasm?url"

export interface ParquetSchema {
  name: string
  type: string
  nullable: boolean
}

export interface ParquetMetadata {
  numRows: number
  numRowGroups: number
  schema: ParquetSchema[]
  fileSize: number
}

export interface ParquetData {
  columns: string[]
  rows: Record<string, unknown>[]
  metadata: ParquetMetadata
  hasMore: boolean
  loadedRows: number
}

export interface ReadOptions {
  limit?: number
  offset?: number
}

let wasmInitialized = false

export async function initParquet() {
  if (!wasmInitialized) {
    await initWasm(wasmUrl)
    wasmInitialized = true
  }
}

// Read metadata and schema only (fast)
export async function readParquetMetadata(file: File): Promise<ParquetMetadata> {
  await initParquet()

  const parquetFile = await ParquetFile.fromFile(file)

  // Get metadata
  const parquetMetadata = parquetFile.metadata()
  const fileMetadata = parquetMetadata.fileMetadata()
  const numRows = Number(fileMetadata.numRows())
  const numRowGroups = parquetMetadata.numRowGroups()

  // Get schema by reading a small sample
  const wasmSchema = parquetFile.schema()
  const ipcStream = wasmSchema.intoIPCStream()
  const schemaTable = tableFromIPC(ipcStream)

  const schemaInfo: ParquetSchema[] = schemaTable.schema.fields.map((field) => ({
    name: field.name,
    type: String(field.type),
    nullable: field.nullable,
  }))

  parquetFile.free()

  return {
    numRows,
    numRowGroups,
    schema: schemaInfo,
    fileSize: file.size,
  }
}

// Read data with pagination support
export async function readParquetData(
  file: File,
  options: ReadOptions = {}
): Promise<{
  rows: Record<string, unknown>[]
  columns: string[]
  totalRows: number
  loadedRows: number
  hasMore: boolean
}> {
  await initParquet()

  const { limit = 1000, offset = 0 } = options

  const parquetFile = await ParquetFile.fromFile(file)

  // Get total rows
  const parquetMetadata = parquetFile.metadata()
  const fileMetadata = parquetMetadata.fileMetadata()
  const totalRows = Number(fileMetadata.numRows())

  // Read the table with limit and offset
  const wasmTable = await parquetFile.read({
    limit,
    offset,
  })

  // Convert to Arrow IPC and parse with apache-arrow
  const ipcStream = wasmTable.intoIPCStream()
  const arrowTable = tableFromIPC(ipcStream)

  // Get column names
  const columns = arrowTable.schema.fields.map((field) => field.name)

  // Convert Arrow table to array of objects
  const rows: Record<string, unknown>[] = []

  for (let i = 0; i < arrowTable.numRows; i++) {
    const row: Record<string, unknown> = {}
    for (const column of columns) {
      const col = arrowTable.getChild(column)
      if (col) {
        row[column] = col.get(i)
      }
    }
    rows.push(row)
  }

  // Cleanup
  parquetFile.free()

  const loadedRows = offset + rows.length
  const hasMore = loadedRows < totalRows

  return {
    rows,
    columns,
    totalRows,
    loadedRows,
    hasMore,
  }
}

// Convenience function for initial load
export async function readParquetFile(
  file: File,
  initialLimit: number = 1000
): Promise<ParquetData> {
  await initParquet()

  // Read metadata first
  const metadata = await readParquetMetadata(file)

  // Then read initial data
  const { rows, columns, loadedRows, hasMore } = await readParquetData(file, {
    limit: initialLimit,
    offset: 0,
  })

  return {
    columns,
    rows,
    metadata,
    hasMore,
    loadedRows,
  }
}

// Load more data incrementally
export async function loadMoreParquetData(
  file: File,
  currentOffset: number,
  batchSize: number = 1000
): Promise<{
  rows: Record<string, unknown>[]
  loadedRows: number
  hasMore: boolean
}> {
  const { rows, loadedRows, hasMore } = await readParquetData(file, {
    limit: batchSize,
    offset: currentOffset,
  })

  return { rows, loadedRows, hasMore }
}
