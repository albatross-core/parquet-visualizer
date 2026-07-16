import { useCallback, useState } from "react"
import { ShieldAlert, AlertCircle, Copy, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { s3CorsSnippet } from "@/lib/parquet-url"

interface LoadErrorCardProps {
  /** Raw error message from the failed load (e.g. "Failed to fetch"). */
  message: string
  /** Whether the failure looks like a cross-origin (CORS) block. */
  isCors: boolean
}

export function LoadErrorCard({ message, isCors }: LoadErrorCardProps) {
  if (isCors) {
    return <CorsErrorCard />
  }

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex items-start gap-3 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">
            Couldn't open this file
          </p>
          <p className="text-sm text-muted-foreground break-words">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CorsErrorCard() {
  const origin = window.location.origin
  const snippet = s3CorsSnippet(origin)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be unavailable (insecure context / permissions);
      // the snippet is still selectable by hand, so fail quietly.
    }
  }, [snippet])

  return (
    <Card className="border-amber-500/50 bg-amber-500/5">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-amber-800">
              The server blocked this request (CORS)
            </p>
            <p className="text-sm text-muted-foreground">
              The file's server didn't allow this app (
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                {origin}
              </code>
              ) to read it from your browser. This is a one-time setting on the
              bucket — the app can't work around it, because your browser
              enforces it for security.
            </p>
          </div>
        </div>

        <div className="space-y-3 pl-8">
          <p className="text-sm font-medium">To fix it on an S3 bucket:</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>
              Open the <strong>S3 console</strong> and select your bucket.
            </li>
            <li>
              Go to <strong>Permissions</strong> →{" "}
              <strong>Cross-origin resource sharing (CORS)</strong> →{" "}
              <strong>Edit</strong>.
            </li>
            <li>Paste the policy below and save.</li>
          </ol>

          <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 pr-12 text-xs leading-relaxed">
              {snippet}
            </pre>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              aria-label="Copy CORS policy"
              className="absolute right-1.5 top-1.5 h-8 w-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Already using a bucket URL? CORS only grants the browser permission
            to <em>ask</em> — private objects still need a presigned URL. And
            <code className="mx-1 rounded bg-muted px-1 py-0.5">
              ExposeHeaders
            </code>
            must include <code className="rounded bg-muted px-1 py-0.5">Content-Range</code>{" "}
            or the file size won't show.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
