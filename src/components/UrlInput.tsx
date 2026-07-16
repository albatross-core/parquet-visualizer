import { useCallback, useState } from "react"
import { Link2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { validateParquetUrl } from "@/lib/parquet-url"

interface UrlInputProps {
  onUrlSubmit: (url: string) => void
  isLoading?: boolean
}

export function UrlInput({ onUrlSubmit, isLoading }: UrlInputProps) {
  const [value, setValue] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = useCallback(() => {
    const result = validateParquetUrl(value)
    if (!result.ok) {
      setValidationError(result.reason)
      return
    }
    setValidationError(null)
    onUrlSubmit(result.url)
  }, [value, onUrlSubmit])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="url"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setValidationError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit()
            }}
            placeholder="Open from URL — https://bucket.s3.amazonaws.com/data.parquet or a presigned URL"
            disabled={isLoading}
            className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          />
        </div>
        <Button onClick={handleSubmit} disabled={isLoading || !value.trim()} className="gap-1">
          Open
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Files are read with HTTP range requests — only the parts you view are
        downloaded. Data never leaves your browser.
      </p>
    </div>
  )
}
