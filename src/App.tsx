import { useState, useCallback } from "react"
import { FileDropzone } from "@/components/FileDropzone"
import { DataTable } from "@/components/DataTable"
import { SchemaViewer } from "@/components/SchemaViewer"
import { StatsCards } from "@/components/StatsCards"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileSpreadsheet,
  Table2,
  ListTree,
  X,
  Github,
  Loader2,
  Download,
} from "lucide-react"
import { readParquetFile, loadMoreParquetData, type ParquetData } from "@/lib/parquet"

type ViewMode = "data" | "schema"

export default function App() {
  const [data, setData] = useState<ParquetData | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("data")

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      // Determine initial load size based on file size
      const initialLimit = file.size > 10 * 1024 * 1024 ? 500 : 1000 // 500 rows for files >10MB

      const parquetData = await readParquetFile(file, initialLimit)
      setData(parquetData)
      setFileName(file.name)
      setCurrentFile(file)
    } catch (err) {
      console.error("Error reading parquet file:", err)
      setError(
        err instanceof Error ? err.message : "Failed to read parquet file"
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleLoadMore = useCallback(async () => {
    if (!currentFile || !data || !data.hasMore) return

    setIsLoadingMore(true)
    try {
      const batchSize = currentFile.size > 10 * 1024 * 1024 ? 500 : 1000
      const { rows: newRows, loadedRows, hasMore } = await loadMoreParquetData(
        currentFile,
        data.loadedRows,
        batchSize
      )

      setData({
        ...data,
        rows: [...data.rows, ...newRows],
        loadedRows,
        hasMore,
      })
    } catch (err) {
      console.error("Error loading more data:", err)
      setError(
        err instanceof Error ? err.message : "Failed to load more data"
      )
    } finally {
      setIsLoadingMore(false)
    }
  }, [currentFile, data])

  const handleReset = useCallback(() => {
    setData(null)
    setFileName("")
    setCurrentFile(null)
    setError(null)
    setViewMode("data")
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Parquet Visualizer</h1>
              <p className="text-xs text-muted-foreground">
                View and explore parquet files in your browser
              </p>
            </div>
          </div>

          <a
            href="https://github.com/albatross-core/parquet-visualizer"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!data && !isLoading && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">
                Visualize Your Parquet Files
              </h2>
              <p className="text-muted-foreground">
                Upload a parquet file to view its schema, metadata, and data.
                Everything happens in your browser - no data is sent to any
                server.
              </p>
            </div>

            <FileDropzone onFileSelect={handleFileSelect} isLoading={isLoading} />

            {error && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading parquet file...</p>
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    Showing {data.loadedRows.toLocaleString()} of {data.metadata.numRows.toLocaleString()} rows,{" "}
                    {data.columns.length} columns
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <X className="w-4 h-4 mr-1" />
                Close
              </Button>
            </div>

            {/* Warning for large files */}
            {data.hasMore && data.metadata.numRows > 10000 && (
              <Card className="border-amber-500/50 bg-amber-500/5">
                <CardContent className="p-4">
                  <p className="text-sm text-amber-700">
                    Large file detected. Data is loaded in batches for better performance.
                    {data.metadata.numRows > 100000 && " Consider loading only what you need."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <StatsCards metadata={data.metadata} />

            {/* View Switcher */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {viewMode === "data" ? "Data Preview" : "Schema"}
                  </CardTitle>
                  <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                    <Button
                      variant={viewMode === "data" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("data")}
                      className="gap-1"
                    >
                      <Table2 className="w-4 h-4" />
                      Data
                    </Button>
                    <Button
                      variant={viewMode === "schema" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("schema")}
                      className="gap-1"
                    >
                      <ListTree className="w-4 h-4" />
                      Schema
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === "data" ? (
                  <div className="space-y-4">
                    <DataTable data={data} />

                    {/* Load More Button */}
                    {data.hasMore && (
                      <div className="flex items-center justify-center gap-4 pt-4">
                        <Button
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          variant="outline"
                          className="gap-2"
                        >
                          {isLoadingMore ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Load More Rows
                            </>
                          )}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {(data.metadata.numRows - data.loadedRows).toLocaleString()} rows remaining
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <SchemaViewer schema={data.metadata.schema} />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Built with{" "}
            <a
              href="https://github.com/kylebarron/parquet-wasm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              parquet-wasm
            </a>
            . No data leaves your browser.
          </p>
        </div>
      </footer>
    </div>
  )
}
