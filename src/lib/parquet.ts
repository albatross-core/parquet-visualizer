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
  // null when the source is a URL whose server doesn't report a size
  fileSize: number | null
}

// A Parquet file to read: either a local File or a remote URL. Remote
// sources are read with HTTP range requests, so only the footer and the
// row groups actually viewed are downloaded.
export type ParquetSource = File | { url: string }

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

async function openParquet(source: ParquetSource): Promise<ParquetFile> {
  if (source instanceof File) {
    return ParquetFile.fromFile(source)
  }
  return ParquetFile.fromUrl(source.url)
}

// Best-effort size lookup for remote sources. Uses a 1-byte range GET
// rather than HEAD because presigned URLs are signed for GET only.
async function getSourceSize(source: ParquetSource): Promise<number | null> {
  if (source instanceof File) {
    return source.size
  }
  try {
    const res = await fetch(source.url, { headers: { Range: "bytes=0-0" } })
    const contentRange = res.headers.get("Content-Range")
    if (contentRange) {
      const total = contentRange.split("/")[1]
      if (total && total !== "*") {
        return Number(total)
      }
    }
    const contentLength = res.headers.get("Content-Length")
    if (res.status === 200 && contentLength) {
      return Number(contentLength)
    }
    return null
  } catch {
    return null
  }
}

// Read metadata and schema only (fast)
export async function readParquetMetadata(source: ParquetSource): Promise<ParquetMetadata> {
  await initParquet()

  const parquetFile = await openParquet(source)

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
    fileSize: await getSourceSize(source),
  }
}

// Read data with pagination support
export async function readParquetData(
  source: ParquetSource,
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

  const parquetFile = await openParquet(source)

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
  source: ParquetSource,
  initialLimit: number = 1000
): Promise<ParquetData> {
  await initParquet()

  // Read metadata first
  const metadata = await readParquetMetadata(source)

  // Then read initial data
  const { rows, columns, loadedRows, hasMore } = await readParquetData(source, {
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
  source: ParquetSource,
  currentOffset: number,
  batchSize: number = 1000
): Promise<{
  rows: Record<string, unknown>[]
  loadedRows: number
  hasMore: boolean
}> {
  const { rows, loadedRows, hasMore } = await readParquetData(source, {
    limit: batchSize,
    offset: currentOffset,
  })

  return { rows, loadedRows, hasMore }
}
