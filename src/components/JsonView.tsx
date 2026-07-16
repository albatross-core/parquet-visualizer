import type { ReactNode } from "react"

// Syntax-highlighted, recursively rendered JSON — dependency-free.

interface JsonViewProps {
  value: unknown
}

export function JsonView({ value }: JsonViewProps) {
  return (
    <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto">
      <JsonNode value={value} depth={0} />
    </pre>
  )
}

const indent = (depth: number) => "  ".repeat(depth)

function hasToJSON(value: object): value is { toJSON: () => unknown } {
  return typeof (value as { toJSON?: unknown }).toJSON === "function"
}

function JsonNode({ value, depth }: { value: unknown; depth: number }): ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-slate-500 italic">null</span>
  }
  if (typeof value === "boolean") {
    return <span className="text-purple-400">{String(value)}</span>
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return <span className="text-sky-400">{value.toString()}</span>
  }
  if (typeof value === "string") {
    return <span className="text-emerald-400">"{value}"</span>
  }
  if (value instanceof Date) {
    return <span className="text-emerald-400">"{value.toISOString()}"</span>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>[]</span>
    return (
      <>
        {"[\n"}
        {value.map((item, i) => (
          <span key={i}>
            {indent(depth + 1)}
            <JsonNode value={item} depth={depth + 1} />
            {i < value.length - 1 ? "," : ""}
            {"\n"}
          </span>
        ))}
        {indent(depth)}]
      </>
    )
  }
  if (typeof value === "object") {
    // Arrow structs and similar wrappers expose toJSON — unwrap to plain data
    if (hasToJSON(value)) {
      const unwrapped = value.toJSON()
      if (unwrapped !== value && (unwrapped === null || typeof unwrapped !== "object" || !hasToJSON(unwrapped as object))) {
        return <JsonNode value={unwrapped} depth={depth} />
      }
    }
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return <span>{"{}"}</span>
    return (
      <>
        {"{\n"}
        {entries.map(([key, entryValue], i) => (
          <span key={key}>
            {indent(depth + 1)}
            <span className="text-amber-300">"{key}"</span>
            {": "}
            <JsonNode value={entryValue} depth={depth + 1} />
            {i < entries.length - 1 ? "," : ""}
            {"\n"}
          </span>
        ))}
        {indent(depth)}
        {"}"}
      </>
    )
  }
  return <span>{String(value)}</span>
}
