import { useState, type ReactNode } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

// Syntax-highlighted, recursively rendered JSON — dependency-free.
// Objects and arrays fold on click; the root always stays open.

interface JsonViewProps {
  value: unknown
  // Initial fold state for every nested object and array
  defaultCollapsed?: boolean
}

export function JsonView({ value, defaultCollapsed = false }: JsonViewProps) {
  return (
    <pre className="relative p-3 pl-7 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto">
      <JsonNode value={value} depth={0} defaultCollapsed={defaultCollapsed} />
    </pre>
  )
}

const indent = (depth: number) => "  ".repeat(depth)

// JSON-escape a string but keep real line breaks, indenting continuation
// lines one level deeper than the key so multi-line text stays readable.
const formatString = (value: string, depth: number) =>
  '"' +
  value
    .split("\n")
    .map((line) => JSON.stringify(line).slice(1, -1))
    .join("\n" + indent(depth + 1)) +
  '"'

function hasToJSON(value: object): value is { toJSON: () => unknown } {
  return typeof (value as { toJSON?: unknown }).toJSON === "function"
}

interface NodeProps {
  value: unknown
  depth: number
  defaultCollapsed: boolean
}

// Chevron for a foldable node. Absolute with only `left` set, so it keeps
// its line's vertical position but sits in the gutter like an editor fold.
function FoldToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const Icon = collapsed ? ChevronRight : ChevronDown
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand" : "Collapse"}
      aria-expanded={!collapsed}
      className="absolute left-2 mt-1 text-slate-500 hover:text-slate-200"
    >
      <Icon className="w-3 h-3" />
    </button>
  )
}

function Collapsed({ open, close, hint, onToggle }: { open: string; close: string; hint: string; onToggle: () => void }) {
  return (
    <>
      <FoldToggle collapsed onToggle={onToggle} />
      <span onClick={onToggle} className="cursor-pointer hover:bg-slate-800 rounded px-0.5">
        {open}
        <span className="text-slate-500">…</span>
        {close}
        <span className="text-slate-500 ml-2">{hint}</span>
      </span>
    </>
  )
}

function JsonNode({ value, depth, defaultCollapsed }: NodeProps): ReactNode {
  // Nested containers start folded when requested; the root never folds.
  const [collapsed, setCollapsed] = useState(depth > 0 && defaultCollapsed)
  const toggle = () => setCollapsed((c) => !c)
  const foldable = depth > 0

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
    return <span className="text-emerald-400">{formatString(value, depth)}</span>
  }
  if (value instanceof Date) {
    return <span className="text-emerald-400">"{value.toISOString()}"</span>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>[]</span>
    if (collapsed) {
      return <Collapsed open="[" close="]" hint={`${value.length} items`} onToggle={toggle} />
    }
    return (
      <>
        {foldable && <FoldToggle collapsed={false} onToggle={toggle} />}
        {"[\n"}
        {value.map((item, i) => (
          <span key={i}>
            {indent(depth + 1)}
            <JsonNode value={item} depth={depth + 1} defaultCollapsed={defaultCollapsed} />
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
        return <JsonNode value={unwrapped} depth={depth} defaultCollapsed={defaultCollapsed} />
      }
    }
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return <span>{"{}"}</span>
    if (collapsed) {
      return <Collapsed open="{" close="}" hint={`${entries.length} keys`} onToggle={toggle} />
    }
    return (
      <>
        {foldable && <FoldToggle collapsed={false} onToggle={toggle} />}
        {"{\n"}
        {entries.map(([key, entryValue], i) => (
          <span key={key}>
            {indent(depth + 1)}
            <span className="text-amber-300">{JSON.stringify(key)}</span>
            {": "}
            <JsonNode value={entryValue} depth={depth + 1} defaultCollapsed={defaultCollapsed} />
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
