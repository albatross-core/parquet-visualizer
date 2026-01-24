import { useCallback, useState } from "react"
import { Upload, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
}

export function FileDropzone({ onFileSelect, isLoading }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.name.endsWith(".parquet")) {
          onFileSelect(file)
        }
      }
    },
    [onFileSelect]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        onFileSelect(files[0])
      }
    },
    [onFileSelect]
  )

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer group",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        isLoading && "pointer-events-none opacity-60"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".parquet"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        disabled={isLoading}
      />

      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <div
          className={cn(
            "p-4 rounded-2xl transition-all duration-300",
            isDragging
              ? "bg-primary text-primary-foreground scale-110"
              : "bg-muted group-hover:bg-primary/10"
          )}
        >
          {isDragging ? (
            <FileSpreadsheet className="w-10 h-10" />
          ) : (
            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragging ? "Drop your file here" : "Upload a Parquet file"}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to browse
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileSpreadsheet className="w-4 h-4" />
          <span>.parquet files supported</span>
        </div>
      </div>
    </div>
  )
}
