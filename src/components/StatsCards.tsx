import { Card, CardContent } from "@/components/ui/card"
import { Rows3, Columns3, Layers, HardDrive } from "lucide-react"
import { formatBytes, formatNumber } from "@/lib/utils"
import type { ParquetMetadata } from "@/lib/parquet"

interface StatsCardsProps {
  metadata: ParquetMetadata
}

export function StatsCards({ metadata }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Rows",
      value: formatNumber(metadata.numRows),
      icon: Rows3,
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "Columns",
      value: formatNumber(metadata.schema.length),
      icon: Columns3,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Row Groups",
      value: formatNumber(metadata.numRowGroups),
      icon: Layers,
      color: "text-purple-600 bg-purple-500/10",
    },
    {
      label: "File Size",
      value: formatBytes(metadata.fileSize),
      icon: HardDrive,
      color: "text-amber-600 bg-amber-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
