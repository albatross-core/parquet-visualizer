import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Hash, Type, AlertCircle } from "lucide-react"
import type { ParquetSchema } from "@/lib/parquet"

interface SchemaViewerProps {
  schema: ParquetSchema[]
}

function getTypeBadgeVariant(type: string): "default" | "secondary" | "success" | "warning" | "info" {
  const lowerType = type.toLowerCase()
  if (lowerType.includes("int") || lowerType.includes("float") || lowerType.includes("double") || lowerType.includes("decimal")) {
    return "info"
  }
  if (lowerType.includes("string") || lowerType.includes("utf8") || lowerType.includes("varchar")) {
    return "success"
  }
  if (lowerType.includes("bool")) {
    return "warning"
  }
  if (lowerType.includes("timestamp") || lowerType.includes("date") || lowerType.includes("time")) {
    return "secondary"
  }
  return "default"
}

export function SchemaViewer({ schema }: SchemaViewerProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Hash className="w-4 h-4" />
            </TableHead>
            <TableHead>Column Name</TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                <Type className="w-4 h-4" />
                Type
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Nullable
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schema.map((field, index) => (
            <TableRow key={field.name}>
              <TableCell className="text-muted-foreground font-mono text-xs">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium">{field.name}</TableCell>
              <TableCell>
                <Badge variant={getTypeBadgeVariant(field.type)}>
                  {field.type}
                </Badge>
              </TableCell>
              <TableCell>
                {field.nullable ? (
                  <span className="text-amber-600">Yes</span>
                ) : (
                  <span className="text-emerald-600">No</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
