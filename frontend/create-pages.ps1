$routes = @(
    "crm/dashboard",
    "crm/pipeline",
    "crm/leads",
    "crm/proposals",
    "representatives",
    "representatives/commissions"
)

foreach ($route in $routes) {
    $dir = "src/app/$route"
    $file = "$dir/page.tsx"
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    
    $title = $route.Replace("/", " ").ToUpper()
    $content = @"
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-[var(--foreground)]">$title</h1>
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <p className="text-[var(--muted-foreground)]">Conteúdo em construção...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
"@
    Set-Content -Path $file -Value $content -Encoding UTF8
}
