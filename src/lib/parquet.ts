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
}

let wasmInitialized = false

export async function initParquet() {
  if (!wasmInitialized) {
    await initWasm(wasmUrl)
    wasmInitialized = true
  }
}

export async function readParquetFile(file: File): Promise<ParquetData> {
  await initParquet()

  // Open the parquet file
  const parquetFile = await ParquetFile.fromFile(file)

  // Get metadata
  const parquetMetadata = parquetFile.metadata()
  const fileMetadata = parquetMetadata.fileMetadata()
  const numRows = Number(fileMetadata.numRows())
  const numRowGroups = parquetMetadata.numRowGroups()

  // Read the table
  const wasmTable = await parquetFile.read()

  // Convert to Arrow IPC and parse with apache-arrow
  const ipcStream = wasmTable.intoIPCStream()
  const arrowTable = tableFromIPC(ipcStream)

  // Extract schema
  const arrowSchema = arrowTable.schema
  const schemaInfo: ParquetSchema[] = arrowSchema.fields.map((field) => ({
    name: field.name,
    type: String(field.type),
    nullable: field.nullable,
  }))

  // Get column names
  const columns = arrowSchema.fields.map((field) => field.name)

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

  return {
    columns,
    rows,
    metadata: {
      numRows,
      numRowGroups,
      schema: schemaInfo,
      fileSize: file.size,
    },
  }
}
