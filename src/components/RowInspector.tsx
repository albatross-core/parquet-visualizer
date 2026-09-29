import { useCallback, useEffect, useMemo, useState } from "react"
import { X, Copy, Check, Braces, ChevronsDownUp, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JsonView } from "@/components/JsonView"
import { rowToJson, rowToObject } from "@/lib/json-view"

interface RowInspectorProps {
  row: Record<string, unknown>
  columns: string[]
  onClose: () => void
}

export function RowInspector({ row, columns, onClose }: RowInspectorProps) {
  const [copied, setCopied] = useState(false)
  // Remounting the view with a new key resets every node to `collapsed`
  const [fold, setFold] = useState({ key: 0, collapsed: false })
  const value = useMemo(() => rowToObject(row, columns), [row, columns])

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFold((f) => ({ key: f.key + 1, collapsed: !f.collapsed }))}
              className="gap-1"
            >
              {fold.collapsed ? <ChevronsUpDown className="w-4 h-4" /> : <ChevronsDownUp className="w-4 h-4" />}
              {fold.collapsed ? "Expand all" : "Collapse all"}
            </Button>
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

        <div className="overflow-y-auto px-6 py-4">
          <JsonView key={fold.key} value={value} defaultCollapsed={fold.collapsed} />
        </div>
      </div>
    </div>
  )
}
