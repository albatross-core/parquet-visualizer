import { useCallback, useEffect, useState } from "react"
import { X, Copy, Check, Braces } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { JsonView } from "@/components/JsonView"
import { tryParseJson, rowToJson } from "@/lib/json-view"

interface RowInspectorProps {
  row: Record<string, unknown>
  columns: string[]
  onClose: () => void
}

export function RowInspector({ row, columns, onClose }: RowInspectorProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(rowToJson(row, columns))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — nothing to do
    }
  }, [row, columns])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Row details"
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Braces className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Row Details</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy JSON
                </>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-4">
          {columns.map((col) => {
            const value = row[col]
            const parsed = tryParseJson(value)
            const isObject =
              parsed !== undefined ||
              (value !== null && typeof value === "object" && !(value instanceof Date))

            return (
              <div key={col} className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{col}</p>
                  {parsed !== undefined && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                      JSON
                    </Badge>
                  )}
                </div>
                {isObject ? (
                  <JsonView value={parsed !== undefined ? parsed : value} />
                ) : (
                  <RowValue value={value} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function RowValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <p className="text-sm text-muted-foreground italic">null</p>
  }
  if (typeof value === "boolean") {
    return (
      <p className={`text-sm font-mono ${value ? "text-emerald-600" : "text-rose-600"}`}>
        {String(value)}
      </p>
    )
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return <p className="text-sm font-mono text-blue-600">{value.toLocaleString()}</p>
  }
  if (value instanceof Date) {
    return <p className="text-sm font-mono">{value.toISOString()}</p>
  }
  return <p className="text-sm break-all whitespace-pre-wrap">{String(value)}</p>
}
